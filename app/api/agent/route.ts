import { NextRequest, NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent-loop';
import { MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
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

    const ip = getClientIP(request);
    let promptRemaining: number | undefined;

    if (ip !== 'unknown') {
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
    }

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
