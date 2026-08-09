'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import { PlaygroundCraftCard } from '@/components/playground-craft-card';
import {
  PlaygroundDetailOverlay,
  type PlaygroundSelection,
} from '@/components/playground-detail-overlay';
import { PLAYGROUND_ITEMS } from '@/lib/playground-items';

export default function PlaygroundPage() {
  const router = useRouter();
  const t = useTranslations('playground');
  const [selection, setSelection] = useState<PlaygroundSelection | null>(null);

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

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
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <div className="flex pt-14 relative z-10">
          <main className="flex-1 py-4 md:py-6 lg:py-8 pb-20 md:pb-24 lg:pb-8 overflow-x-hidden">
            <div className="max-w-[1500px] mx-auto">
              <div className="mx-0 px-4 sm:mx-4 sm:px-5 md:mx-4 md:px-5 lg:mx-5 lg:px-6 xl:mx-[70px] xl:px-[90px]">
              <div className="mb-8 md:mb-10 text-left pt-8 md:pt-10 lg:pt-14">
                <h1 className="max-w-4xl whitespace-pre-line text-balance text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-light text-foreground tracking-tight leading-[1.1] mb-8 md:mb-10 lg:mb-12">
                  {t('heroLine')}
                </h1>
              </div>

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-5 auto-rows-[minmax(220px,auto)] w-full pb-4 md:pb-0">
                {PLAYGROUND_ITEMS.map((item) => {
                  const copy = getCopy(item.id);
                  return (
                    <PlaygroundCraftCard
                      key={item.id}
                      item={item}
                      title={copy.title}
                      accessibilityLabel={copy.accessibilityLabel}
                      onOpen={() => openItem(item.id)}
                    />
                  );
                })}
              </section>
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
