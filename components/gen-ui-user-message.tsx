'use client';

import { capitalizePrompt } from '@/lib/enrich-gen-ui';
import { cn } from '@/lib/utils';

type GenUIUserMessageProps = {
  prompt: string;
  className?: string;
};

export function GenUIUserMessage({ prompt, className }: GenUIUserMessageProps) {
  return (
    <div className={cn('flex justify-end', className)}>
      <div className="max-w-[85%] sm:max-w-xl rounded-3xl bg-[#2a2a2a] px-4 py-3 text-[15px] leading-relaxed text-foreground">
        {capitalizePrompt(prompt)}
      </div>
    </div>
  );
}
