// An 8-bit loop synthesised in the browser: no audio file to ship, and it sits
// in the same key whatever the device. Web Audio needs a user gesture to start.

type Note = number | null;

const BPM = 104;
const STEP = 60 / BPM / 2; // one eighth note
const LOOK_AHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

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
  start: () => Promise<void>;
  stop: () => void;
  setVolume: (v: number) => void;
};

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

  return {
    async start() {
      if (running) return;
      running = true;
      if (!ctx) {
        ctx = new Ctx();
        master = ctx.createGain();
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') await ctx.resume();
      if (!running) return;
      if (timer) clearInterval(timer);
      master!.gain.cancelScheduledValues(ctx.currentTime);
      master!.gain.value = volume;
      step = 0;
      nextAt = ctx.currentTime + 0.08;
      schedule();
      timer = setInterval(schedule, LOOK_AHEAD_MS);
    },
    stop() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
      if (master && ctx) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      }
    },
    setVolume(v: number) {
      volume = v;
      if (master) master.gain.value = v;
    },
  };
}
