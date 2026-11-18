import { SAFETY, fetchWithRetry, geminiConfig, geminiUrl } from '@/lib/gemini';
import type { Turn } from '@/lib/types';

type Body = {
  petName: string;
  topicTitle: string;
  turns: Turn[];
};

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    newWords: { type: 'ARRAY', items: { type: 'STRING' } },
    newPhrases: { type: 'ARRAY', items: { type: 'STRING' } },
    facts: { type: 'ARRAY', items: { type: 'STRING' } },
    praise: { type: 'STRING' },
  },
  required: ['newWords', 'newPhrases', 'facts', 'praise'],
};

export async function POST(req: Request) {
  const { apiKey, model } = geminiConfig();
  const body = (await req.json()) as Body;

  if (!apiKey) {
    return Response.json({ newWords: [], newPhrases: [], facts: [], praise: 'よく話せたね！', mock: true });
  }

  const transcript = body.turns
    .map((t) => `${t.role === 'user' ? 'LEARNER' : 'BUNNY'}: ${t.text}`)
    .join('\n');

  const prompt = [
    `You are reviewing a short English chat between a Japanese learner and their pet bunny, ${body.petName}.`,
    `Topic: ${body.topicTitle}`,
    '',
    transcript || '(empty)',
    '',
    'Return:',
    '1. `newWords` — up to 4 useful single English words from THIS chat that the learner should keep. Lowercase. Skip words they clearly already use well. Empty array if there are none.',
    '2. `newPhrases` — up to 3 short English phrases (2-6 words) worth remembering from this chat, as the bunny said them or as a natural upgrade of something the learner said.',
    '3. `facts` — up to 3 short facts about the LEARNER worth remembering for next time, written in English in the second person, e.g. "You have a cat called Mugi." Only real facts they stated. Empty array if none.',
    '4. `praise` — one warm sentence IN JAPANESE about what they did well in this chat. Specific, not generic. Casual tone, like a friend.',
    '',
    'JSON only.',
  ].join('\n');

  const upstream = await fetchWithRetry(() =>
    fetch(geminiUrl(model, 'generateContent'), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: SAFETY,
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
          maxOutputTokens: 1200,
        },
      }),
    }),
  );

  if (!upstream.ok) {
    return Response.json({ newWords: [], newPhrases: [], facts: [], praise: 'おつかれさま！' });
  }

  const json = await upstream.json();
  const text: string =
    json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';

  try {
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json({ newWords: [], newPhrases: [], facts: [], praise: 'おつかれさま！' });
  }
}
