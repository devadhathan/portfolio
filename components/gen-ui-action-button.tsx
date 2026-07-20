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

const actionButtonClass =
  'bg-primary text-primary-foreground border border-primary/20 hover:bg-primary/90 shadow-sm';

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
        actionButtonClass,
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

export { actionButtonClass };
