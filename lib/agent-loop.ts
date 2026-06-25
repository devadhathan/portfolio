import type { AgentCommand, SectionPriority } from '@/lib/agent';
import { CARD_ID_LIST, CARD_REGISTRY } from '@/lib/gen-ui-registry';

export const MAX_AGENT_ITERATIONS = 5;

export const PORTFOLIO_SECTION_IDS = [
  'hero',
  'preferences',
  'photos',
  'experience',
  'video',
  'philosophy',
  'connect',
  'last-portfolio-version',
] as const;

export type AgentLoopStep = {
  tool: string;
  args: Record<string, unknown>;
  result: string;
};

export type LayoutActionCommand = AgentCommand | { type: 'reset' };

export type AgentLoopResult = {
  message: string;
  cardIds: string[];
  layoutCommands: LayoutActionCommand[];
  steps: AgentLoopStep[];
  iterations: number;
};

type ToolContext = {
  mode: 'ask' | 'agent';
  cardIds: string[];
  layoutCommands: LayoutActionCommand[];
  steps: AgentLoopStep[];
  sections: Array<{ id: string; title: string; visible: boolean; priority: string; order: number }>;
};

export function getAgentTools(mode: 'ask' | 'agent') {
  const tools: Array<{
    type: 'function';
    function: { name: string; description: string; parameters: Record<string, unknown> };
  }> = [
    {
      type: 'function',
      function: {
        name: 'show_cards',
        description:
          'Display curated portfolio cards in the UI. Use exact card IDs from the registry. Call this when the user asks to see metrics, projects, skills, charts, or visuals.',
        parameters: {
          type: 'object',
          properties: {
            card_ids: {
              type: 'array',
              items: { type: 'string' },
              description: `Card IDs to show. Valid IDs: ${CARD_ID_LIST.join(', ')}`,
            },
            reason: { type: 'string', description: 'Brief note on why these cards match the request' },
          },
          required: ['card_ids'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_portfolio_sections',
        description: 'Read the current portfolio bento layout — which sections exist, visibility, priority, and order.',
        parameters: { type: 'object', properties: {} },
      },
    },
  ];

  if (mode === 'agent') {
    tools.push({
      type: 'function',
      function: {
        name: 'layout_action',
        description:
          'Modify the portfolio bento grid layout. Use hide/show to toggle sections, prioritize to change emphasis, reorder to move sections, reset to restore defaults.',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['hide', 'show', 'prioritize', 'reorder', 'reset'],
            },
            section_id: {
              type: 'string',
              enum: [...PORTFOLIO_SECTION_IDS],
              description: 'Required for hide, show, prioritize, reorder',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Required when action is prioritize',
            },
            order: {
              type: 'number',
              description: 'Target position (1-based) when action is reorder',
            },
          },
          required: ['action'],
        },
      },
    });
  }

  return tools;
}

function executeTool(name: string, args: Record<string, unknown>, ctx: ToolContext): string {
  if (name === 'get_portfolio_sections') {
    return JSON.stringify({
      sections: ctx.sections,
      available_section_ids: PORTFOLIO_SECTION_IDS,
    });
  }

  if (name === 'show_cards') {
    const raw = Array.isArray(args.card_ids) ? (args.card_ids as string[]) : [];
    const valid = raw.filter((id) => CARD_REGISTRY[id]);
    const invalid = raw.filter((id) => !CARD_REGISTRY[id]);
    valid.forEach((id) => {
      if (!ctx.cardIds.includes(id)) ctx.cardIds.push(id);
    });
    return JSON.stringify({
      ok: true,
      displayed: valid,
      skipped_invalid: invalid,
      total_cards_now: ctx.cardIds.length,
    });
  }

  if (name === 'layout_action' && ctx.mode === 'agent') {
    const action = args.action as string;

    if (action === 'reset') {
      ctx.layoutCommands.push({ type: 'reset' });
      return JSON.stringify({ ok: true, action: 'reset', message: 'Layout will reset to default sections' });
    }

    const sectionId = args.section_id as string | undefined;
    if (!sectionId || !PORTFOLIO_SECTION_IDS.includes(sectionId as (typeof PORTFOLIO_SECTION_IDS)[number])) {
      return JSON.stringify({ ok: false, error: `Invalid section_id. Use one of: ${PORTFOLIO_SECTION_IDS.join(', ')}` });
    }

    if (action === 'hide') {
      ctx.layoutCommands.push({ type: 'hide', sectionId });
      return JSON.stringify({ ok: true, action: 'hide', section_id: sectionId });
    }
    if (action === 'show') {
      ctx.layoutCommands.push({ type: 'show', sectionId });
      return JSON.stringify({ ok: true, action: 'show', section_id: sectionId });
    }
    if (action === 'prioritize') {
      const priority = args.priority as SectionPriority | undefined;
      if (!priority || !['high', 'medium', 'low'].includes(priority)) {
        return JSON.stringify({ ok: false, error: 'priority must be high, medium, or low' });
      }
      ctx.layoutCommands.push({ type: 'prioritize', sectionId, priority });
      return JSON.stringify({ ok: true, action: 'prioritize', section_id: sectionId, priority });
    }
    if (action === 'reorder') {
      const order = typeof args.order === 'number' ? args.order : undefined;
      if (!order || order < 1) {
        return JSON.stringify({ ok: false, error: 'order must be a positive number' });
      }
      ctx.layoutCommands.push({ type: 'reorder', sectionId, order });
      return JSON.stringify({ ok: true, action: 'reorder', section_id: sectionId, order });
    }

    return JSON.stringify({ ok: false, error: `Unknown action: ${action}` });
  }

  return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
}

type OpenAIMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> }
  | { role: 'tool'; tool_call_id: string; content: string };

export function buildAgentSystemPrompt(mode: 'ask' | 'agent'): string {
  const base = `You are Devadhathan's portfolio assistant — a Product Designer with 5+ years experience.

EXPERIENCE HIGHLIGHTS:
- Wordsmith AI (2026), Nesoi.ai (+92% engagement, -37% course time), Ditto Insurance (+17% conversion, Falcon Design System), Finshots (100k+ downloads, Google Play Best App 2020)

AVAILABLE CARD IDS (use only these exact strings in show_cards):
${CARD_ID_LIST.join(', ')}

WORKFLOW — AGENTIC LOOP:
1. Think about what the user wants.
2. Call tools to gather state or take action (show_cards, get_portfolio_sections${mode === 'agent' ? ', layout_action' : ''}).
3. You may call multiple tools across turns before replying.
4. When done, respond with a friendly 2-4 sentence summary (no tool calls on the final turn).

RULES:
- Always use show_cards for metrics, projects, skills, charts, images — never invent data.
- Pick 2-6 relevant card IDs per show_cards call.
- For layout requests${mode === 'agent' ? ' (hide photos, prioritize experience, etc.) use layout_action. Call get_portfolio_sections first if unsure of current state' : ', explain that layout changes require Agent mode'}.`;

  if (mode === 'agent') {
    return `${base}

AGENT MODE: Cards appear in the center of the portfolio page. You can also rearrange the bento grid with layout_action.
Section IDs: ${PORTFOLIO_SECTION_IDS.join(', ')}`;
  }

  return `${base}

ASK MODE: Cards appear inline in the chat. Do not use layout_action.`;
}

export async function runAgentLoop(options: {
  apiKey: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  mode: 'ask' | 'agent';
  sections: ToolContext['sections'];
}): Promise<AgentLoopResult> {
  const ctx: ToolContext = {
    mode: options.mode,
    cardIds: [],
    layoutCommands: [],
    steps: [],
    sections: options.sections,
  };

  const openAIMessages: OpenAIMessage[] = [
    { role: 'system', content: buildAgentSystemPrompt(options.mode) },
    ...options.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let iterations = 0;
  let finalMessage = '';

  for (let i = 0; i < MAX_AGENT_ITERATIONS; i++) {
    iterations = i + 1;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        tools: getAgentTools(options.mode),
        tool_choice: 'auto',
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || 'OpenAI request failed');
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    if (!choice) throw new Error('No response from model');

    openAIMessages.push(choice);

    if (choice.tool_calls?.length) {
      for (const toolCall of choice.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          args = {};
        }
        const result = executeTool(toolCall.function.name, args, ctx);
        ctx.steps.push({ tool: toolCall.function.name, args, result });
        openAIMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }
      continue;
    }

    finalMessage = (choice.content || '').trim();
    break;
  }

  if (!finalMessage) {
    finalMessage =
      ctx.cardIds.length > 0
        ? "Here's what I pulled together for you."
        : 'I finished processing your request.';
  }

  return {
    message: finalMessage,
    cardIds: ctx.cardIds,
    layoutCommands: ctx.layoutCommands,
    steps: ctx.steps,
    iterations,
  };
}
