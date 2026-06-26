export const MAX_GEN_UI_PROMPT_LENGTH = 300;

export function genUIPromptLengthError(length = MAX_GEN_UI_PROMPT_LENGTH): string {
  return `Please keep your prompt under ${length} characters.`;
}
