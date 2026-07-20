import { cn } from '@/lib/utils';

type AgentDogIconProps = {
  className?: string;
  /** Optional dark square behind the mark (playground previews). */
  withBackdrop?: boolean;
  /** Soft blur on the line art. */
  blurred?: boolean;
};

/** Line-art poodle — uses currentColor via invert in dark mode. */
export function AgentDogIcon({ className, withBackdrop = false, blurred = false }: AgentDogIconProps) {
  return (
    <div
      className={cn(
        'relative flex aspect-square items-center justify-center',
        withBackdrop && 'rounded-2xl bg-[#151110] p-[18%]',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/svg/agent-dog.png"
        alt=""
        aria-hidden
        className={cn(
          'h-full w-full max-h-full max-w-full object-contain object-center opacity-90 dark:invert',
          blurred && 'blur-[1.25px] opacity-75',
        )}
        draggable={false}
      />
    </div>
  );
}
