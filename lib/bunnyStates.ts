// State table modelled on clawd-on-desk: every state is a frame sequence with
// its own timing, a minimum display time, and an optional auto-return.
// Single stills are alternated to synthesise movement, the way its APNGs do.

export const POSES = [
  'normal', 'smile', 'surprised', 'glad', 'sad', 'angry', 'sleep',
  'jump', 'run', 'walk', 'dance', 'wave', 'think', 'shy',
  'greet', 'bye', 'thanks', 'heart', 'wow', 'cry', 'down',
  'eat', 'play', 'sit', 'liedown', 'wait', 'call', 'levelup',
] as const;

export type Pose = (typeof POSES)[number];

export const POSE_JA: Record<Pose, string> = {
  normal: '通常', smile: 'にっこり', surprised: 'びっくり', glad: 'うれしい', sad: '悲しい', angry: '怒る', sleep: '眠る',
  jump: 'ジャンプ', run: '走る', walk: '歩く', dance: 'おどる', wave: '手を振る', think: '考える', shy: '照れる',
  greet: '挨拶', bye: 'バイバイ', thanks: 'ありがとう', heart: 'ハート', wow: 'びっくり喜び', cry: '泣く', down: 'がっかり',
  eat: 'ごはん', play: '遊ぶ', sit: '座る', liedown: '寝転ぶ', wait: '待つ', call: '呼ぶ', levelup: 'レベルアップ',
};

export type RigMood = 'idle' | 'listening' | 'talking' | 'thinking' | 'sleepy';

export type Frame = { pose: Pose; ms: number; flip?: boolean };

/**
 * The reference project draws 29-64 in-between frames per animation. With 28
 * stills we cannot, so the body travels along a continuous transform curve
 * while the frames cut underneath — that is what reads as one movement.
 */
export type Motion =
  | 'bob' | 'hop' | 'travel' | 'sway' | 'wiggle' | 'settle' | 'slump' | 'breathe'
  | 'spin' | 'shake' | 'nod' | 'pop' | 'drift' | 'peek' | 'none';

export type StateDef = {
  /** Use the part-animated SVG rig instead of stills (true part motion). */
  rig?: RigMood;
  frames?: Frame[];
  motion?: Motion;
  /** Length of one motion cycle. Defaults to the frame cycle length. */
  motionMs?: number;
  /** Hold at least this long before anything else may take over. */
  minDisplayMs?: number;
  /** Drop back to idle after this long. Omit to stay until told otherwise. */
  autoReturnMs?: number;
};

export type BunnyState =
  | 'idle'
  | 'listening'
  | 'talking'
  | 'thinking'
  | 'happy'
  | 'sad'
  | 'walking'
  | 'running'
  | 'sleepy'
  | 'dozing'
  | 'sleeping'
  | 'waking'
  | 'levelup';

export const STATES: Record<BunnyState, StateDef> = {
  idle: { rig: 'idle' },
  listening: { rig: 'listening' },
  talking: { rig: 'talking' },
  thinking: { rig: 'thinking', minDisplayMs: 1000 },

  happy: {
    motion: 'hop',
    motionMs: 760,
    frames: [
      { pose: 'glad', ms: 420 },
      { pose: 'smile', ms: 380 },
    ],
    minDisplayMs: 1600,
    autoReturnMs: 2600,
  },
  sad: {
    motion: 'slump',
    motionMs: 2400,
    frames: [
      { pose: 'sad', ms: 900 },
      { pose: 'down', ms: 700 },
    ],
    minDisplayMs: 2000,
    autoReturnMs: 4000,
  },
  walking: {
    motion: 'bob',
    motionMs: 560,
    frames: [
      { pose: 'walk', ms: 300 },
      { pose: 'normal', ms: 260 },
    ],
  },
  running: {
    motion: 'bob',
    motionMs: 350,
    frames: [
      { pose: 'run', ms: 190 },
      { pose: 'normal', ms: 160 },
    ],
  },

  // Falling asleep is staged, like yawning -> dozing -> collapsing -> sleeping.
  sleepy: {
    motion: 'bob',
    motionMs: 3400,
    frames: [
      { pose: 'sit', ms: 2600 },
      { pose: 'normal', ms: 900 },
    ],
    minDisplayMs: 3000,
  },
  dozing: {
    motion: 'slump',
    motionMs: 5800,
    frames: [
      { pose: 'sit', ms: 3200 },
      { pose: 'sleep', ms: 2600 },
    ],
    minDisplayMs: 3000,
  },
  sleeping: {
    motion: 'slump',
    motionMs: 7200,
    frames: [
      { pose: 'sleep', ms: 3400 },
      { pose: 'liedown', ms: 3800 },
    ],
  },
  waking: {
    motion: 'settle',
    motionMs: 740,
    frames: [
      { pose: 'surprised', ms: 420 },
      { pose: 'normal', ms: 320 },
    ],
    minDisplayMs: 700,
    autoReturnMs: 1500,
  },

  levelup: {
    motion: 'hop',
    motionMs: 900,
    frames: [
      { pose: 'levelup', ms: 520 },
      { pose: 'wow', ms: 380 },
    ],
    minDisplayMs: 2200,
  },
};

