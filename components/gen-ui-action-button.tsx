'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type GenUIActionButtonProps = {
  href: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
};

const whiteButtonClass =
  'bg-white text-neutral-900 border-white/40 hover:bg-white/90 hover:text-neutral-900 shadow-sm';

export function GenUIActionButton({
  href,
  label = 'View case study',
  className,
  variant = 'outline',
}: GenUIActionButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size="sm"
      className={cn(
        'mt-4 h-8 w-auto self-start rounded-full px-4 text-xs font-medium',
        whiteButtonClass,
        className,
      )}
    >
      <a href={href} className="inline-flex items-center justify-center">
        {label}
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </a>
    </Button>
  );
}

export { whiteButtonClass };
