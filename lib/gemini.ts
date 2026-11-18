export const DEFAULT_MODEL = 'gemini-flash-lite-latest';

export function geminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  return { apiKey, model };
}

export function geminiUrl(model: string, method: 'generateContent' | 'streamGenerateContent'): string {
  const base = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`;
  return method === 'streamGenerateContent' ? `${base}?alt=sse` : base;
}

export const SAFETY = [
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
].map((category) => ({ category, threshold: 'BLOCK_ONLY_HIGH' }));

const RETRYABLE = new Set([429, 500, 503]);

// The free tier returns 503 "high demand" fairly often; one call should not die for it.
export async function fetchWithRetry(
  make: () => Promise<Response>,
  attempts = 3,
  baseDelayMs = 600,
): Promise<Response> {
  let last: Response | null = null;
  for (let i = 0; i < attempts; i += 1) {
    const res = await make();
    if (!RETRYABLE.has(res.status)) return res;
    last = res;
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i));
    }
  }
  return last as Response;
}
