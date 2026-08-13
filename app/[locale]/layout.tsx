import type { Metadata } from 'next'
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
import { HERO_VIDEO_POSTER } from '@/lib/hero-media'
import { fontVariables, geistSans } from '@/lib/fonts'
import { Analytics } from '@vercel/analytics/next'
import { PostHogProvider } from '@/components/posthog-provider'

export const revalidate = SANITY_REVALIDATE_SECONDS

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
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

  const [{ settings, experience }, rawProjects, messages] = await Promise.all([
    getSiteContent(),
    getProjects(),
    getMessages(),
  ])
  const projects = localizeProjects(rawProjects, locale)

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <link rel="preload" href={HERO_VIDEO_POSTER} as="image" fetchPriority="high" />
      </head>
      <body className={`${fontVariables} ${geistSans.className}`}>
        <PostHogProvider>
        <NextIntlClientProvider messages={messages}>
          <SuppressCleanupErrors />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={['dark', 'light', 'blue', 'green', 'red']}
            enableSystem={false}
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
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
