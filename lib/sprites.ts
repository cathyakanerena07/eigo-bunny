export type Stage = 'egg' | 'baby' | 'junior' | 'adult' | 'special';

export type Expression = 'idle' | 'happy' | 'surprised' | 'talking' | 'sleepy';

// '#' dark outline, 'o' cream body, 'A' accessory colour, '.' transparent
export type Sprite = string[];

const JUNIOR: Sprite = [
  '...##......##...',
  '..####....####..',
  '.######..######.',
  '.######..######.',
  '..############..',
  '..############..',
  '..############..',
  '.###oooooooo###.',
  '.##o##oooo##o##.',
  '.##oooooooooo##.',
  '.##oooo##oooo##.',
  '.##oooooooooo##.',
  '.##oooooooooo##.',
  '..##oooooooo##..',
  '..############..',
  '...##......##...',
];

const EGG: Sprite = [
  '................',
  '......####......',
  '.....#oooo#.....',
  '....#oooooo#....',
  '....#oooooo#....',
  '...#oooooooo#...',
  '..#oooooooooo#..',
  '..#o#oo#oo#oo#..',
  '..#ooo#oo#ooo#..',
  '..#oooooooooo#..',
  '..#oooooooooo#..',
  '...#oooooooo#...',
  '...#oooooooo#...',
  '....#oooooo#....',
  '.....######.....',
  '................',
];

const BABY: Sprite = [
  '................',
  '................',
  '....##....##....',
  '...####..####...',
  '...##########...',
  '..############..',
  '..##oooooooo##..',
  '..#o##oooo##o#..',
  '..#oooo##oooo#..',
  '..#oooooooooo#..',
  '..#oooooooooo#..',
  '..##oooooooo##..',
  '...##########...',
  '....########....',
  '....##....##....',
  '................',
];

const ADULT: Sprite = [
  '...##......##...',
  '...##......##...',
  '..####....####..',
  '.######..######.',
  '..############..',
  '..############..',
  '..############..',
  '.###oooooooo###.',
  '.##o##oooo##o##.',
  '.##oooooooooo##.',
  '.##oooo##oooo##.',
  '.##oooooooooo##.',
  '..##oooooooo##..',
  '..############..',
  '..###......###..',
  '..###......###..',
];

const SPECIAL: Sprite = [
  '...##..##..##...',
  '...##......##...',
  '..####....####..',
  '.######..######.',
  '..############..',
  '..############..',
  '..############..',
  '.###oooooooo###.',
  '.##o##oooo##o##.',
  '.##oooooooooo##.',
  '.##oooo##oooo##.',
  '.##oo######oo##.',
  '..##oooooooo##..',
  '..############..',
  '..###......###..',
  '..###......###..',
];

export const STAGE_SPRITE: Record<Stage, Sprite> = {
  egg: EGG,
  baby: BABY,
  junior: JUNIOR,
  adult: ADULT,
  special: SPECIAL,
};

export const STAGE_JA: Record<Stage, string> = {
  egg: 'たまご',
  baby: 'ベビー',
  junior: 'ジュニア',
  adult: 'アダルト',
  special: 'スペシャル',
};

// Rows that carry the face, per stage. Expressions rewrite exactly these.
const FACE_ROWS: Record<Stage, { eyes: number; mouth: number } | null> = {
  egg: null,
  baby: { eyes: 7, mouth: 8 },
  junior: { eyes: 8, mouth: 10 },
  adult: { eyes: 8, mouth: 10 },
  special: { eyes: 8, mouth: 10 },
};

