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

/* ------------------------------------------------------------------ voices */

export type VoicePreset = 'girl' | 'boy' | 'teen-girl' | 'teen-boy' | 'woman' | 'man';

export const VOICE_PRESETS: {
  id: VoicePreset;
  ja: string;
  note: string;
  gender: 'f' | 'm';
  pitch: number;
  rate: number;
}[] = [
  { id: 'girl', ja: '女の子', note: 'たかい', gender: 'f', pitch: 1.75, rate: 0.95 },
  { id: 'boy', ja: '男の子', note: 'げんき', gender: 'm', pitch: 1.6, rate: 0.97 },
  { id: 'teen-girl', ja: '高校生（女）', note: 'すこし低め', gender: 'f', pitch: 1.3, rate: 1.0 },
  { id: 'teen-boy', ja: '高校生（男）', note: 'すこし低め', gender: 'm', pitch: 1.1, rate: 1.0 },
  { id: 'woman', ja: '大人（女）', note: 'おちつき', gender: 'f', pitch: 1.0, rate: 0.95 },
  { id: 'man', ja: '大人（男）', note: 'ひくい', gender: 'm', pitch: 0.8, rate: 0.93 },
];

// Apple and Google ship these under fixed names; matching by name is the only
// reliable way to tell a male voice from a female one.
const FEMALE = ['samantha', 'karen', 'moira', 'tessa', 'fiona', 'victoria', 'allison', 'ava', 'susan', 'zoe', 'serena', 'kate', 'female'];
const MALE = ['daniel', 'alex', 'aaron', 'fred', 'tom', 'oliver', 'rishi', 'arthur', 'gordon', 'lee', 'male'];

function presetOf(id: VoicePreset) {
  return VOICE_PRESETS.find((p) => p.id === id) ?? VOICE_PRESETS[0];
}

function pickVoice(gender: 'f' | 'm', voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const names = gender === 'f' ? FEMALE : MALE;
  const other = gender === 'f' ? MALE : FEMALE;
  const named = voices.find((v) => names.some((n) => v.name.toLowerCase().includes(n)));
  if (named) return named;
  const notOther = voices.find((v) => !other.some((n) => v.name.toLowerCase().includes(n)));
  return notOther ?? voices[0];
}

let unlocked = false;

// iOS blocks an utterance that did not come from a tap, and gives no error for
// it. One silent line inside a real tap buys every later utterance — but it
// takes the audio session to do it, so only call it where sound is the point.
export function unlockSpeech(): void {
  if (unlocked || !ttsSupported()) return;
  unlocked = true;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  window.speechSynthesis.resume();
}

export type SpeakOptions = { preset?: VoicePreset; voiceName?: string | null; onStart?: () => void };

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!ttsSupported()) return;
  const p = presetOf(options.preset ?? 'girl');
  const voices = englishVoices();
  const voice = (options.voiceName ? voices.find((v) => v.name === options.voiceName) : undefined) ?? pickVoice(p.gender, voices);

  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-US';
  u.pitch = p.pitch;
  u.rate = p.rate;
  u.onstart = () => options.onStart?.();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  // Safari parks the queue on its own; resuming an already-running queue is a no-op.
  window.speechSynthesis.resume();
}

// iOS refuses an utterance that did not come from a tap, and gives no error for
// it — so if it never started, say it on the next tap instead.
export function speakWhenAllowed(text: string, options: SpeakOptions = {}): () => void {
  let started = false;
  const go = () =>
    speak(text, {
      ...options,
      onStart: () => {
        started = true;
        options.onStart?.();
      },
    });
  go();
  const retry = () => {
    if (!started) go();
  };
  window.addEventListener('pointerdown', retry, { once: true });
  return () => window.removeEventListener('pointerdown', retry);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/* ------------------------------------------------------- recognition */

export type StopReason = 'user' | 'silence' | 'timeout' | 'error';

export type Recognizer = {
  /** Begin a dictation session. Must be called from a user gesture on iOS. */
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

type Handlers = {
  /** Everything heard so far this session, committed + interim. */
  onText: (text: string) => void;
  onStop: (reason: StopReason) => void;
  onError: (message: string) => void;
};

// iOS Safari ignores `continuous` and ends the session after every pause, so
// we restart it ourselves and keep the transcript across restarts. Each restart
// needs a brand-new instance: a stopped one never takes the microphone again.
const RESTART_MS = 320;
const MAX_SESSION_MS = 120_000;
const MAX_SILENT_RESTARTS = 5;

export function createRecognizer(handlers: Handlers): Recognizer | null {
  if (!speechSupported()) return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as new () => SpeechRecognition;

  let rec: SpeechRecognition | null = null;
  let generation = 0;
  let want = false;
  let committed = '';
  let deadline = 0;
  let silentRestarts = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const kill = () => {
    const r = rec;
    rec = null;
    if (!r) return;
    r.onresult = null;
    r.onerror = null;
    r.onend = null;
    try {
      r.abort();
    } catch {
      // already gone
    }
  };

  const finish = (reason: StopReason) => {
    want = false;
    clearTimer();
    kill();
    handlers.onStop(reason);
  };

  const launch = () => {
    if (!want) return;
    if (Date.now() > deadline) {
      finish('timeout');
      return;
    }
    // A speaking synthesiser steals the microphone on iOS.
    if (ttsSupported() && window.speechSynthesis.speaking) {
      timer = setTimeout(launch, 400);
      return;
    }

    kill();
    const mine = (generation += 1);
    const r = new Ctor();
    rec = r;
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    r.maxAlternatives = 1;

    let heard = false;

    r.onresult = (e: SpeechRecognitionEvent) => {
      if (mine !== generation) return;
      heard = true;
      silentRestarts = 0;
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        if (res.isFinal) committed += `${res[0].transcript.trim()} `;
        else interim += res[0].transcript;
      }
      handlers.onText(`${committed}${interim}`.trim());
    };

    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (mine !== generation) return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        handlers.onError('マイクが使えないみたい。設定でこのサイトのマイクを許可してね');
        finish('error');
        return;
      }
      // no-speech / aborted / network blips are normal; onend handles the retry.
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        handlers.onError(`音声エラー: ${e.error}`);
      }
    };

    r.onend = () => {
      if (mine !== generation || !want) return;
      if (!heard) {
        silentRestarts += 1;
        if (silentRestarts >= MAX_SILENT_RESTARTS) {
          finish('silence');
          return;
        }
      }
      handlers.onText(committed.trim());
      timer = setTimeout(launch, RESTART_MS);
    };

    try {
      r.start();
    } catch {
      // Safari throws if the previous session has not released the mic yet.
      timer = setTimeout(launch, 600);
    }
  };

  return {
    start() {
      clearTimer();
      kill();
      committed = '';
      silentRestarts = 0;
      want = true;
      deadline = Date.now() + MAX_SESSION_MS;
      stopSpeaking();
      launch();
    },
    stop() {
      if (!want) return;
      finish('user');
    },
    dispose() {
      want = false;
      clearTimer();
      kill();
    },
  };
}
