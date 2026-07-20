import { NextRequest, NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent-loop';
import {
  askAIConversationalReply,
  ASK_AI_OFF_TOPIC_STRIKE_LIMIT,
  countConsecutiveOffTopicAskAI,
  isAskAIConversationalPrompt,
  isOffTopicAskAI,
  offTopicAskAIStrikeError,
  resolveOffTopicAskAIResponse,
} from '@/lib/ask-ai-conversational';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import {
  isInsufficientContextQuery,
  insufficientContextMessage,
  isOffTopicGenUIPrompt,
  offTopicGenUIMessage,
} from '@/lib/gen-ui-on-topic';
import { consumePromptQuota, getClientIP } from '@/lib/prompt-limit';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const {
      messages,
      mode = 'agent',
      sections = [],
    } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      mode?: 'ask' | 'agent';
      sections?: Array<{ id: string; title: string; visible: boolean; priority: string; order: number }>;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser && lastUser.content.length > MAX_GEN_UI_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be ${MAX_GEN_UI_PROMPT_LENGTH} characters or fewer.` },
        { status: 400 },
      );
    }

    const lastPrompt = lastUser?.content.trim() ?? '';
    const askMode = mode === 'ask';

    if (lastPrompt && isAskAIConversationalPrompt(lastPrompt)) {
      return NextResponse.json({
        message: askAIConversationalReply(lastPrompt),
        cardIds: [],
        layoutCommands: [],
        steps: [],
        iterations: 0,
        conversational: true,
      });
    }

    if (lastPrompt && askMode && isOffTopicAskAI(lastPrompt)) {
      const userPrompts = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content.trim());
      const strikes = countConsecutiveOffTopicAskAI(userPrompts);
      const blocked = strikes >= ASK_AI_OFF_TOPIC_STRIKE_LIMIT;
      const { reply } = blocked
        ? { reply: offTopicAskAIStrikeError() }
        : resolveOffTopicAskAIResponse(strikes - 1, lastPrompt);

      return NextResponse.json({
        message: reply,
        cardIds: [],
        layoutCommands: [],
        steps: [],
        iterations: 0,
        offTopic: true,
        offTopicBlocked: blocked,
        offTopicStrikes: strikes,
      });
    }

    if (lastPrompt && askMode && isInsufficientContextQuery(lastPrompt)) {
      return NextResponse.json({
        message: insufficientContextMessage(lastPrompt),
        cardIds: ['feature:connect'],
        layoutCommands: [],
        steps: [],
        iterations: 0,
        insufficientContext: true,
      });
    }

    if (lastPrompt && !askMode && isOffTopicGenUIPrompt(lastPrompt)) {
      return NextResponse.json({
        message: offTopicGenUIMessage(lastPrompt),
        cardIds: [],
        layoutCommands: [],
        steps: [],
        iterations: 0,
        offTopic: true,
      });
    }

    const ip = getClientIP(request);
    let promptRemaining: number | undefined;

    const quota = await consumePromptQuota(ip);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'Prompt limit reached',
          count: quota.count,
          limit: quota.limit,
          remaining: 0,
        },
        { status: 429 },
      );
    }
    promptRemaining = quota.remaining;

    const result = await runAgentLoop({
      apiKey,
      messages,
      mode: mode === 'ask' ? 'ask' : 'agent',
      sections,
    });

    return NextResponse.json({
      ...result,
      promptRemaining,
    });
  } catch (error) {
    console.error('[agent loop]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent loop failed' },
      { status: 500 }
    );
  }
}
