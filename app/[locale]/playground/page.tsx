'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { PlaygroundCraftCard } from '@/components/playground-craft-card';
import {
  PlaygroundDetailOverlay,
  type PlaygroundSelection,
} from '@/components/playground-detail-overlay';
import { PLAYGROUND_ITEMS } from '@/lib/playground-items';
import { blurFadeUp, easeOutExpo, fadeUpSoft } from '@/lib/motion';
import { useDesktopOsOptional } from '@/components/desktop-os/desktop-os-provider';
import { LinedPageFrame } from '@/components/lined-page-frame';

export default function PlaygroundPage() {
  const router = useRouter();
  const t = useTranslations('playground');
  const reduceMotion = useReducedMotion();
  const desktopOs = useDesktopOsOptional();
  const embedded = Boolean(desktopOs?.enabled);
  const [selection, setSelection] = useState<PlaygroundSelection | null>(null);

  const handleHomeClick = useCallback(() => {
    if (desktopOs?.enabled) {
      desktopOs.openWindow('home');
      return;
    }
    router.push('/');
  }, [router, desktopOs]);

  useRegisterNavActions({ onHomeClick: handleHomeClick });

  const getCopy = useCallback(
    (id: string) => ({
      title: t(`items.${id}.title`),
      question: t(`items.${id}.question`),
      tags: t.raw(`items.${id}.tags`) as string[],
      accessibilityLabel: t(`items.${id}.accessibilityLabel`),
    }),
    [t],
  );

  const openItem = useCallback(
    (id: string) => {
      const item = PLAYGROUND_ITEMS.find((entry) => entry.id === id);
      if (!item) return;
      const copy = getCopy(id);
      setSelection({
        kind: 'item',
        id,
        title: copy.title,
        question: copy.question,
        tags: copy.tags,
        item,
        accessibilityLabel: copy.accessibilityLabel,
      });
    },
    [getCopy],
  );

  const goToRelative = useCallback(
    (delta: number) => {
      if (!selection) return;
      const currentIndex = PLAYGROUND_ITEMS.findIndex((entry) => entry.id === selection.id);
      if (currentIndex < 0) return;
      const nextIndex = (currentIndex + delta + PLAYGROUND_ITEMS.length) % PLAYGROUND_ITEMS.length;
      openItem(PLAYGROUND_ITEMS[nextIndex].id);
    },
    [selection, openItem],
  );

  return (
    <>
      <div
        className={`overflow-x-hidden text-foreground ${
          embedded ? 'min-h-0 bg-transparent' : 'min-h-screen bg-background lg:min-h-0 lg:bg-transparent'
        }`}
      >
        <div className={`relative z-10 flex ${embedded ? 'pt-0' : 'pt-14 lg:pt-0'}`}>
          <main
            className={`flex-1 overflow-x-hidden ${
              embedded ? 'py-4 pb-8' : 'py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8'
            }`}
          >
            <div className={embedded ? 'w-full min-w-0' : 'max-w-[1500px] mx-auto'}>
              <div
                className={
                  embedded
                    ? 'os-work-grid home-col mx-auto w-full min-w-0'
                    : 'mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]'
                }
              >
              <LinedPageFrame
                title={t('heroLine')}
                className={embedded ? 'mb-0' : undefined}
              >
              <section
                className={
                  embedded
                    ? 'os-work-grid__cards grid w-full min-w-0 pb-4 md:pb-0'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-5 auto-rows-[minmax(220px,auto)] w-full pb-4 md:pb-0'
                }
              >
                {PLAYGROUND_ITEMS.map((item, index) => {
                  const copy = getCopy(item.id);
                  const enter =
                    item.media.type === 'video' || item.media.type === 'orb'
                      ? fadeUpSoft
                      : blurFadeUp;
                  return (
                    <motion.div
                      key={item.id}
                      className="h-full min-h-0"
                      initial={reduceMotion ? false : enter.initial}
                      animate={enter.animate}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(index, 10) * 0.06,
                        ease: easeOutExpo,
                      }}
                    >
                      <PlaygroundCraftCard
                        item={item}
                        title={copy.title}
                        accessibilityLabel={copy.accessibilityLabel}
                        onOpen={() => openItem(item.id)}
                      />
                    </motion.div>
                  );
                })}
              </section>
              </LinedPageFrame>
              </div>
            </div>
          </main>
        </div>
      </div>

      <PlaygroundDetailOverlay
        selection={selection}
        onClose={() => setSelection(null)}
        onPrevious={() => goToRelative(-1)}
        onNext={() => goToRelative(1)}
        builtWithLabel={t('builtWith')}
      />
    </>
  );
}
