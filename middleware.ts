import { NextRequest, NextResponse } from 'next/server';

const BLOCKED_DOMAIN = 'wordsmith.ai';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  const host = request.headers.get('host') || '';

  const isBlocked =
    origin.includes(BLOCKED_DOMAIN) ||
    referer.includes(BLOCKED_DOMAIN) ||
    host.includes(BLOCKED_DOMAIN);

  if (isBlocked) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
