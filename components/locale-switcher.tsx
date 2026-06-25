'use client'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ml: 'ML',
}

export function LocaleSwitcher() {
  const t = useTranslations('locale')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full bg-card/40 backdrop-blur-sm border border-white/10"
          aria-label={t('label')}
        >
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-card/65 backdrop-blur-2xl border border-white/[0.08]">
        {routing.locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className={locale === code ? 'bg-white/10' : ''}
          >
            {t(code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LocaleSwitcherCompact() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-card/40 p-0.5 text-[11px] font-medium">
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => router.replace(pathname, { locale: code })}
          className={`rounded-full px-2 py-1 transition-colors ${
            locale === code ? 'bg-white/15 text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={LOCALE_LABELS[code]}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  )
}
