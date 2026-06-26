import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const BLOCKED_DOMAIN = 'wordsmith.ai'

const intlMiddleware = createMiddleware(routing)

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''
  const host = request.headers.get('host') || ''

  const isBlocked =
    origin.includes(BLOCKED_DOMAIN) ||
    referer.includes(BLOCKED_DOMAIN) ||
    host.includes(BLOCKED_DOMAIN)

  if (isBlocked) {
    return new NextResponse(null, { status: 403 })
  }

  const { pathname } = request.nextUrl
  if (pathname === '/ml' || pathname.startsWith('/ml/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/ml/, '') || '/'
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}