const FACES: Record<Stage, Record<'eyes' | 'mouth', Record<string, string>>> = {
  egg: { eyes: {}, mouth: {} },
  baby: {
    eyes: {
      open: '..#o##oooo##o#..',
      shut: '..#oooooooooo#..',
      wide: '..#o##oooo##o#..',
    },
    mouth: {
      line: '..#oooo##oooo#..',
      none: '..#oooooooooo#..',
      wide: '..#ooo####ooo#..',
      o: '..#oooo##oooo#..',
    },
  },
  junior: {
    eyes: { open: '.##o##oooo##o##.', shut: '.##oooooooooo##.', wide: '.##o##oooo##o##.' },
    mouth: {
      line: '.##oooo##oooo##.',
      none: '.##oooooooooo##.',
      wide: '.##ooo####ooo##.',
      o: '.##ooo####ooo##.',
    },
  },
  adult: {
    eyes: { open: '.##o##oooo##o##.', shut: '.##oooooooooo##.', wide: '.##o##oooo##o##.' },
    mouth: {
      line: '.##oooo##oooo##.',
      none: '.##oooooooooo##.',
      wide: '.##ooo####ooo##.',
      o: '.##ooo####ooo##.',
    },
  },
  special: {
    eyes: { open: '.##o##oooo##o##.', shut: '.##oooooooooo##.', wide: '.##o##oooo##o##.' },
    mouth: {
      line: '.##oooo##oooo##.',
      none: '.##oooooooooo##.',
      wide: '.##ooo####ooo##.',
      o: '.##ooo####ooo##.',
    },
  },
};

type FramePair = [{ eyes: string; mouth: string }, { eyes: string; mouth: string }];

const EXPRESSION: Record<Expression, FramePair> = {
  idle: [
    { eyes: 'open', mouth: 'line' },
    { eyes: 'shut', mouth: 'line' },
  ],
  happy: [
    { eyes: 'shut', mouth: 'wide' },
    { eyes: 'shut', mouth: 'wide' },
  ],
  surprised: [
    { eyes: 'wide', mouth: 'o' },
    { eyes: 'wide', mouth: 'none' },
  ],
  talking: [
    { eyes: 'open', mouth: 'line' },
    { eyes: 'open', mouth: 'wide' },
  ],
  sleepy: [
    { eyes: 'shut', mouth: 'line' },
    { eyes: 'shut', mouth: 'line' },
  ],
};

export const ACCESSORY: Record<string, Sprite> = {
  'hat-cap': ['..AAAAAAAA..', '.AAAAAAAAAA.'],
  'hat-crown': ['..A.AAAA.A..', '..AAAAAAAA..'],
  'ribbon-pink': ['AAA.........', '.AA.........'],
  'glasses-round': ['..AAA..AAA..'],
};

// Row the overlay starts on, in the 12x12 grid.
export const ACCESSORY_ROW: Record<string, number> = {
  'hat-cap': 3,
  'hat-crown': 1,
  'ribbon-pink': 2,
  'glasses-round': 6,
};

export type Cell = [number, number, '#' | 'o' | 'A'];

export function spriteCells(
  stage: Stage,
  expression: Expression,
  which: 0 | 1,
  accessories: string[] = [],
): Cell[] {
  const rows = [...STAGE_SPRITE[stage]];
  const face = FACE_ROWS[stage];

  if (face) {
    const frame = EXPRESSION[expression][which];
    const set = FACES[stage];
    rows[face.eyes] = set.eyes[frame.eyes] ?? rows[face.eyes];
    rows[face.mouth] = set.mouth[frame.mouth] ?? rows[face.mouth];
  }

  const out: Cell[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < 16; x += 1) {
      const c = row[x];
      if (c === '#') out.push([x, y, '#']);
      else if (c === 'o') out.push([x, y, 'o']);
    }
  });

  if (stage !== 'egg') {
    for (const id of accessories) {
      const art = ACCESSORY[id];
      if (!art) continue;
      const offset = ACCESSORY_ROW[id] ?? 0;
      art.forEach((row, i) => {
        for (let x = 0; x < 16; x += 1) {
          if (row[x] === 'A') out.push([x, i + offset, 'A']);
        }
      });
    }
  }

  return out;
}

export function stageFromLevel(level: number, hasTalked: boolean): Stage {
  if (!hasTalked) return 'egg';
  if (level <= 2) return 'baby';
  if (level <= 6) return 'junior';
  if (level <= 12) return 'adult';
  return 'special';
}

export const STAGE_ORDER: Stage[] = ['egg', 'baby', 'junior', 'adult', 'special'];

export const STAGE_MIN_LEVEL: Record<Stage, number> = {
  egg: 0,
  baby: 1,
  junior: 3,
  adult: 7,
  special: 13,
};
