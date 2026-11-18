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

// Accessories are drawn in their own palette: A main, B shade, C highlight.
export type Paint = 'A' | 'B' | 'C';

// Where the art hangs: the top of the head (row 4 on every hatched stage) or
// the eye row, which sits a pixel higher on the baby.
type Anchor = 'head' | 'eyes';

type AccessoryArt = { rows: Sprite; row: number; anchor: Anchor };

// 16x16 sprite bunny.
export const ACCESSORY: Record<string, AccessoryArt> = {
  'hat-cap': {
    anchor: 'head',
    row: 4,
    rows: [
      '...AAAAAAAAAA...',
      '...AAAAAAAAAA...',
      '..BBBBBBBBBBBB..',
    ],
  },
  'hat-crown': {
    anchor: 'head',
    row: 4,
    rows: [
      '...A..A..A..A...',
      '...AAAACCAAAA...',
    ],
  },
  'ribbon-pink': {
    anchor: 'head',
    row: 3,
    rows: [
      '..AA.AA.........',
      '...ABA..........',
      '..AA.AA.........',
    ],
  },
  'glasses-round': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '...AAAA..AAAA...',
      '...A..ABBA..A...',
      '...AAAA..AAAA...',
    ],
  },
  'hat-beanie': {
    anchor: 'head',
    row: 3,
    rows: [
      '.......CC.......',
      '...ACCAAAAAAA...',
      '..AAAAAAAAAAAA..',
      '..BBBBBBBBBBBB..',
    ],
  },
  'hat-straw': {
    anchor: 'head',
    row: 4,
    rows: [
      '....ACCAAAAA....',
      '....AAAAAAAA....',
      'BBBBBBBBBBBBBBBB',
    ],
  },
  'hat-party': {
    anchor: 'head',
    row: 1,
    rows: [
      '.......CC.......',
      '......AAAA......',
      '.....ACCCCA.....',
      '....AAAAAAAA....',
      '...AAAAAAAAAA...',
      '..BBBBBBBBBBBB..',
    ],
  },
  'hat-headphones': {
    anchor: 'head',
    row: 4,
    rows: [
      '...AAAAAAAAAA...',
      '..B..........B..',
      '.AA..........AA.',
      '.AC..........CA.',
      '.AC..........CA.',
      '.BB..........BB.',
    ],
  },
  'ribbon-big': {
    anchor: 'head',
    row: 4,
    rows: [
      '..AAAA.BB.AAAA..',
      '.AAACA.BB.ACAAA.',
      '..AAAA.BB.AAAA..',
    ],
  },
  'ribbon-flower': {
    anchor: 'head',
    row: 3,
    rows: [
      '............A...',
      '...........ACA..',
      '............B...',
    ],
  },
  'glasses-sun': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '...AAAA..AAAA...',
      '...ACAABBAACA...',
      '...BBBB..BBBB...',
    ],
  },
  'glasses-heart': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '..AA.AA..AA.AA..',
      '..ACCCABBACCCA..',
      '...AAA....AAA...',
      '....A......A....',
    ],
  },
  'glasses-mask': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '..AAAAAAAAAAAA..',
      'BBAACCAAAACCAABB',
    ],
  },
  'scarf-knit': {
    anchor: 'eyes',
    row: 4,
    rows: [
      '.AACCAACCAACCAA.',
      '..BBBBBBBBBBBB..',
      '...AAA..........',
      '...AA...........',
    ],
  },
  'scarf-bandana': {
    anchor: 'eyes',
    row: 4,
    rows: [
      '.ACAAACAAACAAAC.',
      '....AAAAAAAA....',
      '......BAAB......',
    ],
  },
  'cheek-blush': {
    anchor: 'eyes',
    row: 1,
    rows: [
      '...CA......AC...',
      '...AB......BA...',
    ],
  },
  'cheek-freckles': {
    anchor: 'eyes',
    row: 1,
    rows: [
      '...A.A....A.A...',
      '....C......C....',
      '...B........B...',
    ],
  },
  'cheek-star': {
    anchor: 'eyes',
    row: 1,
    rows: [
      '...........A....',
      '..........ACA...',
      '...........B....',
    ],
  },
};

