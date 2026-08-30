'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PortfolioAgent, type AgentState } from '@/lib/agent';
import type { LayoutActionCommand } from '@/lib/agent-loop';
import { resolveCardIds } from '@/lib/gen-ui-registry';
import type { GenUIItem } from '@/lib/gen-ui-registry';
import {
  enrichGenUIItems,
  formatLeadSummary,
  isWordsmithQuery,
  stripMarkdown,
  WORDSMITH_LOCKED_MESSAGE,
} from '@/lib/enrich-gen-ui';
import { agentWasClarifying, inferGenUIBuild } from '@/lib/infer-gen-ui-build';
import { isAboutDevQuery } from '@/lib/gen-ui-on-topic';
import { createGenUIViewport, type GenUIViewport } from '@/lib/gen-ui-viewport';
import { genUIPromptLengthError, MAX_GEN_UI_PROMPT_LENGTH } from '@/lib/gen-ui-prompt';
import {
  askAIConversationalReply,
  isAskAIConversationalPrompt,
} from '@/lib/ask-ai-conversational';
import { resumeData } from '@/lib/resume-data';

function applyLayoutCommands(agent: PortfolioAgent, commands: LayoutActionCommand[]): AgentState {
  let nextState = agent.getState();
  for (const cmd of commands) {
    try {
      if (cmd.type === 'reset') {
        agent.reset();
        nextState = agent.getState();
      } else {
        nextState = agent.executeCommand(cmd);
      }
    } catch {
      /* skip invalid layout commands */
    }
  }
  return nextState;
}

type UseGenUIPromptOptions = {
  onAgentWorking?: (working: boolean, hint?: { prompt?: string; pendingId?: string }) => void;
  onGenUIViewport?: (viewport: GenUIViewport) => void;
  onStateChange?: (state: AgentState) => void;
};

