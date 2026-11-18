// An 8-bit loop synthesised in the browser: no audio file to ship, and it sits
// in the same key whatever the device. Web Audio needs a user gesture to start.

type Note = number | null;

const BPM = 104;
const STEP = 60 / BPM / 2; // one eighth note
// iOS parks JS timers while a finger is dragging the page, so queue well ahead:
// the music has to survive a scroll with no scheduler running at all.
const LOOK_AHEAD_MS = 250;
const SCHEDULE_AHEAD = 1.6;

// C5=72 D5=74 E5=76 G5=79 A5=81 — a pentatonic hook over C / G / Am / F.
const LEAD: Note[] = [
  76, 79, 81, 79, 76, 74, 72, null,
  74, 76, 79, null, 76, 74, null, null,
  72, 76, 79, 81, 79, 76, 74, null,
  72, 74, 76, 74, 72, null, null, null,
];

const SPARKLE: Note[] = [
  null, null, 88, null, null, null, 84, null,
  null, null, 86, null, null, null, null, null,
  null, null, 88, null, null, null, 91, null,
  null, null, 84, null, null, null, null, null,
];

// One root per half bar: C2 / G2 / A2 / F2.
const BASS: Note[] = [
  36, null, null, null, 36, null, null, null,
  43, null, null, null, 43, null, null, null,
  45, null, null, null, 45, null, null, null,
  41, null, null, null, 41, null, null, null,
];

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export type Bgm = {
  /** Call inside a real tap: iOS only lets audio wake up from a user gesture. */
  unlock: () => void;
  start: () => Promise<void>;
  stop: () => void;
  /** Nudges the context awake; iOS suspends it whenever it feels like it. */
  keepAlive: () => void;
  /** Silence everything while the app is off screen, without forgetting it was on. */
  pauseForBackground: () => void;
  /** Drops the music under the bunny's voice. */
  duck: (on: boolean) => void;
  setVolume: (v: number) => void;
};

// iOS silences Web Audio when the ring/silent switch is flipped, but not an
// <audio> element. Looping a silent clip puts the tab in the playback category,
// and Web Audio rides along with it.
const SILENCE =
  'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

let silent: HTMLAudioElement | null = null;

function keepSessionAwake(): void {
  if (!silent) {
    silent = new Audio(SILENCE);
    silent.loop = true;
    silent.volume = 0.0001;
    silent.setAttribute('playsinline', '');
  }
  void silent.play().catch(() => {});
}

export function createBgm(): Bgm | null {
  if (typeof window === 'undefined') return null;
  const Ctx = (window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
    | typeof AudioContext
    | undefined;
  if (!Ctx) return null;

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  // Set before the first await: two overlapping start() calls would otherwise
  // each create a scheduler, and stop() could only ever clear one of them.
  let running = false;
  let step = 0;
  let nextAt = 0;
  let volume = 0.16;
  let ducked = false;

  const level = () => (ducked ? volume * 0.22 : volume);

  const pluck = (
    at: number,
    midi: number,
    type: OscillatorType,
    gain: number,
    hold: number,
    detune = 0,
  ) => {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = hz(midi);
    osc.detune.value = detune;
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, at + hold);
    osc.connect(env).connect(master);
    osc.start(at);
    osc.stop(at + hold + 0.03);
  };

  const schedule = () => {
    if (!ctx) return;
    while (nextAt < ctx.currentTime + SCHEDULE_AHEAD) {
      const i = step % LEAD.length;
      const lead = LEAD[i];
      const sparkle = SPARKLE[i];
      const bass = BASS[i];
      if (lead !== null) {
        pluck(nextAt, lead, 'square', 0.26, STEP * 0.85);
        pluck(nextAt, lead, 'square', 0.1, STEP * 0.85, 8);
      }
      if (sparkle !== null) pluck(nextAt, sparkle, 'triangle', 0.14, STEP * 0.6);
      if (bass !== null) pluck(nextAt, bass, 'triangle', 0.34, STEP * 1.7);
      nextAt += STEP;
      step += 1;
    }
  };

  const ensureCtx = (): AudioContext => {
    if (!ctx) {
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
    }
    return ctx;
  };

  return {
    unlock() {
      const c = ensureCtx();
      if (c.state !== 'running') void c.resume();
    },
    async start() {
      if (running) return;
      running = true;
      keepSessionAwake();
      const c = ensureCtx();
      if (c.state !== 'running') await c.resume();
      if (!running) return;
      if (timer) clearInterval(timer);
      // Reconnecting an already-connected node is a no-op, so this is just the
      // undo for the disconnect in stop().
      master!.connect(c.destination);
      master!.gain.cancelScheduledValues(c.currentTime);
      master!.gain.value = level();
      step = 0;
      nextAt = c.currentTime + 0.08;
      schedule();
      timer = setInterval(schedule, LOOK_AHEAD_MS);
    },
    stop() {
      running = false;
      silent?.pause();
      if (timer) clearInterval(timer);
      timer = null;
      if (!master || !ctx) return;
      const c = ctx;
      const m = master;
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.setValueAtTime(m.gain.value, c.currentTime);
      m.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.2);
      // A gain of zero still leaves up to SCHEDULE_AHEAD seconds of notes
      // queued, and Safari does not always honour a ramp it is mid-way through.
      // Cutting the graph and stopping the clock cannot be argued with.
      window.setTimeout(() => {
        if (running) return;
        m.disconnect();
        if (c.state === 'running') void c.suspend();
      }, 240);
    },
    pauseForBackground() {
      if (timer) clearInterval(timer);
      timer = null;
      silent?.pause();
      if (ctx && ctx.state === 'running') void ctx.suspend();
    },
    keepAlive() {
      if (!running || (typeof document !== 'undefined' && document.hidden)) return;
      if (ctx && ctx.state !== 'running') void ctx.resume();
      if (silent?.paused) void silent.play().catch(() => {});
      // A throttled tab leaves nextAt far in the past; resync instead of
      // dumping every missed note at once when it comes back.
      if (ctx && nextAt < ctx.currentTime - 0.5) nextAt = ctx.currentTime + 0.05;
      if (!timer) timer = setInterval(schedule, LOOK_AHEAD_MS);
    },
    duck(on: boolean) {
      ducked = on;
      if (!running) return;
      // iOS hands the audio session to whoever is holding a media element, and
      // that starves speechSynthesis — so let go of it while the bunny talks.
      if (on) silent?.pause();
      else keepSessionAwake();
      if (!master || !ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(Math.max(level(), 0.0001), ctx.currentTime + 0.18);
    },
    setVolume(v: number) {
      volume = v;
      if (master) master.gain.value = level();
    },
  };
}

// One player for the whole app: navigating between tabs must not restart it.
let shared: Bgm | null = null;

export function getBgm(): Bgm | null {
  if (!shared) shared = createBgm();
  return shared;
}
