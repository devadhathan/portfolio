import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

const RESET_INTERVAL = 24 * 60 * 60 * 1000;
export const PROMPT_LIMIT = 10;

const ipPromptCounts = new Map<string, { count: number; lastReset?: number }>();

function isKVAvailable(): boolean {
  try {
    return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  } catch {
    return false;
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

export type PromptLimitStatus = {
  count: number;
  limit: number;
  remaining: number;
  allowed: boolean;
};

async function readCount(ip: string): Promise<{ count: number; lastReset: number }> {
  const now = Date.now();

  if (isKVAvailable()) {
    try {
      const key = `prompt:${ip}`;
      const stored = await kv.get<{ count: number; lastReset: number }>(key);
      if (!stored) return { count: 0, lastReset: now };
      if (now - stored.lastReset > RESET_INTERVAL) return { count: 0, lastReset: now };
      return stored;
    } catch (kvError) {
      console.error('KV read error, falling back to in-memory:', kvError);
    }
  }

  const current = ipPromptCounts.get(ip);
  if (current?.lastReset && Date.now() - current.lastReset > RESET_INTERVAL) {
    return { count: 0, lastReset: Date.now() };
  }
  return { count: current?.count ?? 0, lastReset: current?.lastReset ?? Date.now() };
}

async function writeCount(ip: string, count: number, lastReset: number): Promise<void> {
  if (isKVAvailable()) {
    try {
      await kv.set(`prompt:${ip}`, { count, lastReset });
      return;
    } catch (kvError) {
      console.error('KV write error, falling back to in-memory:', kvError);
    }
  }
  ipPromptCounts.set(ip, { count, lastReset });
}

export async function getPromptLimitStatus(ip: string): Promise<PromptLimitStatus> {
  const { count } = await readCount(ip);
  const remaining = Math.max(0, PROMPT_LIMIT - count);
  return {
    count,
    limit: PROMPT_LIMIT,
    remaining,
    allowed: remaining > 0,
  };
}

/** Increment usage and return updated status. Enforces limit server-side. */
export async function consumePromptQuota(ip: string): Promise<PromptLimitStatus> {
  const now = Date.now();
  const { count, lastReset } = await readCount(ip);

  if (count >= PROMPT_LIMIT) {
    return {
      count,
      limit: PROMPT_LIMIT,
      remaining: 0,
      allowed: false,
    };
  }

  const nextCount = count + 1;
  await writeCount(ip, nextCount, lastReset || now);

  return {
    count: nextCount,
    limit: PROMPT_LIMIT,
    remaining: Math.max(0, PROMPT_LIMIT - nextCount),
    allowed: true,
  };
}
