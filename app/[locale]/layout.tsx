import type { Metadata } from 'next'
import { DM_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { ThemeProvider } from 'next-themes'
import { ClientThemeProvider } from '@/components/client-theme-provider'
import { SiteContentProvider } from '@/components/site-content-provider'
import { SuppressCleanupErrors } from '@/components/suppress-cleanup-errors'
import { SANITY_REVALIDATE_SECONDS } from '@/lib/sanity/cache'
import { getProjects } from '@/lib/sanity/projects'
import { getSiteContent } from '@/lib/sanity/site-content'
import { localizeProjects } from '@/lib/i18n/localize-projects'
import { routing, type Locale } from '@/i18n/routing'
import { Analytics } from '@vercel/analytics/next'

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
})

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
      <body className={dmMono.variable}>
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
                {children}
              </SiteContentProvider>
            </ClientThemeProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
