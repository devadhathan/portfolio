import type { AgentCommand, SectionPriority } from '@/lib/agent';
import { CARD_ID_LIST, CARD_REGISTRY } from '@/lib/gen-ui-registry';
import { CASE_STUDY_SLUGS } from '@/lib/build-case-study-cards';
import { resumeData } from '@/lib/resume-data';

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

export const MAX_VIEWPORT_CARDS = 6;

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
          'Create a Gen UI viewport in the center canvas. Call when the user\'s intent is clear (specific request OR they answered your clarifying questions). Pass 3-6 card IDs — one project deep-dive OR a multi-project overview.',
        parameters: {
          type: 'object',
          properties: {
            card_ids: {
              type: 'array',
              items: { type: 'string' },
              description: `3-${MAX_VIEWPORT_CARDS} card IDs for this viewport. Valid IDs: ${CARD_ID_LIST.join(', ')}`,
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
  const base = `You are Devadhathan's portfolio assistant — a Product Designer with 5+ years experience.

EXPERIENCE HIGHLIGHTS:
- Wordsmith AI (2026, confidential), Nesoi.ai (+92% engagement, -37% course time), Finshots & Ditto (2019–2022), Finshots app (100k+ downloads, Google Play Best App 2020), Ditto Insurance (+17% conversion, Falcon Design System)

COMPANY CONTEXT — FINSHOTS & DITTO:
${resumeData.companyHistory.finshotsDitto}
- Finshots (2019): financial news platform — Dev designed the mobile app as product designer.
- Ditto Insurance (2021): insurance product launched by the same company; the group later rebranded under Ditto.
- Finshots is still a product of the parent company. Ditto projects (CRM, onboarding, Falcon) are separate from but related to this company history.

CASE STUDY CARDS (rich content from full case studies — images, videos, problem/impact/learning):
- Per project slug (${CASE_STUDY_SLUGS.join(', ')}): case:{slug}:project, case:{slug}:impact, image:case:{slug}:{section}, video:case:{slug}:{section}
- Prefer case:{slug}:* cards over legacy project:* / image:* duplicates for the same project.
- Do NOT mix project:finshots AND case:finshots-news-app:project — use case study IDs only.
- Pick 2-4 image:case:{slug}:* or video:case:{slug}:* media cards per project — each has a title and short description, no separate project card needed if media is included.
- Do NOT add separate info:problem + info:approach + project card for the same project — case:{slug}:project + case:{slug}:impact + media is enough.

WORDSITH AI — LOCKED:
- If the user asks about Wordsmith, Wordsmith AI, or wordsmith.ai: ONLY use info:wordsmith-locked and feature:wordsmith-locked.
- Do NOT use timeline:wordsmith or any other cards. Tell them to contact Dev for more.

AVAILABLE CARD IDS (use only these exact strings in show_cards):
${CARD_ID_LIST.join(', ')}

WORKFLOW — AGENTIC LOOP:
1. Think about what the user wants.
2. Call tools to gather state or take action (${mode === 'agent' ? 'build_gen_ui_view, get_portfolio_sections, layout_action' : 'show_cards, get_portfolio_sections'}).
3. You may call multiple tools across turns before replying.
4. When done, respond with a friendly summary (no tool calls on the final turn).

RULES:
${mode === 'ask' ? `- Always use show_cards for metrics, projects, skills, charts, images, videos, info, and feature cards — never invent data.
- Pick 4-8 relevant card IDs per show_cards call.` : `- In Gen UI mode use build_gen_ui_view (NOT show_cards) when creating a viewport.
- Pick 3-${MAX_VIEWPORT_CARDS} card IDs per build_gen_ui_view call.`}
- Use a diverse mix: combine stats + projects + timeline and/or charts/images/videos/info as the question demands.
- For project deep-dives, include case:{slug}:* cards plus image:case:{slug}:* and video:case:{slug}:* media from case studies.
- Line-art feature cards (feature:*, feature_section) are optional accents — use at most ONE feature card for single-topic deep-dives only. Never combine feature_section with project overview cards.
- Match cards tightly to the user's question (e.g. Finshots question → case:finshots-news-app:project + 1-2 Finshots media, NOT feature:impact).
- For layout requests${mode === 'agent' ? ' (hide photos, prioritize experience, etc.) use layout_action. Call get_portfolio_sections first if unsure of current state' : ', explain that layout changes require Gen UI mode'}.`;

  if (mode === 'agent') {
    return `${base}

GEN UI MODE — EXPLORE FIRST, THEN BUILD:

PHASE 1 — CLARIFY (no tools except get_portfolio_sections for layout questions):
- On vague first requests ("show projects", "tell me about his work"), ask ONE short clarifying question. Offer options: a specific project (Finshots, Nesoi, CRM, Falcon) OR an overview of all work.
- Do NOT call build_gen_ui_view on the first vague message.
- If the user is answering your clarifying question, move to Phase 2 immediately.
- Skip clarification when the request is already specific (e.g. "Show Finshots", "All projects overview", "Impact metrics", layout changes, Wordsmith).

PHASE 2 — BUILD:
- When intent is clear, call build_gen_ui_view ONCE with 3-${MAX_VIEWPORT_CARDS} card IDs.
- Single project: case:{slug}:project + case:{slug}:impact + 1-2 image/video media cards. No feature_section.
- Multi-project overview: one case:{slug}:project card per project (3-5 different slugs — Finshots, Nesoi, Falcon, CRM, Onboarding). Never repeat the same project twice. Do NOT add feature:impact or extra media/info cards for the same slug.
- If the user wants all projects or an overview, build that — do NOT say you can only show one project.
- NEVER mention viewport limits, card limits, or system constraints in your chat reply.
- After building, reply with a short storytelling narrative (2–4 sentences): warm, editorial tone — set context, hint at what they'll discover in the cards, end naturally. No bullet points, no markdown, no headings.
- For case study or project deep-dive requests, use exactly three paragraphs separated by blank lines: (1) Context — the product and Dev's role, (2) Challenge — the core problem or constraint, (3) Teaser — what the cards below reveal (impact, screens, learnings). Flowing prose only — do not write "Context:" or "Challenge:" as labels.
- When listing multiple items (metrics, projects, skills), you may use a short bullet list (3–5 lines starting with "- ") after the opening paragraph — keep the overall reply conversational, not a wall of bullets.
- For clarification-only replies (Phase 1), keep it to one friendly question — still prose, not lists.

Layout changes: use layout_action (and get_portfolio_sections if needed). No build_gen_ui_view required for layout-only requests.
Section IDs: ${PORTFOLIO_SECTION_IDS.join(', ')}`;
  }

  return `${base}

ASK MODE: Cards appear inline in the chat. Mix stat, project, timeline, chart, image, and info cards — add one feature line-art card only when it helps. Do not use layout_action.`;
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