export function useGenUIPrompt({ onAgentWorking, onGenUIViewport, onStateChange }: UseGenUIPromptOptions) {
  const agentRef = useRef(new PortfolioAgent());
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [promptLimitLoaded, setPromptLimitLoaded] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  useEffect(() => {
    fetch('/api/check-prompt-limit')
      .then((res) => res.json())
      .then((data: { remaining?: number }) => {
        if (typeof data.remaining === 'number') {
          setPromptCount(data.remaining);
        }
        setPromptLimitLoaded(true);
      })
      .catch(() => {
        setPromptCount(0);
        setPromptLimitLoaded(true);
      });
  }, []);

  const submitPrompt = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed || isLoading || !promptLimitLoaded) return;

      if (promptCount <= 0) {
        setHasPrompted(true);
        onGenUIViewport?.(
          createGenUIViewport(trimmed, `Prompt limit reached. Contact ${resumeData.email}.`, []),
        );
        return;
      }

      if (trimmed.length > MAX_GEN_UI_PROMPT_LENGTH) {
        setHasPrompted(true);
        onGenUIViewport?.(
          createGenUIViewport(trimmed, genUIPromptLengthError(), []),
        );
        return;
      }

      const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      setIsLoading(true);
      setHasPrompted(true);
      const skeletonStartedAt = Date.now();
      onAgentWorking?.(true, { prompt: trimmed, pendingId });

      const nextHistory = [...conversationHistory, { role: 'user' as const, content: trimmed }];

      const finishViewport = async (
        summary: string,
        items: GenUIItem[],
        options?: { title?: string; rawSummary?: boolean },
      ) => {
        const minSkeletonMs = 200;
        const elapsed = Date.now() - skeletonStartedAt;
        if (elapsed < minSkeletonMs) {
          await new Promise((resolve) => setTimeout(resolve, minSkeletonMs - elapsed));
        }
        onGenUIViewport?.(
          createGenUIViewport(trimmed, summary, items, { ...options, id: pendingId }),
        );
      };

      try {
        const sectionSnapshot = agentRef.current.getState().sections.map((s) => ({
          id: s.id,
          title: s.title,
          visible: s.visible,
          priority: s.priority,
          order: s.order,
        }));

        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextHistory,
            mode: 'agent',
            sections: sectionSnapshot,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            setPromptCount(0);
            throw new Error(`Prompt limit reached. Contact ${resumeData.email}.`);
          }
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || 'Agent request failed');
        }

        const result = (await response.json()) as {
          message: string;
          cardIds: string[];
          layoutCommands: LayoutActionCommand[];
          steps: Array<{ tool: string; args: Record<string, unknown>; result: string }>;
          iterations: number;
          promptRemaining?: number;
          conversational?: boolean;
        };

        if (typeof result.promptRemaining === 'number') {
          setPromptCount(result.promptRemaining);
        }

        const conversational =
          Boolean(result.conversational) || isAskAIConversationalPrompt(trimmed);

        if (conversational) {
          const reply =
            (result.message || '').trim() || askAIConversationalReply(trimmed);
          setConversationHistory([
            ...nextHistory,
            { role: 'assistant', content: stripMarkdown(reply) },
          ]);
          await finishViewport(reply, [], { rawSummary: true, title: '' });
          return;
        }

        const shouldBuildViewport = inferGenUIBuild({
          mode: 'agent',
          command: trimmed,
          result,
          priorMessages: conversationHistory,
        });

        const wordsmithQuery = isWordsmithQuery(trimmed);
        const rawMessage = wordsmithQuery
          ? WORDSMITH_LOCKED_MESSAGE
          : (result.message || '').trim();

        let parsedItems = resolveCardIds(result.cardIds || []);
        // About / who-is must never land as a one-line clarifier with no cards.
        if (isAboutDevQuery(trimmed) && parsedItems.length === 0) {
          parsedItems = resolveCardIds([
            'feature:career',
            'feature:hire',
            'chart:impact',
            'case:finshots-news-app:project',
            'case:nesoi-ai-dashboard:project',
          ]);
        }

        // Prefer model prose when strong; otherwise fill a real portfolio narrative.
        let finalText = wordsmithQuery
          ? rawMessage
          : formatLeadSummary(rawMessage, trimmed);
        if (!wordsmithQuery && !finalText && shouldBuildViewport) {
          finalText = formatLeadSummary('', trimmed);
        }
        if (
          !wordsmithQuery &&
          agentWasClarifying(rawMessage) &&
          (isAboutDevQuery(trimmed) || shouldBuildViewport)
        ) {
          finalText = formatLeadSummary('', trimmed);
        }

        if (result.layoutCommands?.length) {
          const nextState = applyLayoutCommands(agentRef.current, result.layoutCommands);
          onStateChange?.(nextState);
        }

        setConversationHistory([
          ...nextHistory,
          { role: 'assistant', content: stripMarkdown(finalText || rawMessage) },
        ]);

        const enrichedItems = shouldBuildViewport
          ? enrichGenUIItems(parsedItems, trimmed)
          : [];

        if (!shouldBuildViewport && enrichedItems.length === 0) {
          // No cards to show, so keep the model's own words — the canned
          // narratives all reference cards that aren't there.
          const reply =
            (rawMessage || finalText).trim() ||
            "I don't have that in Dev's portfolio. Ask about his projects, skills, career, or how to get in touch.";
          await finishViewport(reply, [], { rawSummary: true, title: '' });
          return;
        }

        const narrative =
          finalText ||
          (enrichedItems.length > 0 ? formatLeadSummary('', trimmed) : 'Something went wrong. Please try again.');

        await finishViewport(narrative, enrichedItems);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong. Please try again.';
        // rawSummary so the failure is shown as-is instead of being rewritten
        // into portfolio narrative by formatLeadSummary.
        onGenUIViewport?.(
          createGenUIViewport(trimmed, message, [], { id: pendingId, rawSummary: true, title: '' }),
        );
      } finally {
        setIsLoading(false);
        onAgentWorking?.(false);
      }
    },
    [conversationHistory, isLoading, onAgentWorking, onGenUIViewport, onStateChange, promptCount, promptLimitLoaded],
  );

  const reset = useCallback(() => {
    setConversationHistory([]);
    setHasPrompted(false);
    setIsLoading(false);
  }, []);

  return { submitPrompt, isLoading, hasPrompted, promptCount, promptLimitLoaded, conversationHistory, reset };
}
