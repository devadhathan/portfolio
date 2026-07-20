const ASK_AI_OPEN_KEY = 'portfolio:openAskAI';

export function markOpenAskAI() {
  try {
    sessionStorage.setItem(ASK_AI_OPEN_KEY, '1');
  } catch {}
}

export function consumeOpenAskAI(): boolean {
  try {
    if (sessionStorage.getItem(ASK_AI_OPEN_KEY) === '1') {
      sessionStorage.removeItem(ASK_AI_OPEN_KEY);
      return true;
    }
  } catch {}
  return false;
}
