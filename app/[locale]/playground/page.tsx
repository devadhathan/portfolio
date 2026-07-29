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
        <main className="px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-16 sm:px-6 md:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="mb-6 border-b border-border/60 pb-3">
              <h1 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground sm:text-xs">
                {t('label')}
              </h1>
            </div>

            <section className="flex gap-0 overflow-x-auto border border-border/60 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
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
        </main>
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
