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

export function createGenUIViewport(prompt: string, summary: string, items: GenUIItem[]): GenUIViewport {
  const trimmedPrompt = prompt.trim();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: trimmedPrompt,
    title: deriveShortTitle(trimmedPrompt),
    summary: formatLeadSummary(summary, trimmedPrompt),
    items,
    status: 'ready',
  };
}

export function createLoadingViewport(prompt: string): GenUIViewport {
  const trimmedPrompt = prompt.trim();
  return {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    prompt: trimmedPrompt,
    title: deriveShortTitle(trimmedPrompt),
    summary: '',
    items: [],
    status: 'loading',
  };
}
