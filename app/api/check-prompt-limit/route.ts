import { NextRequest, NextResponse } from 'next/server';
import {
  consumePromptQuota,
  getClientIP,
  getPromptLimitStatus,
  PROMPT_LIMIT,
} from '@/lib/prompt-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (ip === 'unknown') {
      return NextResponse.json({ error: 'Unable to detect IP address' }, { status: 400 });
    }

    const status = await consumePromptQuota(ip);
    if (!status.allowed) {
      return NextResponse.json({
        allowed: false,
        count: status.count,
        limit: status.limit,
        remaining: status.remaining,
        message: `You've reached the prompt limit. Please contact me to continue using the portfolio agent.`,
      });
    }

    return NextResponse.json({
      allowed: true,
      count: status.count,
      limit: status.limit,
      remaining: status.remaining,
    });
  } catch (error) {
    console.error('Error checking prompt limit:', error);
    return NextResponse.json({
      allowed: true,
      error: 'Failed to check limit',
      limit: PROMPT_LIMIT,
      remaining: PROMPT_LIMIT,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const status = await getPromptLimitStatus(ip);
    return NextResponse.json({
      count: status.count,
      limit: status.limit,
      remaining: status.remaining,
    });
  } catch {
    return NextResponse.json({ count: 0, limit: PROMPT_LIMIT, remaining: PROMPT_LIMIT });
  }
}
