'use client';

import { useTranslations } from 'next-intl';
import type { DesktopWindowId } from '@/lib/desktop-os';

/** Window chrome and the menu bar name windows the same way. */
export function useWindowTitles(): Record<DesktopWindowId, string> {
  const t = useTranslations('nav');
  return {
    finder: 'Catalog',
    home: t('home'),
    work: t('work'),
    playground: t('playground'),
    ask: t('askAI'),
    games: t('games'),
    drawesome: t('drawesome'),
    photos: t('photos'),
    wordsmith: 'Wordsmith AI',
    trash: 'Trash',
    contact: t('contact'),
    about: 'About Me',
    colophon: 'Colophon',
    writings: 'Favourites',
    catalystic: 'Catalystic',
    bigBang: 'Big Bang',
  };
}
