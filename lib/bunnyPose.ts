import type { Pose } from './bunnyStates';

// Poses are part transforms, not bitmaps. Because every part is a live element,
// the renderer can interpolate between any two poses — which is where the
// in-between frames come from without drawing a single extra image.

export type Eyes = 'open' | 'shut' | 'wide' | 'sad' | 'wink';
export type Mouth = 'line' | 'open' | 'wide' | 'none' | 'frown' | 'tiny';

export type Part = { x?: number; y?: number; sx?: number; sy?: number };

export type PropId =
  | 'heart'
  | 'hearts'
  | 'note'
  | 'notes'
  | 'sparkle'
  | 'sparkles'
  | 'zzz'
  | 'question'
  | 'exclaim'
  | 'sweat'
  | 'anger'
  | 'tears'
  | 'crown'
  | 'carrot'
  | 'ball'
  | 'dots'
  | 'lines';

export type PoseDef = {
  earL?: Part;
  earR?: Part;
  body?: Part;
  eyes?: Eyes;
  mouth?: Mouth;
  blush?: boolean;
  props?: PropId[];
};

export const POSE_DEF: Record<Pose, PoseDef> = {
  normal: {},
  smile: { eyes: 'shut', mouth: 'wide', blush: true, props: ['lines'] },
  surprised: { eyes: 'wide', mouth: 'open', earL: { y: -0.52 }, earR: { y: -0.52 }, props: ['exclaim'] },
  glad: { eyes: 'shut', mouth: 'wide', blush: true, body: { y: -0.38 }, props: ['sparkles'] },
  sad: { eyes: 'sad', mouth: 'frown', earL: { y: 0.6 }, earR: { y: 0.6 }, props: ['sweat'] },
  angry: { eyes: 'wide', mouth: 'frown', earL: { y: -0.3 }, earR: { y: -0.3 }, props: ['anger'] },
  sleep: { eyes: 'shut', mouth: 'tiny', earL: { y: 0.83, x: -0.3 }, earR: { y: 0.83, x: 0.3 }, body: { y: 0.45, sy: 0.94 }, props: ['zzz'] },

  jump: { eyes: 'wide', mouth: 'open', earL: { y: -0.68 }, earR: { y: -0.68 }, body: { y: -0.9, sy: 1.05 }, props: ['lines'] },
  run: { eyes: 'open', mouth: 'open', earL: { y: -0.38, x: -0.38 }, earR: { y: -0.22, x: -0.38 }, body: { x: 0.22 }, props: ['lines'] },
  walk: { eyes: 'open', mouth: 'line', earL: { y: -0.15 }, earR: { y: 0.15 }, body: { y: -0.15 } },
  dance: { eyes: 'shut', mouth: 'wide', earL: { y: -0.45, x: -0.22 }, earR: { y: 0.22, x: 0.22 }, body: { x: 0.3 }, props: ['notes'] },
  wave: { eyes: 'shut', mouth: 'wide', earL: { y: -0.38 }, body: { x: -0.22 }, props: ['note'] },
  think: { eyes: 'sad', mouth: 'tiny', earL: { y: 0.3 }, earR: { y: -0.22 }, props: ['question'] },
  shy: { eyes: 'shut', mouth: 'tiny', blush: true, body: { y: 0.15, sy: 0.97 }, props: ['heart'] },

  greet: { eyes: 'shut', mouth: 'wide', earL: { y: -0.45 }, earR: { y: -0.45 }, props: ['sparkle'] },
  bye: { eyes: 'shut', mouth: 'wide', earR: { y: -0.52, x: 0.22 }, body: { x: 0.15 }, props: ['lines'] },
  thanks: { eyes: 'shut', mouth: 'wide', blush: true, body: { y: 0.22 }, props: ['heart'] },
  heart: { eyes: 'shut', mouth: 'wide', blush: true, props: ['hearts'] },
  wow: { eyes: 'wide', mouth: 'open', earL: { y: -0.75 }, earR: { y: -0.75 }, body: { y: -0.45 }, props: ['sparkles'] },
  cry: { eyes: 'shut', mouth: 'open', earL: { y: 0.75 }, earR: { y: 0.75 }, props: ['tears'] },
  down: { eyes: 'sad', mouth: 'frown', earL: { y: 0.9 }, earR: { y: 0.9 }, body: { y: 0.38, sy: 0.95 } },

  eat: { eyes: 'shut', mouth: 'open', blush: true, props: ['carrot'] },
  play: { eyes: 'open', mouth: 'wide', earL: { y: -0.3 }, body: { y: -0.3 }, props: ['ball'] },
  sit: { eyes: 'open', mouth: 'tiny', earL: { y: 0.38 }, earR: { y: 0.38 }, body: { y: 0.52, sy: 0.93 } },
  liedown: { eyes: 'shut', mouth: 'tiny', earL: { y: 1.05, x: -0.6 }, earR: { y: 1.05, x: 0.6 }, body: { y: 0.83, sy: 0.86, sx: 1.08 }, props: ['zzz'] },
  wait: { eyes: 'open', mouth: 'tiny', earL: { y: 0.22 }, props: ['dots'] },
  call: { eyes: 'open', mouth: 'open', earL: { y: -0.22 }, earR: { y: -0.22 }, props: ['lines'] },
  levelup: { eyes: 'shut', mouth: 'wide', blush: true, body: { y: -0.52 }, props: ['crown', 'sparkles'] },
};

