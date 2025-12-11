import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store (for production, use Vercel KV or a database)
// This will reset on serverless function cold starts, but works for MVP
// 
// NOTE: For production persistence, integrate Vercel KV:
// 1. Install: npm install @vercel/kv
// 2. Set up KV in Vercel dashboard
// 3. Replace Map with: await kv.get(`prompt:${ip}`) / await kv.set(`prompt:${ip}`, count)
const ipPromptCounts = new Map<string, { count: number; lastReset?: number }>();

// Reset counts daily (optional - or use persistent storage)
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const PROMPT_LIMIT = 10;

function getClientIP(request: NextRequest): string {
  // Check various headers for IP (handles Vercel proxy, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    
    if (ip === 'unknown') {
      return NextResponse.json({ error: 'Unable to detect IP address' }, { status: 400 });
    }

    // Check and increment count
    const now = Date.now();
    const current = ipPromptCounts.get(ip);
    
    // Reset if it's been more than 24 hours (optional feature)
    if (current && current.lastReset && (now - current.lastReset) > RESET_INTERVAL) {
      ipPromptCounts.set(ip, { count: 0, lastReset: now });
    }
    
    const currentCount = current?.count || 0;
    
    if (currentCount >= PROMPT_LIMIT) {
      return NextResponse.json({
        allowed: false,
        count: currentCount,
        limit: PROMPT_LIMIT,
        message: `You've reached the prompt limit. Please contact me to continue using the portfolio agent.`
      });
    }
    
    // Increment count
    ipPromptCounts.set(ip, { 
      count: currentCount + 1, 
      lastReset: current?.lastReset || now 
    });
    
    return NextResponse.json({
      allowed: true,
      count: currentCount + 1,
      limit: PROMPT_LIMIT,
      remaining: PROMPT_LIMIT - (currentCount + 1)
    });
  } catch (error) {
    console.error('Error checking prompt limit:', error);
    // Allow the request if there's an error (fail open)
    return NextResponse.json({
      allowed: true,
      error: 'Failed to check limit'
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const current = ipPromptCounts.get(ip);
    const count = current?.count || 0;
    
    return NextResponse.json({
      count,
      limit: PROMPT_LIMIT,
      remaining: Math.max(0, PROMPT_LIMIT - count)
    });
  } catch (error) {
    return NextResponse.json({ count: 0, limit: PROMPT_LIMIT, remaining: PROMPT_LIMIT });
  }
}

