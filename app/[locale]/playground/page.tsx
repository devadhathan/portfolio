'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useRegisterNavActions } from '@/contexts/nav-actions-context';
import {
  PlaygroundClipCard,
  PlaygroundDetailOverlay,
  type PlaygroundSelection,
} from '@/components/playground-detail-overlay';
import { PlaygroundMediaContent, PlaygroundPhoneFrame } from '@/components/playground-phone-frame';
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
      <div className="min-h-screen overflow-x-hidden bg-[#f3f3f3] text-neutral-900 dark:bg-background dark:text-foreground">
        <main className="px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-14 sm:px-6 md:px-10">
          <div className="mx-auto w-full max-w-2xl md:max-w-3xl">
            <div className="mb-8 pt-2 text-center md:mb-10">
              <p className="text-xs uppercase tracking-[0.36em] text-neutral-500 dark:text-muted-foreground">
                {t('label')}
              </p>
            </div>

            <section className="flex flex-col gap-5 md:gap-6">
              {PLAYGROUND_ITEMS.map((item) => {
                const copy = getCopy(item.id);
                return (
                  <PlaygroundClipCard
                    key={item.id}
                    title={copy.title}
                    icon="◆"
                    onOpen={() => openItem(item.id)}
                  >
                    <PlaygroundPhoneFrame size="preview">
                      <PlaygroundMediaContent item={item} accessibilityLabel={copy.accessibilityLabel} />
                    </PlaygroundPhoneFrame>
                  </PlaygroundClipCard>
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
        escLabel={t('esc')}
      />
    </>
  );
}
