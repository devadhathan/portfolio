import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { ThemeProvider } from 'next-themes'
import { ClientThemeProvider } from '@/components/client-theme-provider'
import { SiteContentProvider } from '@/components/site-content-provider'
import { AskAIProvider } from '@/components/ask-ai-provider'
import { AppChrome } from '@/components/app-chrome'
import { NavActionsProvider } from '@/contexts/nav-actions-context'
import { SuppressCleanupErrors } from '@/components/suppress-cleanup-errors'
import { SANITY_REVALIDATE_SECONDS } from '@/lib/sanity/cache'
import { getProjects } from '@/lib/sanity/projects'
import { getSiteContent } from '@/lib/sanity/site-content'
import { localizeProjects } from '@/lib/i18n/localize-projects'
import { routing, type Locale } from '@/i18n/routing'
import { fontVariables, geistSans } from '@/lib/fonts'
import { getOsSettingsBootScript } from '@/lib/os-settings'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/components/posthog-provider'

export const revalidate = SANITY_REVALIDATE_SECONDS

/** Absolute base for share cards — scrapers reject relative image URLs. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://devadhathan.com')

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const title = t('title')
  const description = t('description')

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: {
      icon: [{ url: '/favicon.ico', sizes: 'any' }],
      apple: [{ url: '/photos/Image@4x.png', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      siteName: title,
      locale,
      title,
      description,
      url: '/',
      images: [
        {
          url: '/og.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.jpg'],
    },
  }
}

/** Fetches Sanity / messages — suspended so the shell can stream while data loads. */
async function LocaleProviders({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  const [{ settings, experience }, rawProjects, messages] = await Promise.all([
    getSiteContent(),
    getProjects(),
    getMessages(),
  ])
  const projects = localizeProjects(rawProjects, locale)

  return (
    <PostHogProvider>
      <NextIntlClientProvider messages={messages}>
        <SuppressCleanupErrors />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          themes={['dark', 'light', 'blue', 'green', 'red']}
        >
          <ClientThemeProvider>
            <SiteContentProvider settings={settings} experience={experience} projects={projects}>
              <AskAIProvider>
                <NavActionsProvider>
                  <AppChrome>{children}</AppChrome>
                </NavActionsProvider>
              </AskAIProvider>
            </SiteContentProvider>
          </ClientThemeProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
      <Analytics />
    </PostHogProvider>
  )
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  if (!routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      className="dark"
      data-os-menubar="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: getOsSettingsBootScript() }} />
      </head>
      <body className={`${fontVariables} ${geistSans.className}`}>
        <Suspense
          fallback={
            <div
              className="min-h-screen w-full"
              style={{ background: 'var(--os-wallpaper, #0a0a0a)' }}
              aria-busy
              aria-label="Loading"
            />
          }
        >
          <LocaleProviders locale={locale}>{children}</LocaleProviders>
        </Suspense>
            </body>
    </html>
  )
}
