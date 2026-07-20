import { isPortfolioGenUITopic } from '@/lib/gen-ui-on-topic';

/** Short conversational prompts for Ask AI — answered locally, no quota used. */

const GREETING =
  /^(?:(?:hi|hello|hey|yo|howdy|hiya)[,.!\s]*)*(?:how are you(?: doing)?|how'?s it going|how do you do)?[!.?\s]*$|^(?:how are you(?: doing)?|how'?s it going|how do you do|good morning|good afternoon|good evening|what'?s up|sup)[!.?\s]*$/i;

const THANKS = /^(thanks|thank you|ty|thx|appreciate it|nice|cool|great|awesome|ok|okay|got it)[!.?\s]*$/i;

const META =
  /^(help|what can you (do|help)|who are you|what are you|how does this work)[!.?\s]*$/i;

export function isAskAIConversationalPrompt(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  return GREETING.test(trimmed) || THANKS.test(trimmed) || META.test(trimmed);
}

export function askAIConversationalReply(prompt: string): string {
  const trimmed = prompt.trim();

  if (GREETING.test(trimmed)) {
    if (/\bhow are you\b/i.test(trimmed)) {
      return "Hey! I'm doing well, thanks for asking. I'm Dev's portfolio assistant — ask me about his projects, skills, career, or impact.";
    }
    return "Hey! I'm Dev's portfolio assistant. Ask me about his projects, skills, career, or impact — pick a suggestion below or type your own question.";
  }

  if (THANKS.test(trimmed)) {
    return "Happy to help. Ask me anything else about Dev's work whenever you're ready.";
  }

  return "I can answer questions about Dev's work — projects like Finshots and Nesoi, his skills, career, and impact as a designer who ships code. Try a suggestion below or ask something specific.";
}

function offTopicSubject(prompt: string): string {
  const trimmed = prompt.trim().replace(/[?.!]+$/, '');

  const whatIs = trimmed.match(/^what (?:is|are) (?:the |a |an )?(.+)$/i);
  if (whatIs?.[1]) {
    const noun = whatIs[1].trim();
    return noun.match(/^(a|an|the)\s/i) ? noun : `the ${noun}`;
  }

  const whoIs = trimmed.match(/^who (?:is|are|was|were) (?:the |a |an )?(.+)$/i);
  if (whoIs?.[1]) {
    const noun = whoIs[1].trim();
    return noun.match(/^(a|an|the)\s/i) ? noun : `${noun}`;
  }

  if (trimmed.length <= 48) return `"${trimmed}"`;
  return 'that';
}

export function isOffTopicAskAI(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed || isAskAIConversationalPrompt(trimmed)) return false;
  return !isPortfolioGenUITopic(trimmed);
}

/** @deprecated use isOffTopicAskAI */
export function isClearlyOffTopicAskAI(prompt: string): boolean {
  return isOffTopicAskAI(prompt);
}

export function offTopicAskAIReply(prompt: string): string {
  const subject = offTopicSubject(prompt);
  const topicPhrase =
    subject === 'that' ? 'Questions like that are' : `Questions about ${subject} are`;

  return `I'm here to help with questions about Dev. ${topicPhrase} a bit outside my wheelhouse. 😊

Do you have any questions about his projects, skills, career, or why teams hire him?`;
}

export const ASK_AI_OFF_TOPIC_STRIKE_LIMIT = 5;

export function countConsecutiveOffTopicAskAI(
  userPrompts: string[],
): number {
  let count = 0;
  for (let i = userPrompts.length - 1; i >= 0; i--) {
    const prompt = userPrompts[i]?.trim() ?? '';
    if (!prompt || !isOffTopicAskAI(prompt)) break;
    count++;
  }
  return count;
}

export function offTopicAskAIStrikeError(): string {
  return `You've sent ${ASK_AI_OFF_TOPIC_STRIKE_LIMIT} off-topic questions in a row. Ask AI only answers questions about Dev — his projects, skills, career, and impact.

Try one of the suggestions below, or close and reopen the panel to start fresh.`;
}

export function resolveOffTopicAskAIResponse(
  consecutiveStrikes: number,
  prompt: string,
): { reply: string; blocked: boolean; strikes: number } {
  const strikes = consecutiveStrikes + 1;
  if (strikes >= ASK_AI_OFF_TOPIC_STRIKE_LIMIT) {
    return { reply: offTopicAskAIStrikeError(), blocked: true, strikes };
  }
  return { reply: offTopicAskAIReply(prompt), blocked: false, strikes };
}

/** @deprecated use offTopicAskAIReply */
export function clearlyOffTopicAskAIReply(prompt: string): string {
  return offTopicAskAIReply(prompt);
}
