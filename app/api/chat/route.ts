import { SAFETY, fetchWithRetry, geminiConfig, geminiUrl } from '@/lib/gemini';
import { buildSystemPrompt, toContents } from '@/lib/prompt';
import { customTopic, topicById } from '@/lib/content/topics';
import type { EnglishLevel, Memory, Turn } from '@/lib/types';

type Body = {
  petName: string;
  topicId: string;
  customText?: string;
  level: EnglishLevel;
  memory: Memory;
  turns: Turn[];
};

const SCHEMA = {
  type: 'OBJECT',
  properties: { en: { type: 'STRING' }, ja: { type: 'STRING' } },
  required: ['en', 'ja'],
};

const MOCK = [
  { en: 'That sounds nice! Tell me more about it.', ja: 'いいね！もっと聞かせて。' },
  { en: 'Oh really? How did that feel?', ja: 'ほんとに？どんな気分だった？' },
  { en: 'I see! And what happened after that?', ja: 'なるほど！そのあとどうなったの？' },
  { en: 'Nice! Do you do that often?', ja: 'いいね！よくやるの？' },
];

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const topic =
    body.topicId === 'custom' && typeof body.customText === 'string' && body.customText.trim()
      ? customTopic(body.customText.slice(0, 160))
      : topicById(body.topicId);
  if (!topic) return Response.json({ error: 'unknown topic' }, { status: 400 });

  const { apiKey, model } = geminiConfig();
  const isOpener = body.turns.length === 0;

  // No key configured: keep the app usable with canned replies, and say so.
  if (!apiKey) {
    const reply = isOpener
      ? { en: topic.opener || `Hi! Let's talk about ${topic.title}. What comes to mind?`, ja: '' }
      : MOCK[Math.min(MOCK.length - 1, Math.floor(body.turns.length / 2)) % MOCK.length];
    return Response.json({ ...reply, mock: true });
  }

  const system = buildSystemPrompt({
    petName: body.petName,
    topic,
    level: body.level,
    memory: body.memory,
    isOpener,
  });

  const contents = toContents(body.turns);
  if (contents.length === 0 || contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: '(the chat just opened)' }] });
  }

  const upstream = await fetchWithRetry(() =>
    fetch(geminiUrl(model, 'generateContent'), {
      method: 'POST',
      signal: AbortSignal.timeout(25_000),
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        safetySettings: SAFETY,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 260,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    }),
  );

  if (!upstream.ok) {
    const hint =
      upstream.status === 429
        ? 'Gemini の無料枠の上限に当たったみたい。少し待ってね'
        : upstream.status === 503
          ? 'Gemini が混雑中。少し待ってね'
          : `Gemini エラー (${upstream.status})`;
    return Response.json({ error: hint }, { status: 502 });
  }

  const json = await upstream.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

  try {
    const parsed = JSON.parse(text) as { en: string; ja: string };
    return Response.json({ en: parsed.en, ja: parsed.ja });
  } catch {
    return Response.json({ error: '返事をうまく受け取れなかった' }, { status: 502 });
  }
}
