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
export type Activity = { id: string; frames: Frame[]; ms: number; motion: Motion; motionMs?: number };

export const IDLE_ACTIVITIES: Activity[] = [
  // ねむけ
  { id: 'yawn', ms: 2400, motion: 'slump', motionMs: 2400, frames: [{ pose: 'wait', ms: 800 }, { pose: 'sit', ms: 900 }, { pose: 'normal', ms: 700 }] },
  { id: 'doze-off', ms: 3600, motion: 'slump', motionMs: 1800, frames: [{ pose: 'sit', ms: 1200 }, { pose: 'sleep', ms: 1500 }, { pose: 'sit', ms: 900 }] },
  { id: 'curl-up', ms: 3600, motion: 'settle', motionMs: 1200, frames: [{ pose: 'sit', ms: 900 }, { pose: 'liedown', ms: 1300 }, { pose: 'sleep', ms: 1400 }] },
  { id: 'nap', ms: 3400, motion: 'slump', motionMs: 3400, frames: [{ pose: 'sleep', ms: 1600 }, { pose: 'liedown', ms: 1800 }] },
  { id: 'sleep-twitch', ms: 3000, motion: 'slump', motionMs: 1500, frames: [{ pose: 'sleep', ms: 1400 }, { pose: 'surprised', ms: 300 }, { pose: 'sleep', ms: 1300 }] },
  { id: 'wake-start', ms: 2500, motion: 'pop', motionMs: 830, frames: [{ pose: 'sleep', ms: 900 }, { pose: 'surprised', ms: 400 }, { pose: 'wow', ms: 500 }, { pose: 'normal', ms: 700 }] },
  { id: 'drowsy-nod', ms: 2600, motion: 'nod', motionMs: 1300, frames: [{ pose: 'sit', ms: 700 }, { pose: 'sleep', ms: 600 }, { pose: 'sit', ms: 600 }, { pose: 'normal', ms: 700 }] },
  { id: 'stretch-awake', ms: 2600, motion: 'settle', motionMs: 1300, frames: [{ pose: 'liedown', ms: 1100 }, { pose: 'sit', ms: 800 }, { pose: 'normal', ms: 700 }] },
  { id: 'flop', ms: 3000, motion: 'settle', motionMs: 1400, frames: [{ pose: 'sit', ms: 900 }, { pose: 'liedown', ms: 1600 }] },

  // おどる
  { id: 'dance-wiggle', ms: 2800, motion: 'wiggle', motionMs: 560, frames: [{ pose: 'dance', ms: 280 }, { pose: 'normal', ms: 280 }] },
  { id: 'dance-spin', ms: 2520, motion: 'spin', motionMs: 840, frames: [{ pose: 'dance', ms: 420 }, { pose: 'glad', ms: 420 }] },
  { id: 'dance-hop', ms: 2640, motion: 'hop', motionMs: 660, frames: [{ pose: 'dance', ms: 330 }, { pose: 'jump', ms: 330 }, { pose: 'dance', ms: 330 }, { pose: 'smile', ms: 330 }] },
  { id: 'dance-sway', ms: 3120, motion: 'sway', motionMs: 1040, frames: [{ pose: 'dance', ms: 520, flip: true }, { pose: 'dance', ms: 520 }] },
  { id: 'dance-shake', ms: 2400, motion: 'shake', motionMs: 480, frames: [{ pose: 'dance', ms: 240 }, { pose: 'smile', ms: 240 }] },
  { id: 'disco', ms: 2400, motion: 'wiggle', motionMs: 600, frames: [{ pose: 'dance', ms: 300 }, { pose: 'wave', ms: 300 }, { pose: 'dance', ms: 300, flip: true }, { pose: 'glad', ms: 300 }] },

  // ごはん
  { id: 'nibble', ms: 2700, motion: 'nod', motionMs: 540, frames: [{ pose: 'eat', ms: 280 }, { pose: 'normal', ms: 260 }] },
  { id: 'munch', ms: 2200, motion: 'nod', motionMs: 550, frames: [{ pose: 'eat', ms: 340 }, { pose: 'eat', ms: 340, flip: true }, { pose: 'smile', ms: 420 }] },
  { id: 'big-meal', ms: 3100, motion: 'bob', motionMs: 1000, frames: [{ pose: 'eat', ms: 1200 }, { pose: 'eat', ms: 600, flip: true }, { pose: 'glad', ms: 600 }, { pose: 'smile', ms: 700 }] },
  { id: 'finish-meal', ms: 2400, motion: 'settle', motionMs: 1200, frames: [{ pose: 'eat', ms: 900 }, { pose: 'thanks', ms: 800 }, { pose: 'smile', ms: 700 }] },
  { id: 'yummy', ms: 1800, motion: 'pop', motionMs: 900, frames: [{ pose: 'eat', ms: 700 }, { pose: 'wow', ms: 500 }, { pose: 'glad', ms: 600 }] },

  // あそぶ
  { id: 'play-ball', ms: 3120, motion: 'hop', motionMs: 780, frames: [{ pose: 'play', ms: 400 }, { pose: 'normal', ms: 380 }] },
  { id: 'play-chase', ms: 2500, motion: 'bob', motionMs: 500, frames: [{ pose: 'play', ms: 260 }, { pose: 'run', ms: 240 }] },
  { id: 'play-toss', ms: 3000, motion: 'hop', motionMs: 750, frames: [{ pose: 'play', ms: 360 }, { pose: 'jump', ms: 360 }, { pose: 'play', ms: 360 }, { pose: 'glad', ms: 420 }] },
  { id: 'play-tired', ms: 2200, motion: 'settle', motionMs: 1100, frames: [{ pose: 'play', ms: 700 }, { pose: 'sit', ms: 900 }, { pose: 'smile', ms: 600 }] },

  // 照れる・ハート
  { id: 'shy-peek', ms: 1700, motion: 'peek', motionMs: 1700, frames: [{ pose: 'shy', ms: 600 }, { pose: 'normal', ms: 400 }, { pose: 'shy', ms: 700 }] },
  { id: 'blush', ms: 2100, motion: 'bob', motionMs: 2100, frames: [{ pose: 'shy', ms: 1400 }, { pose: 'smile', ms: 700 }] },
  { id: 'blow-heart', ms: 2300, motion: 'nod', motionMs: 1150, frames: [{ pose: 'heart', ms: 900 }, { pose: 'shy', ms: 600 }, { pose: 'heart', ms: 800 }] },
  { id: 'love-struck', ms: 2300, motion: 'pop', motionMs: 1150, frames: [{ pose: 'heart', ms: 600 }, { pose: 'glad', ms: 500 }, { pose: 'heart', ms: 600 }, { pose: 'smile', ms: 600 }] },
  { id: 'thank-you', ms: 1700, motion: 'nod', motionMs: 850, frames: [{ pose: 'thanks', ms: 1000 }, { pose: 'smile', ms: 700 }] },

  // びっくり
  { id: 'startle', ms: 1500, motion: 'pop', motionMs: 750, frames: [{ pose: 'surprised', ms: 420 }, { pose: 'wow', ms: 460 }, { pose: 'normal', ms: 620 }] },
  { id: 'wow', ms: 1700, motion: 'pop', motionMs: 850, frames: [{ pose: 'wow', ms: 600 }, { pose: 'glad', ms: 500 }, { pose: 'smile', ms: 600 }] },
  { id: 'double-take', ms: 1600, motion: 'shake', motionMs: 800, frames: [{ pose: 'normal', ms: 420 }, { pose: 'surprised', ms: 380 }, { pose: 'normal', ms: 400, flip: true }, { pose: 'surprised', ms: 400 }] },
  { id: 'peekaboo', ms: 2160, motion: 'peek', motionMs: 1080, frames: [{ pose: 'surprised', ms: 520 }, { pose: 'glad', ms: 560 }] },

  // 泣く・いじける
  { id: 'sniffle', ms: 2500, motion: 'slump', motionMs: 1250, frames: [{ pose: 'cry', ms: 900 }, { pose: 'sad', ms: 800 }, { pose: 'cry', ms: 800 }] },
  { id: 'cry-cheer-up', ms: 3000, motion: 'bob', motionMs: 1500, frames: [{ pose: 'cry', ms: 900 }, { pose: 'sad', ms: 700 }, { pose: 'smile', ms: 700 }, { pose: 'glad', ms: 700 }] },
  { id: 'sulk', ms: 2500, motion: 'slump', motionMs: 1250, frames: [{ pose: 'down', ms: 1000 }, { pose: 'angry', ms: 600 }, { pose: 'down', ms: 900 }] },
  { id: 'grumble', ms: 1600, motion: 'shake', motionMs: 560, frames: [{ pose: 'angry', ms: 400 }, { pose: 'normal', ms: 400 }] },

  // のび・毛づくろい
  { id: 'stretch', ms: 2100, motion: 'settle', motionMs: 2100, frames: [{ pose: 'sit', ms: 1300 }, { pose: 'normal', ms: 800 }] },
  { id: 'groom-ear', ms: 3060, motion: 'wiggle', motionMs: 1020, frames: [{ pose: 'wait', ms: 520 }, { pose: 'normal', ms: 500, flip: true }] },
  { id: 'big-stretch', ms: 2900, motion: 'settle', motionMs: 1450, frames: [{ pose: 'liedown', ms: 900 }, { pose: 'sit', ms: 800 }, { pose: 'normal', ms: 600 }, { pose: 'smile', ms: 600 }] },

  // きょろきょろ
  { id: 'look-around', ms: 2200, motion: 'sway', motionMs: 2200, frames: [{ pose: 'normal', ms: 1100, flip: true }, { pose: 'normal', ms: 1100 }] },
  { id: 'look-up', ms: 1900, motion: 'bob', motionMs: 950, frames: [{ pose: 'normal', ms: 700 }, { pose: 'surprised', ms: 500 }, { pose: 'normal', ms: 700 }] },
  { id: 'wait-around', ms: 2400, motion: 'breathe', motionMs: 2400, frames: [{ pose: 'wait', ms: 1500 }, { pose: 'normal', ms: 900 }] },
  { id: 'ponder', ms: 2700, motion: 'bob', motionMs: 1350, frames: [{ pose: 'think', ms: 1100 }, { pose: 'wait', ms: 700 }, { pose: 'think', ms: 900 }] },
  { id: 'daydream', ms: 2800, motion: 'sway', motionMs: 2800, frames: [{ pose: 'think', ms: 1300 }, { pose: 'smile', ms: 800 }, { pose: 'think', ms: 700 }] },
  { id: 'wander-left', ms: 2560, motion: 'travel', motionMs: 2560, frames: [{ pose: 'walk', ms: 340 }, { pose: 'normal', ms: 300 }] },
  { id: 'wander-right', ms: 2560, motion: 'drift', motionMs: 2560, frames: [{ pose: 'walk', ms: 340 }, { pose: 'normal', ms: 300 }] },

  // あいさつ・よろこぶ
  { id: 'wave-hello', ms: 1880, motion: 'sway', motionMs: 940, frames: [{ pose: 'wave', ms: 480 }, { pose: 'normal', ms: 460 }] },
  { id: 'greet', ms: 1400, motion: 'bob', motionMs: 700, frames: [{ pose: 'greet', ms: 800 }, { pose: 'smile', ms: 600 }] },
  { id: 'bye-bye', ms: 1920, motion: 'sway', motionMs: 960, frames: [{ pose: 'bye', ms: 500 }, { pose: 'wave', ms: 460 }] },
  { id: 'call-out', ms: 2160, motion: 'shake', motionMs: 540, frames: [{ pose: 'call', ms: 600 }, { pose: 'normal', ms: 480 }] },
  { id: 'cheer', ms: 2400, motion: 'pop', motionMs: 800, frames: [{ pose: 'wow', ms: 400 }, { pose: 'glad', ms: 400 }] },
  { id: 'celebrate', ms: 1700, motion: 'hop', motionMs: 850, frames: [{ pose: 'levelup', ms: 600 }, { pose: 'wow', ms: 500 }, { pose: 'glad', ms: 600 }] },
  { id: 'spin-happy', ms: 1680, motion: 'spin', motionMs: 840, frames: [{ pose: 'glad', ms: 420 }, { pose: 'smile', ms: 420 }] },
  { id: 'hop-along', ms: 1980, motion: 'hop', motionMs: 660, frames: [{ pose: 'jump', ms: 340 }, { pose: 'normal', ms: 320 }] },
];

