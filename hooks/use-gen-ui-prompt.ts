'use client';

import { useCallback, useRef, useState } from 'react';
import { PortfolioAgent, type AgentState } from '@/lib/agent';
import type { LayoutActionCommand } from '@/lib/agent-loop';
import { resolveCardIds } from '@/lib/gen-ui-registry';
import { enrichGenUIItems, isWordsmithQuery, stripMarkdown, WORDSMITH_LOCKED_MESSAGE } from '@/lib/enrich-gen-ui';
import { inferGenUIBuild } from '@/lib/infer-gen-ui-build';
import { createGenUIViewport, type GenUIViewport } from '@/lib/gen-ui-viewport';
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
  onAgentWorking?: (working: boolean, hint?: { prompt?: string }) => void;
  onGenUIViewport?: (viewport: GenUIViewport) => void;
  onStateChange?: (state: AgentState) => void;
};

export function useGenUIPrompt({ onAgentWorking, onGenUIViewport, onStateChange }: UseGenUIPromptOptions) {
  const agentRef = useRef(new PortfolioAgent());
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [promptCount, setPromptCount] = useState(10);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const submitPrompt = useCallback(
    async (command: string) => {
      const trimmed = command.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setHasPrompted(true);
      const skeletonStartedAt = Date.now();
      onAgentWorking?.(true, { prompt: trimmed });

      const nextHistory = [...conversationHistory, { role: 'user' as const, content: trimmed }];

      try {
        try {
          const limitCheck = await fetch('/api/check-prompt-limit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const limitData = await limitCheck.json();
          if (!limitData.allowed) {
            throw new Error(`Prompt limit reached (${limitData.count}/${limitData.limit}). Contact ${resumeData.email}.`);
          }
          if (limitData.remaining !== undefined) setPromptCount(limitData.remaining);
          else setPromptCount((n) => Math.max(0, n - 1));
        } catch (err) {
          if (err instanceof Error && err.message.includes('Prompt limit')) throw err;
          if (promptCount <= 0) throw new Error('Prompt limit reached.');
          setPromptCount((n) => Math.max(0, n - 1));
        }

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
          const err = await response.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || 'Agent request failed');
        }

        const result = (await response.json()) as {
          message: string;
          cardIds: string[];
          layoutCommands: LayoutActionCommand[];
          steps: Array<{ tool: string; args: Record<string, unknown>; result: string }>;
          iterations: number;
        };

        const shouldBuildViewport = inferGenUIBuild({
          mode: 'agent',
          command: trimmed,
          result,
          priorMessages: conversationHistory,
        });

        const wordsmithQuery = isWordsmithQuery(trimmed);
        const finalText = wordsmithQuery
          ? WORDSMITH_LOCKED_MESSAGE
          : (result.message || (shouldBuildViewport ? "Here's what I found." : '')).trim();

        if (result.layoutCommands?.length) {
          const nextState = applyLayoutCommands(agentRef.current, result.layoutCommands);
          onStateChange?.(nextState);
        }

        setConversationHistory([
          ...nextHistory,
          { role: 'assistant', content: stripMarkdown(finalText) },
        ]);

        const parsedItems = resolveCardIds(result.cardIds || []);
        const enrichedItems = enrichGenUIItems(parsedItems, trimmed);

        const minSkeletonMs = 200;
        const elapsed = Date.now() - skeletonStartedAt;
        if (elapsed < minSkeletonMs) {
          await new Promise((resolve) => setTimeout(resolve, minSkeletonMs - elapsed));
        }

        if (enrichedItems.length > 0) {
          onGenUIViewport?.(createGenUIViewport(trimmed, finalText, enrichedItems));
        } else if (finalText) {
          onGenUIViewport?.(createGenUIViewport(trimmed, finalText, []));
        } else {
          onGenUIViewport?.(
            createGenUIViewport(trimmed, 'Something went wrong. Please try again.', []),
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Something went wrong. Please try again.';
        onGenUIViewport?.(createGenUIViewport(trimmed, message, []));
      } finally {
        setIsLoading(false);
        onAgentWorking?.(false);
      }
    },
    [conversationHistory, isLoading, onAgentWorking, onGenUIViewport, onStateChange, promptCount],
  );

  const reset = useCallback(() => {
    setConversationHistory([]);
    setHasPrompted(false);
    setIsLoading(false);
  }, []);

  return { submitPrompt, isLoading, hasPrompted, promptCount, reset };
}