/** One-shot idle activities. Every remaining pose gets screen time here. */
export const IDLE_ACTIVITIES: { id: string; frames: Frame[]; ms: number; motion: Motion; motionMs?: number }[] = [
  {
    id: 'look-around',
    ms: 2600,
    motion: 'sway',
    motionMs: 2600,
    frames: [{ pose: 'normal', ms: 1100, flip: true }, { pose: 'normal', ms: 1100 }],
  },
  { id: 'wave', ms: 2000, motion: 'sway', motionMs: 1000, frames: [{ pose: 'wave', ms: 500 }, { pose: 'normal', ms: 500 }] },
  { id: 'greet', ms: 1800, motion: 'bob', motionMs: 900, frames: [{ pose: 'greet', ms: 900 }, { pose: 'normal', ms: 450 }] },
  { id: 'think', ms: 2600, motion: 'bob', motionMs: 2600, frames: [{ pose: 'think', ms: 1600 }, { pose: 'normal', ms: 600 }] },
  { id: 'dance', ms: 3000, motion: 'wiggle', motionMs: 600, frames: [{ pose: 'dance', ms: 300 }, { pose: 'normal', ms: 300 }] },
  { id: 'hop', ms: 1600, motion: 'hop', motionMs: 800, frames: [{ pose: 'jump', ms: 420 }, { pose: 'normal', ms: 380 }] },
  { id: 'eat', ms: 2800, motion: 'bob', motionMs: 700, frames: [{ pose: 'eat', ms: 700 }, { pose: 'normal', ms: 700 }] },
  { id: 'play', ms: 2600, motion: 'hop', motionMs: 860, frames: [{ pose: 'play', ms: 430 }, { pose: 'normal', ms: 430 }] },
  { id: 'shy', ms: 2000, motion: 'bob', motionMs: 2000, frames: [{ pose: 'shy', ms: 1300 }, { pose: 'normal', ms: 600 }] },
  { id: 'stretch', ms: 2400, motion: 'settle', motionMs: 2400, frames: [{ pose: 'sit', ms: 1500 }, { pose: 'normal', ms: 700 }] },
  { id: 'walk-by', ms: 3000, motion: 'travel', motionMs: 3000, frames: [{ pose: 'walk', ms: 300 }, { pose: 'normal', ms: 260 }] },
  { id: 'smile', ms: 1700, motion: 'bob', motionMs: 1700, frames: [{ pose: 'smile', ms: 1000 }, { pose: 'normal', ms: 500 }] },

  { id: 'spin', ms: 1800, motion: 'spin', motionMs: 900, frames: [{ pose: 'glad', ms: 450 }, { pose: 'smile', ms: 450 }] },
  { id: 'cheer', ms: 2200, motion: 'pop', motionMs: 740, frames: [{ pose: 'wow', ms: 370 }, { pose: 'glad', ms: 370 }] },
  { id: 'heart', ms: 2400, motion: 'nod', motionMs: 1200, frames: [{ pose: 'heart', ms: 1300 }, { pose: 'shy', ms: 700 }] },
  { id: 'thanks', ms: 2000, motion: 'nod', motionMs: 1000, frames: [{ pose: 'thanks', ms: 1100 }, { pose: 'smile', ms: 600 }] },
  { id: 'peekaboo', ms: 2200, motion: 'peek', motionMs: 1100, frames: [{ pose: 'surprised', ms: 520 }, { pose: 'glad', ms: 520 }] },
  { id: 'call-out', ms: 2100, motion: 'shake', motionMs: 700, frames: [{ pose: 'call', ms: 700 }, { pose: 'normal', ms: 500 }] },
  { id: 'run-by', ms: 2400, motion: 'drift', motionMs: 2400, frames: [{ pose: 'run', ms: 190 }, { pose: 'normal', ms: 160 }] },
  { id: 'bye', ms: 2000, motion: 'sway', motionMs: 1000, frames: [{ pose: 'bye', ms: 520 }, { pose: 'wave', ms: 480 }] },
  { id: 'grumble', ms: 1700, motion: 'shake', motionMs: 560, frames: [{ pose: 'angry', ms: 420 }, { pose: 'normal', ms: 420 }] },
  { id: 'flop', ms: 3000, motion: 'settle', motionMs: 1400, frames: [{ pose: 'sit', ms: 900 }, { pose: 'liedown', ms: 1600 }] },
  { id: 'daydream', ms: 2800, motion: 'sway', motionMs: 2800, frames: [{ pose: 'think', ms: 1500 }, { pose: 'smile', ms: 900 }] },
  { id: 'double-hop', ms: 1900, motion: 'hop', motionMs: 470, frames: [{ pose: 'jump', ms: 240 }, { pose: 'normal', ms: 230 }] },
  { id: 'wiggle-butt', ms: 2000, motion: 'wiggle', motionMs: 420, frames: [{ pose: 'normal', ms: 420, flip: true }, { pose: 'normal', ms: 420 }] },
  { id: 'nibble', ms: 2600, motion: 'nod', motionMs: 620, frames: [{ pose: 'eat', ms: 320 }, { pose: 'smile', ms: 300 }] },
];

