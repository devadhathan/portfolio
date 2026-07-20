import type { GenUIItem } from '@/lib/gen-ui-registry';
import { deriveShortTitle, formatLeadSummary } from '@/lib/enrich-gen-ui';

export type GenUIViewport = {
  id: string;
  prompt: string;
  title: string;
  summary: string;
  items: GenUIItem[];
  status?: 'loading' | 'ready';
};

type CreateGenUIViewportOptions = {
  title?: string;
  /** When true, summary is shown as-is (no fallback rewriting). */
  rawSummary?: boolean;
  /** Reuse a loading viewport id so ready state replaces the skeleton in place. */
  id?: string;
};

export function createGenUIViewport(
  prompt: string,
  summary: string,
  items: GenUIItem[],
  options?: CreateGenUIViewportOptions,
): GenUIViewport {
  const trimmedPrompt = prompt.trim();
  return {
    id: options?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: trimmedPrompt,
    title: options?.title ?? deriveShortTitle(trimmedPrompt),
    summary: options?.rawSummary ? summary : formatLeadSummary(summary, trimmedPrompt),
    items,
    status: 'ready',
  };
}

export function createLoadingViewport(prompt: string, id?: string): GenUIViewport {
  const trimmedPrompt = prompt.trim();
  return {
    id: id ?? `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    prompt: trimmedPrompt,
    title: deriveShortTitle(trimmedPrompt),
    summary: '',
    items: [],
    status: 'loading',
  };
}
