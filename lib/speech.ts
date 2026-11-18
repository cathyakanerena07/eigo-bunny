export function speechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function englishVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

export function speak(text: string, voiceName: string | null, rate = 0.95): void {
  if (!ttsSupported()) return;
  const voices = englishVoices();
  const voice = voices.find((v) => v.name === voiceName) ?? voices.find((v) => v.lang === 'en-US') ?? voices[0];
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-US';
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export type Recognizer = {
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

type Handlers = {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd: () => void;
  onError: (message: string) => void;
};

// One utterance per tap. Simpler than continuous mode, and far more reliable
// outside desktop Chrome.
export function createRecognizer(handlers: Handlers): Recognizer | null {
  if (!speechSupported()) return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as new () => SpeechRecognition;

  let rec: SpeechRecognition | null = null;
  let finalText = '';

  const make = () => {
    const r = new Ctor();
    r.continuous = false;
    r.interimResults = true;
    r.lang = 'en-US';
    r.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        if (res.isFinal) finalText += `${res[0].transcript} `;
        else interim += res[0].transcript;
      }
      handlers.onPartial(`${finalText}${interim}`.trim());
    };
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      handlers.onError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? 'マイクが使えないみたい。ブラウザの許可を確認してね'
          : `音声エラー: ${e.error}`,
      );
    };
    r.onend = () => {
      const text = finalText.trim();
      if (text) handlers.onFinal(text);
      handlers.onEnd();
    };
    return r;
  };

  return {
    start() {
      finalText = '';
      rec = make();
      try {
        rec.start();
      } catch {
        handlers.onEnd();
      }
    },
    stop() {
      try {
        rec?.stop();
      } catch {
        // already stopped
      }
    },
    dispose() {
      try {
        rec?.abort();
      } catch {
        // noop
      }
      rec = null;
    },
  };
}