/**
 * Trips across the room. The pose cycle plays in place while a separate layer
 * carries the bunny to a new spot, so the legs move at their own speed.
 */
export const ROAM_ACTIVITIES: Activity[] = [
  { id: 'toddle', ms: 4800, motion: 'bob', motionMs: 800, frames: [{ pose: 'walk', ms: 420 }, { pose: 'normal', ms: 380 }] },
  { id: 'walk-by', ms: 3360, motion: 'bob', motionMs: 560, frames: [{ pose: 'walk', ms: 300 }, { pose: 'normal', ms: 260 }] },
  { id: 'stroll', ms: 4200, motion: 'bob', motionMs: 700, frames: [{ pose: 'walk', ms: 380 }, { pose: 'smile', ms: 320 }] },
  { id: 'march', ms: 2760, motion: 'bob', motionMs: 460, frames: [{ pose: 'walk', ms: 240 }, { pose: 'normal', ms: 220 }] },
  { id: 'sleepy-shuffle', ms: 5800, motion: 'slump', motionMs: 1160, frames: [{ pose: 'walk', ms: 600 }, { pose: 'normal', ms: 560 }] },
  { id: 'skip', ms: 3000, motion: 'hop', motionMs: 500, frames: [{ pose: 'jump', ms: 260 }, { pose: 'smile', ms: 240 }] },
  { id: 'hop-over', ms: 2600, motion: 'hop', motionMs: 650, frames: [{ pose: 'jump', ms: 330 }, { pose: 'normal', ms: 320 }] },
  { id: 'bunny-hop', ms: 2820, motion: 'hop', motionMs: 470, frames: [{ pose: 'jump', ms: 240 }, { pose: 'normal', ms: 230 }] },
  { id: 'run-by', ms: 1750, motion: 'bob', motionMs: 350, frames: [{ pose: 'run', ms: 190 }, { pose: 'normal', ms: 160 }] },
  { id: 'dash', ms: 1620, motion: 'bob', motionMs: 270, frames: [{ pose: 'run', ms: 140 }, { pose: 'normal', ms: 130 }] },
];