// 12x12 part-based rig. Eyes sit at (3,6) and (8,6), ears on rows 0-2.
export const ACCESSORY_RIG: Record<string, AccessoryArt> = {
  'hat-cap': {
    anchor: 'head',
    row: 3,
    rows: [
      '..AAAAAAAA..',
      '..AAAAAAAA..',
      '.BBBBBBBBBB.',
    ],
  },
  'hat-crown': {
    anchor: 'head',
    row: 3,
    rows: [
      '..A.A..A.A..',
      '..AAACCAAA..',
    ],
  },
  'ribbon-pink': {
    anchor: 'head',
    row: 1,
    rows: [
      'AA.AA.......',
      '.ABA........',
      'AA.AA.......',
    ],
  },
  'glasses-round': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '..AAA..AAA..',
      '..A.ABBA.A..',
      '..AAA..AAA..',
    ],
  },
  'hat-beanie': {
    anchor: 'head',
    row: 2,
    rows: [
      '.....CC.....',
      '..ACAAAAAA..',
      '.AAAAAAAAAA.',
      '.BBBBBBBBBB.',
    ],
  },
  'hat-straw': {
    anchor: 'head',
    row: 3,
    rows: [
      '...ACCAAA...',
      '...AAAAAA...',
      'BBBBBBBBBBBB',
    ],
  },
  'hat-party': {
    anchor: 'head',
    row: 1,
    rows: [
      '.....CC.....',
      '....AAAA....',
      '...ACCCCA...',
      '..AAAAAAAA..',
      '.BBBBBBBBBB.',
    ],
  },
  'hat-headphones': {
    anchor: 'head',
    row: 3,
    rows: [
      '..AAAAAAAA..',
      '.B........B.',
      'AA........AA',
      'AC........CA',
      'BB........BB',
    ],
  },
  'ribbon-big': {
    anchor: 'head',
    row: 3,
    rows: [
      '.AAA.BB.AAA.',
      'AACA.BB.ACAA',
      '.AAA.BB.AAA.',
    ],
  },
  'ribbon-flower': {
    anchor: 'head',
    row: 2,
    rows: [
      '.........A..',
      '........ACA.',
      '.........B..',
    ],
  },
  'glasses-sun': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '..AAA..AAA..',
      '..ACAAAACA..',
      '..BBB..BBB..',
    ],
  },
  'glasses-heart': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '..A.A..A.A..',
      '..ACABBACA..',
      '...A....A...',
    ],
  },
  'glasses-mask': {
    anchor: 'eyes',
    row: -1,
    rows: [
      '.AAAAAAAAAA.',
      'BBACAAAACABB',
    ],
  },
  'scarf-knit': {
    anchor: 'head',
    row: 9,
    rows: [
      '.AACCAACCAA.',
      '..BBBBBBBB..',
      '..AA........',
    ],
  },
  'scarf-bandana': {
    anchor: 'head',
    row: 9,
    rows: [
      '.ACAAACAACA.',
      '...AAAAAA...',
      '....BAAB....',
    ],
  },
  'cheek-blush': {
    anchor: 'head',
    row: 7,
    rows: [
      '..CA....AC..',
      '..AB....BA..',
    ],
  },
  'cheek-freckles': {
    anchor: 'head',
    row: 7,
    rows: [
      '..A.A..A.A..',
      '...C....C...',
      '..B......B..',
    ],
  },
  'cheek-star': {
    anchor: 'head',
    row: 7,
    rows: [
      '........A...',
      '.......ACA..',
      '........B...',
    ],
  },
};

// One colour per item, mixed toward black for the shade and toward white for
// the highlight, so every accessory reads as a shape instead of a flat blob.
function mix(hex: string, to: number, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (to - c) * amount),
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function paintColor(kind: Paint, base: string): string {
  if (kind === 'B') return mix(base, 0, 0.42);
  if (kind === 'C') return mix(base, 255, 0.45);
  return base;
}

export type Cell = [number, number, '#' | 'o' | Paint, string?];


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
      const offset = art.anchor === 'eyes' ? (face?.eyes ?? 8) + art.row : art.row;
      art.rows.forEach((row, i) => {
        for (let x = 0; x < 16; x += 1) {
          const c = row[x];
          if (c === 'A' || c === 'B' || c === 'C') out.push([x, i + offset, c, id]);
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
