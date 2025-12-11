import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Reset counts daily (optional - or use persistent storage)
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const PROMPT_LIMIT = 10;

// Fallback in-memory store (only used if KV is not available)
const ipPromptCounts = new Map<string, { count: number; lastReset?: number }>();

// Check if KV is available
const isKVAvailable = () => {
  try {
    return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  } catch {
    return false;
  }
};

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

    const now = Date.now();
    let kvAvailable = isKVAvailable();
    
    let currentCount = 0;
    let lastReset = now;

    if (kvAvailable) {
      // Use Vercel KV for persistent storage
      try {
        const key = `prompt:${ip}`;
        const stored = await kv.get<{ count: number; lastReset: number }>(key);
        
        if (stored) {
          // Reset if it's been more than 24 hours
          if ((now - stored.lastReset) > RESET_INTERVAL) {
            currentCount = 0;
            lastReset = now;
            await kv.set(key, { count: 0, lastReset: now });
          } else {
            currentCount = stored.count;
            lastReset = stored.lastReset;
          }
        }
        
        // Check limit before incrementing
        if (currentCount >= PROMPT_LIMIT) {
          return NextResponse.json({
            allowed: false,
            count: currentCount,
            limit: PROMPT_LIMIT,
            message: `You've reached the prompt limit. Please contact me to continue using the portfolio agent.`
          });
        }
        
        // Increment and save
        currentCount += 1;
        await kv.set(key, { count: currentCount, lastReset });
      } catch (kvError) {
        console.error('KV error, falling back to in-memory:', kvError);
        // Fall through to in-memory fallback
        kvAvailable = false;
      }
    }
    
    if (!kvAvailable) {
      // Fallback to in-memory store
      const current = ipPromptCounts.get(ip);
      
      // Reset if it's been more than 24 hours
      if (current && current.lastReset && (now - current.lastReset) > RESET_INTERVAL) {
        ipPromptCounts.set(ip, { count: 0, lastReset: now });
        currentCount = 0;
      } else {
        currentCount = current?.count || 0;
      }
      
      if (currentCount >= PROMPT_LIMIT) {
        return NextResponse.json({
          allowed: false,
          count: currentCount,
          limit: PROMPT_LIMIT,
          message: `You've reached the prompt limit. Please contact me to continue using the portfolio agent.`
        });
      }
      
      // Increment count
      currentCount += 1;
      ipPromptCounts.set(ip, { 
        count: currentCount, 
        lastReset: current?.lastReset || now 
      });
    }
    
    return NextResponse.json({
      allowed: true,
      count: currentCount,
      limit: PROMPT_LIMIT,
      remaining: PROMPT_LIMIT - currentCount
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
    const kvAvailable = isKVAvailable();
    let count = 0;
    
    if (kvAvailable) {
      try {
        const key = `prompt:${ip}`;
        const stored = await kv.get<{ count: number; lastReset: number }>(key);
        if (stored) {
          const now = Date.now();
          // Reset if it's been more than 24 hours
          if ((now - stored.lastReset) > RESET_INTERVAL) {
            count = 0;
          } else {
            count = stored.count;
          }
        }
      } catch (kvError) {
        console.error('KV error in GET, using fallback:', kvError);
        // Fall through to in-memory fallback
        const current = ipPromptCounts.get(ip);
        count = current?.count || 0;
      }
    } else {
      // Fallback to in-memory store
      const current = ipPromptCounts.get(ip);
      count = current?.count || 0;
    }
    
    return NextResponse.json({
      count,
      limit: PROMPT_LIMIT,
      remaining: Math.max(0, PROMPT_LIMIT - count)
    });
  } catch (error) {
    return NextResponse.json({ count: 0, limit: PROMPT_LIMIT, remaining: PROMPT_LIMIT });
  }
}