/** How often an idle turn is a trip across the room rather than a gesture. */
export const ROAM_CHANCE = 0.62;
/** Furthest the bunny strays from the middle, as a share of its own width. */
export const ROAM_SPAN = 46;

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
  { ms: 1600, motion: 'pop', motionMs: 800, frames: [{ pose: 'heart', ms: 400 }, { pose: 'glad', ms: 400 }] },
  { ms: 1400, motion: 'nod', motionMs: 700, frames: [{ pose: 'eat', ms: 360 }, { pose: 'wow', ms: 340 }] },
  { ms: 1400, motion: 'peek', motionMs: 980, frames: [{ pose: 'shy', ms: 500 }, { pose: 'smile', ms: 480 }] },
  { ms: 1500, motion: 'settle', motionMs: 1000, frames: [{ pose: 'cry', ms: 500 }, { pose: 'glad', ms: 500 }] },
  { ms: 1480, motion: 'hop', motionMs: 740, frames: [{ pose: 'play', ms: 380 }, { pose: 'jump', ms: 360 }] },
  { ms: 1400, motion: 'sway', motionMs: 820, frames: [{ pose: 'greet', ms: 420 }, { pose: 'wave', ms: 400 }] },
  { ms: 1400, motion: 'pop', motionMs: 900, frames: [{ pose: 'levelup', ms: 480 }, { pose: 'wow', ms: 420 }] },
];

export const REACTIONS: Record<'tap' | 'spam' | 'hold', Reaction> = {
  tap: TAP_POOL[0],
  spam: { ms: 1600, motion: 'shake', motionMs: 420, frames: [{ pose: 'surprised', ms: 320 }, { pose: 'angry', ms: 380 }] },
  hold: { ms: 2400, motion: 'nod', motionMs: 1200, frames: [{ pose: 'heart', ms: 700 }, { pose: 'thanks', ms: 600 }] },
};

// Measured from the end of the last activity, so this is the pause between
// scenes — short enough that the bunny is almost always mid-action.
export const IDLE_MIN_MS = 700;
export const IDLE_MAX_MS = 2400;
export const SLEEPY_AFTER_MS = 45_000;
export const DOZING_AFTER_MS = 100_000;
export const SLEEPING_AFTER_MS = 180_000;
export const TICK_MS = 250;
