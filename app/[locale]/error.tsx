'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    const msg = error?.message ?? '';
    if (
      msg.includes('removeChild') ||
      msg.includes('parentNode') ||
      msg.includes('Cannot read properties of null')
    ) {
      reset();
    }
  }, [error, reset]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <h2 className="text-xl font-bold mb-4">{t('title')}</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded cursor-pointer"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