/** Tap, double-tap and hold reactions. */
export type Reaction = { frames: Frame[]; ms: number; motion: Motion; motionMs?: number };

/** A tap picks one of these at random, so the same poke never looks the same. */
export const TAP_POOL: Reaction[] = [
  { ms: 1200, motion: 'hop', motionMs: 620, frames: [{ pose: 'jump', ms: 380 }, { pose: 'glad', ms: 400 }] },
  { ms: 1300, motion: 'pop', motionMs: 650, frames: [{ pose: 'wow', ms: 340 }, { pose: 'smile', ms: 340 }] },
  { ms: 1400, motion: 'spin', motionMs: 700, frames: [{ pose: 'glad', ms: 350 }, { pose: 'dance', ms: 350 }] },
  { ms: 1500, motion: 'nod', motionMs: 760, frames: [{ pose: 'heart', ms: 420 }, { pose: 'shy', ms: 420 }] },
  { ms: 1300, motion: 'peek', motionMs: 660, frames: [{ pose: 'surprised', ms: 340 }, { pose: 'glad', ms: 340 }] },
  { ms: 1400, motion: 'wiggle', motionMs: 460, frames: [{ pose: 'dance', ms: 230 }, { pose: 'smile', ms: 230 }] },
  { ms: 1300, motion: 'shake', motionMs: 620, frames: [{ pose: 'call', ms: 330 }, { pose: 'normal', ms: 330 }] },
  { ms: 1500, motion: 'bob', motionMs: 760, frames: [{ pose: 'thanks', ms: 420 }, { pose: 'smile', ms: 400 }] },
];

export const REACTIONS: Record<'tap' | 'spam' | 'hold', Reaction> = {
  tap: TAP_POOL[0],
  spam: { ms: 1600, motion: 'shake', motionMs: 420, frames: [{ pose: 'surprised', ms: 320 }, { pose: 'angry', ms: 380 }] },
  hold: { ms: 2400, motion: 'nod', motionMs: 1200, frames: [{ pose: 'heart', ms: 700 }, { pose: 'thanks', ms: 600 }] },
};

// Clawd's own idle ladder, shortened for a phone app you glance at.
export const IDLE_MIN_MS = 3600;
export const IDLE_MAX_MS = 9000;
export const SLEEPY_AFTER_MS = 45_000;
export const DOZING_AFTER_MS = 100_000;
export const SLEEPING_AFTER_MS = 180_000;
export const TICK_MS = 250;
