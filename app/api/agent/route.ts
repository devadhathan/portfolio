import { NextRequest, NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent-loop';

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

    const result = await runAgentLoop({
      apiKey,
      messages,
      mode: mode === 'ask' ? 'ask' : 'agent',
      sections,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[agent loop]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agent loop failed' },
      { status: 500 }
    );
  }
}
