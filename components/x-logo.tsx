import { cn } from '@/lib/utils';

type XLogoProps = {
  className?: string;
};

/** X (Twitter) mark — explicit box so it paints reliably beside Lucide stroke icons. */
export function XLogo({ className }: XLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden
      className={cn('block shrink-0', className)}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.451L1.61 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}
