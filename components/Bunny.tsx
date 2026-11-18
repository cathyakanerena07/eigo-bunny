'use client';

import { useId, useState } from 'react';
import type { Motion, Pose } from '@/lib/bunnyStates';
import { spriteCells, type Expression, type Stage } from '@/lib/sprites';

export type Accessory = { id: string; color: string };

// Falls back to the built-in vector art until the sprite PNGs are in place.
const POSE_EXPRESSION: Record<string, Expression> = {
  normal: 'idle', smile: 'happy', surprised: 'surprised', glad: 'happy', sad: 'idle', angry: 'surprised',
  sleep: 'sleepy', jump: 'happy', run: 'idle', walk: 'idle', dance: 'happy', wave: 'happy', think: 'idle',
  shy: 'happy', greet: 'happy', bye: 'happy', thanks: 'happy', heart: 'happy', wow: 'surprised', cry: 'sleepy',
  down: 'sleepy', eat: 'idle', play: 'happy', sit: 'idle', liedown: 'sleepy', wait: 'idle', call: 'talking',
  levelup: 'happy',
};

type Props = {
  stage: Stage;
  pose?: Pose;
  expression?: Expression;
  flip?: boolean;
  motion?: Motion;
  motionMs?: number;
  /** Changes when a new activity starts, to ease the entry in. */
  cycleKey?: string | number;
  accessories?: Accessory[];
  size?: number;
  className?: string;
};

export default function Bunny({
  stage,
  pose,
  expression,
  flip = false,
  motion = 'breathe' as Motion,
  motionMs = 3200,
  cycleKey,
  accessories = [],
  size = 180,
  className = '',
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [spriteOk, setSpriteOk] = useState(true);

  const exp: Expression = expression ?? (pose ? (POSE_EXPRESSION[pose] ?? 'idle') : 'idle');
  const motionClass = `bn bn-${motion}`;

  if (pose && spriteOk) {
    return (
      <span
        key={cycleKey}
        className={`bn-enter grid place-items-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className={motionClass} style={{ ['--dur' as string]: `${motionMs}ms` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/bunny/bunny-${pose}.png`}
            alt={`bunny ${pose}`}
            onError={() => setSpriteOk(false)}
            style={{
              height: size,
              width: 'auto',
              maxWidth: 'none',
              imageRendering: 'pixelated',
              transform: flip ? 'scaleX(-1)' : undefined,
            }}
            draggable={false}
          />
        </span>
      </span>
    );
  }

  const ids = accessories.map((a) => a.id);
  const accColor = (x: number, y: number) =>
    accessories.find((a) =>
      spriteCells(stage, exp, 0, [a.id]).some(([ax, ay, k]) => k === 'A' && ax === x && ay === y),
    )?.color ?? 'var(--pink-deep)';

  const a = spriteCells(stage, exp, 0, ids);
  const b = spriteCells(stage, exp, 1, ids);
  const speed = exp === 'talking' ? '0.32s' : exp === 'surprised' ? '0.5s' : '3.4s';
  const duty = exp === 'idle' || exp === 'sleepy' ? 93 : 50;

  const fill = (kind: '#' | 'o' | 'A', x: number, y: number) =>
    kind === '#' ? 'var(--dark)' : kind === 'o' ? 'var(--cream)' : accColor(x, y);

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={`${motionClass} ${className}`}
      role="img"
      aria-label={`bunny (${stage})`}
      shapeRendering="crispEdges"
    >
      <style>{`
        @keyframes ${uid}-a { 0%,${duty - 1}% { opacity: 1 } ${duty}%,100% { opacity: 0 } }
        @keyframes ${uid}-b { 0%,${duty - 1}% { opacity: 0 } ${duty}%,100% { opacity: 1 } }
        .${uid}-fa { animation: ${uid}-a ${speed} steps(1) infinite; }
        .${uid}-fb { animation: ${uid}-b ${speed} steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .${uid}-fa { animation: none; opacity: 1 }
          .${uid}-fb { animation: none; opacity: 0 }
        }
      `}</style>
      <g className={`${uid}-fa`}>
        {a.map(([x, y, kind]) => (
          <rect key={`a${x}-${y}-${kind}`} x={x} y={y} width="1" height="1" fill={fill(kind, x, y)} />
        ))}
      </g>
      <g className={`${uid}-fb`}>
        {b.map(([x, y, kind]) => (
          <rect key={`b${x}-${y}-${kind}`} x={x} y={y} width="1" height="1" fill={fill(kind, x, y)} />
        ))}
      </g>
    </svg>
  );
}
