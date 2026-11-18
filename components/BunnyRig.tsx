'use client';

import { useEffect, useId, useState } from 'react';
import { POSE_DEF, PROPS, type Eyes, type Mouth, type Part } from '@/lib/bunnyPose';
import type { Pose } from '@/lib/bunnyStates';
import { ACCESSORY, ACCESSORY_ROW } from '@/lib/sprites';

export type RigAccessory = { id: string; color: string };

const MAP = [
  '..##....##..',
  '.####..####.',
  '.####..####.',
  '.##########.',
  '..########..',
  '.##oooooo##.',
  '.#o#oooo#o#.',
  '##ooo##ooo##',
  '###oooooo###',
  '.#oooooooo#.',
  '..########..',
  '..##....##..',
];

const GRID = 12;
const EYE_L: [number, number][] = [[3, 6]];
const EYE_R: [number, number][] = [[8, 6]];
const MOUTH_CELLS: [number, number][] = [[5, 7], [6, 7]];
const EAR_ROWS = 3;
const at = (l: [number, number][], x: number, y: number) => l.some(([a, b]) => a === x && b === y);

type Cell = { x: number; y: number; kind: '#' | 'o' };

const earL: Cell[] = [];
const earR: Cell[] = [];
const body: Cell[] = [];

MAP.forEach((row, y) => {
  for (let x = 0; x < GRID; x += 1) {
    const c = row[x];
    if (c === '.') continue;
    const hole = at(EYE_L, x, y) || at(EYE_R, x, y) || at(MOUTH_CELLS, x, y);
    const cell: Cell = { x, y, kind: hole ? 'o' : (c as '#' | 'o') };
    if (y < EAR_ROWS) (x < GRID / 2 ? earL : earR).push(cell);
    else {
      body.push(cell);
      // The join row rides with the ears so moving them never opens a seam.
      if (y === EAR_ROWS) (x < GRID / 2 ? earL : earR).push(cell);
    }
  }
});

function Rects({ cells }: { cells: Cell[] }) {
  return (
    <>
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x}
          y={c.y}
          width="1.02"
          height="1.02"
          fill={c.kind === '#' ? 'var(--dark)' : 'var(--cream)'}
        />
      ))}
    </>
  );
}

function tf(p?: Part): string {
  if (!p) return 'translate(0px, 0px) scale(1, 1)';
  return `translate(${p.x ?? 0}px, ${p.y ?? 0}px) scale(${p.sx ?? 1}, ${p.sy ?? 1})`;
}

const EYE_TF: Record<Eyes, { sy: number; dy: number; sx?: number }> = {
  open: { sy: 1, dy: 0 },
  shut: { sy: 0.14, dy: 0.1 },
  wide: { sy: 1.7, dy: -0.2 },
  sad: { sy: 0.66, dy: 0.25 },
  wink: { sy: 1, dy: 0 },
};

const MOUTH_TF: Record<Mouth, { sx: number; sy: number; dy: number; o: number }> = {
  line: { sx: 1, sy: 1, dy: 0, o: 1 },
  open: { sx: 1.1, sy: 2.3, dy: 0.2, o: 1 },
  wide: { sx: 2, sy: 1.1, dy: 0, o: 1 },
  tiny: { sx: 0.55, sy: 0.9, dy: 0, o: 1 },
  frown: { sx: 1.5, sy: 0.9, dy: 0.35, o: 1 },
  none: { sx: 1, sy: 1, dy: 0, o: 0 },
};

type Props = {
  pose?: Pose;
  talking?: boolean;
  accessories?: RigAccessory[];
  size?: number;
  className?: string;
};

