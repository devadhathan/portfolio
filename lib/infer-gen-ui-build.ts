import { isWordsmithQuery } from '@/lib/enrich-gen-ui';

const SPECIFIC_REQUEST =
  /\b(finshots|nesoi|crm|falcon|onboarding|ditto|wordsmith|impact|metrics?|skills?|career|education|resume|timeline|downloads|conversion|design system)\b/i;

const VAGUE_REQUEST =
  /\b(projects?|works?|portfolio|case studies?|show me|tell me about|what has he|everything|all of)\b/i;

export function isSpecificGenUIRequest(command: string): boolean {
  if (isWordsmithQuery(command)) return true;
  if (SPECIFIC_REQUEST.test(command)) return true;
  // Short answers after clarification: "Finshots", "the CRM one", "impact"
  if (command.trim().split(/\s+/).length <= 6 && !VAGUE_REQUEST.test(command)) {
    return SPECIFIC_REQUEST.test(command) || /\b(crm|nesoi|falcon|finshots)\b/i.test(command);
  }
  return false;
}

export function agentWasClarifying(message: string): boolean {
  return /\?/.test(message) && /\b(which|would you|do you want|interested|prefer|like to see|narrow|focus)\b/i.test(message);
}

export function willLikelyBuildGenUI(
  mode: 'ask' | 'agent',
  command: string,
  priorMessages: Array<{ role: string; content: string }>,
): boolean {
  if (mode !== 'agent') return false;
  if (isWordsmithQuery(command)) return true;
  if (isSpecificGenUIRequest(command)) return true;
  if (/\b(all|every|overview|each|multiple)\b/i.test(command)) return true;

  const agentMessages = priorMessages.filter((m) => m.role === 'agent' || m.role === 'assistant');
  const lastAgent = agentMessages[agentMessages.length - 1];
  return Boolean(lastAgent?.content.includes('?'));
}

export function inferGenUIBuild(options: {
  mode: 'ask' | 'agent';
  command: string;
  result: {
    buildViewport?: boolean;
    cardIds: string[];
    message: string;
    steps?: Array<{ tool: string }>;
  };
  priorMessages: Array<{ role: string; content: string }>;
}): boolean {
  const { mode, command, result, priorMessages } = options;
  if (mode !== 'agent') return false;
  if (isWordsmithQuery(command)) return true;

  const hasCardIds = result.cardIds.length > 0;
  const usedBuildTool = result.steps?.some((s) => s.tool === 'build_gen_ui_view') ?? false;
  const usedShowCards = result.steps?.some((s) => s.tool === 'show_cards') ?? false;

  if (result.buildViewport && hasCardIds) return true;
  if (usedBuildTool && hasCardIds) return true;
  if (usedShowCards && hasCardIds) return true;

  // Still asking — don't build yet
  if (agentWasClarifying(result.message) && !hasCardIds) return false;

  const agentMessages = priorMessages.filter((m) => m.role === 'agent' || m.role === 'assistant');
  const lastAgentBeforeReply = agentMessages[agentMessages.length - 1];
  const userAnsweringQuestion = lastAgentBeforeReply?.content.includes('?');

  if (userAnsweringQuestion && !agentWasClarifying(result.message)) return true;
  if (isSpecificGenUIRequest(command) && !agentWasClarifying(result.message)) return true;
  if (/\b(all|every|overview|each|multiple|everything)\b/i.test(command) && !agentWasClarifying(result.message)) return true;

  return false;
}
