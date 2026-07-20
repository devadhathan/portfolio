import { NextRequest, NextResponse } from 'next/server';
import {
  getClientIP,
  getPromptLimitStatus,
  PROMPT_LIMIT,
} from '@/lib/prompt-limit';

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
    return NextResponse.json({ count: PROMPT_LIMIT, limit: PROMPT_LIMIT, remaining: 0 });
  }
}