export default function BunnyRig({ pose = 'normal', talking = false, accessories = [], size = 190, className = '' }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const def = POSE_DEF[pose] ?? {};
  const [blink, setBlink] = useState(false);
  const [twitch, setTwitch] = useState<'l' | 'r' | null>(null);
  const [saccade, setSaccade] = useState(0);

  const sleeping = pose === 'sleep' || pose === 'liedown';

  useEffect(() => {
    if (sleeping) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          if (!alive) return;
          if (!document.hidden) {
            setBlink(true);
            t = setTimeout(() => {
              setBlink(false);
              loop();
            }, 115);
            return;
          }
          loop();
        },
        2200 + Math.random() * 4200,
      );
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [sleeping]);

  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          if (!alive) return;
          if (!document.hidden) {
            setTwitch(Math.random() < 0.5 ? 'l' : 'r');
            setSaccade((Math.random() - 0.5) * 1.4);
            t = setTimeout(() => {
              setTwitch(null);
              setSaccade(0);
              loop();
            }, 700);
            return;
          }
          loop();
        },
        2800 + Math.random() * 5200,
      );
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const eyes: Eyes = blink && !sleeping ? 'shut' : (def.eyes ?? 'open');
  const mouth: Mouth = def.mouth ?? 'line';
  const e = EYE_TF[eyes];
  const m = MOUTH_TF[mouth];
  const props = def.props ?? [];

  return (
    <svg
      viewBox="-4.7 -3.6 21.4 16.3"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`bunny ${pose}`}
    >
      <style>{`
        .${uid} * { transform-box: view-box; }
        @keyframes ${uid}-breathe { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-0.1px) } }
        @keyframes ${uid}-mouth { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(2.3) } }
        @keyframes ${uid}-prop { 0%,100% { opacity: .75; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-0.35px) } }
        .${uid}-breathe { animation: ${uid}-breathe ${sleeping ? '5.2s' : '3.4s'} ease-in-out infinite; }
        .${uid}-talk { animation: ${uid}-mouth .34s ease-in-out infinite; transform-origin: 6px 7.5px; }
        .${uid}-prop { animation: ${uid}-prop 1.8s ease-in-out infinite; }
        /* Parts glide between poses — this is where the in-betweens come from. */
        .${uid}-part { transition: transform 420ms cubic-bezier(.34,1.3,.5,1); }
        .${uid}-face { transition: transform 200ms ease-out, opacity 200ms ease-out; }
        .${uid}-fade { transition: opacity 260ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .${uid}-breathe, .${uid}-talk, .${uid}-prop { animation: none; }
          .${uid}-part, .${uid}-face, .${uid}-fade { transition: none; }
        }
      `}</style>

      <g className={uid}>
        <ellipse
          className={`${uid}-fade`}
          cx="6"
          cy="12.45"
          rx="3.6"
          ry="0.55"
          fill="var(--dark)"
          opacity={sleeping ? 0.1 : 0.15}
        />

        <g className={`${uid}-part`} style={{ transform: tf(def.body) }}>
          <g className={`${uid}-breathe`}>
            <Rects cells={body} />

            <g
              className={`${uid}-part`}
              style={{ transform: tf({ ...def.earL, y: (def.earL?.y ?? 0) + (twitch === 'l' ? -0.45 : 0) }) }}
            >
              <Rects cells={earL} />
            </g>
            <g
              className={`${uid}-part`}
              style={{ transform: tf({ ...def.earR, y: (def.earR?.y ?? 0) + (twitch === 'r' ? -0.45 : 0) }) }}
            >
              <Rects cells={earR} />
            </g>

            <g className={`${uid}-face`} style={{ transform: `translateX(${saccade * 0.22}px)` }}>
              <g
                className={`${uid}-face`}
                style={{ transform: `translateY(${e.dy}px) scaleY(${eyes === 'wink' ? 0.14 : e.sy})`, transformOrigin: '3.5px 6.5px' }}
              >
                <rect x="3" y="6" width="1.02" height="1.02" fill="var(--dark)" />
              </g>
              <g
                className={`${uid}-face`}
                style={{ transform: `translateY(${e.dy}px) scaleY(${e.sy})`, transformOrigin: '8.5px 6.5px' }}
              >
                <rect x="8" y="6" width="1.02" height="1.02" fill="var(--dark)" />
              </g>
            </g>

            {def.blush && (
              <g className={`${uid}-fade`} opacity="0.8">
                <rect x="2" y="8" width="1.02" height="1.02" fill="var(--pink-deep)" />
                <rect x="9" y="8" width="1.02" height="1.02" fill="var(--pink-deep)" />
              </g>
            )}

            <g className={talking ? `${uid}-talk` : `${uid}-face`}>
              <g
                className={`${uid}-face`}
                style={{
                  transform: `translateY(${m.dy}px) scale(${m.sx}, ${m.sy})`,
                  transformOrigin: '6px 7.5px',
                  opacity: m.o,
                }}
              >
                <rect x="5" y="7" width="2.02" height="1.02" fill="var(--dark)" />
              </g>
            </g>

            {accessories.map((acc) =>
              (ACCESSORY[acc.id] ?? []).map((row, i) =>
                row.split('').map((ch, x) =>
                  ch === 'A' ? (
                    <rect
                      key={`${acc.id}-${x}-${i}`}
                      x={x}
                      y={i + (ACCESSORY_ROW[acc.id] ?? 0)}
                      width="1.02"
                      height="1.02"
                      fill={acc.color}
                    />
                  ) : null,
                ),
              ),
            )}
          </g>
        </g>

        <g className={`${uid}-prop`} key={pose}>
          {props.flatMap((id) =>
            (PROPS[id] ?? []).map(([x, y, fill], i) => (
              <rect key={`${id}-${i}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />
            )),
          )}
        </g>
      </g>
    </svg>
  );
}
