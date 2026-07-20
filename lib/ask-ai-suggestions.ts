import type { LucideIcon } from 'lucide-react';
import { Briefcase, Code2, Sparkles, Trophy } from 'lucide-react';

export type AskAISuggestion = {
  icon: LucideIcon;
  label: string;
};

export const ASK_AI_SUGGESTIONS: AskAISuggestion[] = [
  { icon: Briefcase, label: 'His measurable impact' },
  { icon: Trophy, label: 'Tell me about Finshots' },
  { icon: Code2, label: 'Can he ship code?' },
  { icon: Sparkles, label: 'Why hire Dev?' },
];
