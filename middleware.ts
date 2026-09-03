import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing, type Locale } from './i18n/routing'

const BLOCKED_DOMAIN = 'wordsmith.ai'

/** App segments that must not be treated as a locale slug (e.g. /work → locale "work"). */
const APP_ROUTE_SEGMENTS = new Set(['work', 'contact', 'playground'])

const intlMiddleware = createMiddleware(routing)

function rewriteKnownAppRoute(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const first = pathname.split('/').filter(Boolean)[0]
  if (!first || routing.locales.includes(first as Locale)) return null
  if (!APP_ROUTE_SEGMENTS.has(first)) return null

  const url = request.nextUrl.clone()
  url.pathname = `/${routing.defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

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

  const appRouteRewrite = rewriteKnownAppRoute(request)
  if (appRouteRewrite) return appRouteRewrite

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}