type PropCell = [number, number, string];

// Small pixel decorations, drawn around the body.
export const PROPS: Record<PropId, PropCell[]> = {
  heart: [
    [12, 2, 'var(--pink-deep)'], [13, 2, 'var(--pink-deep)'],
    [11, 3, 'var(--pink-deep)'], [12, 3, 'var(--pink-deep)'], [13, 3, 'var(--pink-deep)'], [14, 3, 'var(--pink-deep)'],
    [12, 4, 'var(--pink-deep)'], [13, 4, 'var(--pink-deep)'],
  ],
  hearts: [
    [13, 1, 'var(--pink-deep)'], [14, 1, 'var(--pink-deep)'], [13, 2, 'var(--pink-deep)'], [14, 2, 'var(--pink-deep)'],
    [-3, 3, 'var(--pink-deep)'], [-2, 3, 'var(--pink-deep)'], [-3, 4, 'var(--pink-deep)'], [-2, 4, 'var(--pink-deep)'],
    [12, 6, 'var(--pink-deep)'],
  ],
  note: [[13, 1, 'var(--lavender-deep)'], [13, 2, 'var(--lavender-deep)'], [13, 3, 'var(--lavender-deep)'], [12, 3, 'var(--lavender-deep)'], [14, 0, 'var(--lavender-deep)']],
  notes: [
    [13, 0, 'var(--pink-deep)'], [13, 1, 'var(--pink-deep)'], [12, 1, 'var(--pink-deep)'],
    [-2, 3, 'var(--lavender-deep)'], [-2, 4, 'var(--lavender-deep)'], [-3, 4, 'var(--lavender-deep)'],
  ],
  sparkle: [[13, 1, '#ffd84d'], [12, 2, '#ffd84d'], [14, 2, '#ffd84d'], [13, 3, '#ffd84d']],
  sparkles: [
    [13, 0, '#ffd84d'], [12, 1, '#ffd84d'], [14, 1, '#ffd84d'], [13, 2, '#ffd84d'],
    [-2, 2, '#ffd84d'], [-3, 3, '#ffd84d'], [-1, 3, '#ffd84d'], [-2, 4, '#ffd84d'],
  ],
  zzz: [[12, 0, 'var(--lavender-deep)'], [13, 0, 'var(--lavender-deep)'], [13, 1, 'var(--lavender-deep)'], [12, 2, 'var(--lavender-deep)'], [13, 2, 'var(--lavender-deep)']],
  question: [[13, 0, 'var(--sky-deep)'], [14, 0, 'var(--sky-deep)'], [14, 1, 'var(--sky-deep)'], [13, 2, 'var(--sky-deep)'], [13, 4, 'var(--sky-deep)']],
  exclaim: [[13, 0, 'var(--pink-deep)'], [13, 1, 'var(--pink-deep)'], [13, 2, 'var(--pink-deep)'], [13, 4, 'var(--pink-deep)']],
  sweat: [[12, 2, 'var(--sky-deep)'], [12, 3, 'var(--sky-deep)'], [13, 3, 'var(--sky-deep)']],
  anger: [[12, 0, 'var(--pink-deep)'], [14, 0, 'var(--pink-deep)'], [13, 1, 'var(--pink-deep)'], [12, 2, 'var(--pink-deep)'], [14, 2, 'var(--pink-deep)']],
  tears: [[3, 7, 'var(--sky-deep)'], [3, 8, 'var(--sky-deep)'], [8, 7, 'var(--sky-deep)'], [8, 8, 'var(--sky-deep)']],
  crown: [[4, -2, '#ffd84d'], [6, -2, '#ffd84d'], [8, -2, '#ffd84d'], [4, -1, '#ffd84d'], [5, -1, '#ffd84d'], [6, -1, '#ffd84d'], [7, -1, '#ffd84d'], [8, -1, '#ffd84d']],
  carrot: [[5, 9, '#ff9a4d'], [6, 9, '#ff9a4d'], [7, 9, '#ff9a4d'], [8, 8, '#8fd8a8'], [8, 9, '#8fd8a8']],
  ball: [[-2, 9, 'var(--pink-deep)'], [-1, 9, 'var(--pink-deep)'], [-2, 10, 'var(--pink-deep)'], [-1, 10, 'var(--pink-deep)']],
  dots: [[12, 5, 'var(--ink-soft)'], [13, 5, 'var(--ink-soft)'], [14, 5, 'var(--ink-soft)']],
  lines: [
    [-2, 4, 'var(--ink-soft)'], [-2, 5, 'var(--ink-soft)'],
    [13, 4, 'var(--ink-soft)'], [13, 5, 'var(--ink-soft)'],
  ],
};
