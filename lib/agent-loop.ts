import type { AgentCommand, SectionPriority } from '@/lib/agent';
import { CARD_ID_LIST, CARD_REGISTRY } from '@/lib/gen-ui-registry';
import { STARTER_CHIP_CARD_IDS } from '@/lib/gen-ui-starter-chips';
import { MAX_VIEWPORT_CARDS } from '@/lib/gen-ui-constants';

export const MAX_AGENT_ITERATIONS = 5;

export const PORTFOLIO_SECTION_IDS = [
  'hero',
  'side-project',
  'projects',
  'photos',
  'experience',
  'video',
  'connect',
  'finshots-award',
] as const;

export type AgentLoopStep = {
  tool: string;
  args: Record<string, unknown>;
  result: string;
};

export type LayoutActionCommand = AgentCommand | { type: 'reset' };

export { MAX_VIEWPORT_CARDS };

export type AgentLoopResult = {
  message: string;
  cardIds: string[];
  layoutCommands: LayoutActionCommand[];
  steps: AgentLoopStep[];
  iterations: number;
  buildViewport: boolean;
};

type ToolContext = {
  mode: 'ask' | 'agent';
  cardIds: string[];
  buildViewport: boolean;
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
        name: 'get_portfolio_sections',
        description: 'Read the current portfolio bento layout — which sections exist, visibility, priority, and order.',
        parameters: { type: 'object', properties: {} },
      },
    },
  ];

  if (mode === 'ask') {
    tools.unshift({
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
    });
  }

  if (mode === 'agent') {
    tools.push({
      type: 'function',
      function: {
        name: 'build_gen_ui_view',
        description:
          'Create a Gen UI viewport in the center canvas. Call when the user\'s intent is clear. Pick exactly 1, 3, 6, or 9 card IDs (grid layouts: 1×1, 1×3, 2×3, or 3×3) — match cards intelligently to the request.',
        parameters: {
          type: 'object',
          properties: {
            card_ids: {
              type: 'array',
              items: { type: 'string' },
              description: `Exactly 1, 3, 6, or 9 card IDs for a balanced grid. Valid IDs: ${CARD_ID_LIST.join(', ')}`,
            },
            reason: { type: 'string', description: 'Brief note on what this viewport covers' },
          },
          required: ['card_ids'],
        },
      },
    });
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
    const valid = raw.filter((id) => CARD_REGISTRY[id]).slice(0, MAX_VIEWPORT_CARDS);
    const invalid = raw.filter((id) => !CARD_REGISTRY[id]);

    if (ctx.mode === 'agent') {
      ctx.cardIds = valid;
      ctx.buildViewport = valid.length > 0;
      return JSON.stringify({
        ok: true,
        built: valid,
        skipped_invalid: invalid,
        message: 'Gen UI viewport will be created with these cards',
      });
    }

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

  if (name === 'build_gen_ui_view' && ctx.mode === 'agent') {
    const raw = Array.isArray(args.card_ids) ? (args.card_ids as string[]) : [];
    const valid = raw.filter((id) => CARD_REGISTRY[id]).slice(0, MAX_VIEWPORT_CARDS);
    const invalid = raw.filter((id) => !CARD_REGISTRY[id]);
    ctx.cardIds = valid;
    ctx.buildViewport = valid.length > 0;
    return JSON.stringify({
      ok: true,
      built: valid,
      skipped_invalid: invalid,
      capped_at: MAX_VIEWPORT_CARDS,
      message: 'Gen UI viewport will be created with these cards',
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
  return `You are Dev's portfolio assistant. People come here to figure out whether to hire him, work with him, or talk to him. Your job is to surface the right work for the question and get out of the way.

# Modes

- **Ask mode** — cards render inline in chat alongside your reply.
- **Gen UI mode** — cards build a viewport. Your reply stays short or empty; the viewport carries the answer.

# Routing — what to show for what

Match by intent, not exact wording.

| Intent | Cards |
|---|---|
| Overview / "his projects" / "selected work" / "all work" | case:finshots-news-app:project, case:nesoi-ai-dashboard:project, case:falcon-design-system:project, case:crm-redesign:project, case:onboarding-redesign:project, chart:impact |
| Specific project (Finshots, Nesoi, Falcon, CRM, Onboarding) | case:{slug}:project + case:{slug}:impact + 1 chart or stat + 1 image or video from case:{slug}:* |
| Impact / results / "his numbers" | ${STARTER_CHIP_CARD_IDS.impact.join(', ')} |
| Strongest work | ${STARTER_CHIP_CARD_IDS.strongest.join(', ')} |
| Can he ship code / designer-engineer / stack | ${STARTER_CHIP_CARD_IDS['ship-code'].join(', ')} |
| Why hire him | ${STARTER_CHIP_CARD_IDS.hire.join(', ')} |
| Career / roles / experience / "what he did" | feature:career |
| Companies / employers / "where he worked" | timeline:ditto-finshots, timeline:nesoi, timeline:wordsmith |
| Contact / email / LinkedIn / phone | feature:connect |
| Education / degrees / certifications | feature:education, info:cert:google, info:cert:ibm |
| Wordsmith — any mention | info:wordsmith-locked, feature:wordsmith-locked. Tell them to contact Dev for more. Nothing else, ever. |
| Off-topic (recipes, sports, science trivia, general knowledge) | No cards. One short sentence redirecting to Dev's work. |

If the intent doesn't fit cleanly, pick the closest row. Lean toward project cards over loose stats.

# Clarify vs build

Ask one short question only when the request is genuinely vague *and* could go meaningfully different directions. "Tell me about Dev" is vague — ask whether they want projects, impact, or background. "Show his projects" is not vague — it's the overview row.

Starter chips, named projects, layout changes, and Wordsmith never get a clarifying question. Build immediately.

# Voice

Minimal with all the relevant details, concrete. No "explore the cards below." No teasing what the card will show. No recapping what the card already shows.

Gen UI after building: empty reply, or one line under twelve words. Ask mode: a sentence or two of context, then the cards carry it. Three-paragraph case-study narratives only when explicitly asked for a written deep-dive.

# Examples

**Ask — specific project**
> User: Tell me about the Finshots app.
> → show_cards: case:finshots-news-app:project, case:finshots-news-app:impact, image:case:finshots-news-app:hero
> Reply: Finshots was Dev's mobile app design at Tacterial — the parent company that later launched Ditto Insurance. Won Google Play Best App 2020 and crossed 100k downloads.

**Ask — overview**
> User: What's his selected work?
> → show_cards: case:finshots-news-app:project, case:nesoi-ai-dashboard:project, case:falcon-design-system:project, case:crm-redesign:project, case:onboarding-redesign:project, chart:impact
> Reply: Five projects across fintech, insurance, and AI tooling. Impact summary at the end.

**Gen UI — clarifying**
> User: Tell me about Dev.
> Reply: Happy to. Project tour, impact numbers, or background and career path?

**Gen UI — starter chip**
> User: Why hire him?
> → build_gen_ui_view: ${STARTER_CHIP_CARD_IDS.hire.join(', ')}
> Reply: (empty)

**Off-topic**
> User: Is the earth flat?
> Reply: Out of my lane on that one — I'm here for questions about Dev. Want to ask about his projects, impact, or career?

**Wordsmith**
> User: What did he do at Wordsmith AI?
> → show_cards: info:wordsmith-locked, feature:wordsmith-locked
> Reply: Wordsmith's under wraps — Dev can share more directly. Best to reach out.

# Grid

Pick 1, 3, 6, or 9 cards per call. If the natural answer is 2 or 4, add a relevant chart or image from the same case study — not an unrelated stat.

# Context

- Finshots (2019) and Ditto Insurance (2021) are both products of Tacterial Consultancy. Finshots won Google Play Best App 2020. Don't conflate the timelines or treat them as separate companies.
- Use case:{slug}:* IDs only. Legacy project:* and standalone image:* IDs are deprecated.
- Numbers you can reference in prose when relevant: Nesoi +92% engagement / −37% course time, Finshots 100k+ downloads, Ditto +17% conversion.

# Tools

${mode === 'agent' ? 'build_gen_ui_view, get_portfolio_sections, layout_action' : 'show_cards, get_portfolio_sections'}

${mode === 'agent' ? 'For layout changes: call get_portfolio_sections first if unsure of current state, then layout_action. No build_gen_ui_view needed for layout-only requests.' : 'Layout changes require Gen UI mode — say so politely if asked.'}

Section IDs: ${PORTFOLIO_SECTION_IDS.join(', ')}

# Available card IDs

${CARD_ID_LIST.join(', ')}`;
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
    buildViewport: false,
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
    buildViewport: ctx.buildViewport,
  };
}
