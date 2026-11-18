'use client';

import Bunny, { type Accessory } from '@/components/Bunny';
import BunnyRig from '@/components/BunnyRig';
import { useBunnyAnimator, type BunnyState } from '@/lib/bunnyAnim';
import type { Pose } from '@/lib/bunnyStates';
import type { Stage } from '@/lib/sprites';

const STAGE_SCALE: Record<Stage, number> = {
  egg: 0.78,
  baby: 0.84,
  junior: 1,
  adult: 1.1,
  special: 1.18,
};

const MOOD_POSE: Record<string, Pose> = {
  idle: 'normal',
  listening: 'wait',
  talking: 'call',
  thinking: 'think',
  sleepy: 'sit',
};

type Props = {
  stage: Stage;
  state: BunnyState;
  accessories?: Accessory[];
  size?: number;
  /** Tap reactions, random idle activities and the sleep ladder. */
  interactive?: boolean;
  /** Let the bunny wander across its container between activities. */
  roam?: boolean;
  className?: string;
};

export default function LiveBunny({
  stage,
  state,
  accessories = [],
  size = 190,
  interactive = false,
  roam = false,
  className = '',
}: Props) {
  const { frame, rig, place, motion, motionMs, tapHandlers } = useBunnyAnimator(state, {
    interactive,
    roam,
  });
  const scaled = Math.round(size * STAGE_SCALE[stage]);

  const pose: Pose = frame?.pose ?? (rig ? (MOOD_POSE[rig] ?? 'normal') : 'normal');
  const flipped = (frame?.flip ? -1 : 1) * place.facing < 0;

  const body =
    stage === 'egg' ? (
      <Bunny stage="egg" size={scaled} className={className} />
    ) : (
      <span
        className={`bn bn-${motion} grid place-items-center`}
        style={{ ['--dur' as string]: `${motionMs}ms`, width: scaled, height: scaled }}
      >
        <BunnyRig
          pose={pose}
          talking={rig === 'talking'}
          accessories={accessories}
          size={scaled}
          className={`${flipped ? 'scale-x-[-1]' : ''} ${className}`}
        />
      </span>
    );

  const content = roam ? (
    <span
      className="roam"
      style={{ transform: `translateX(${place.x}%)`, ['--roam-ms' as string]: `${place.ms}ms` }}
    >
      {body}
    </span>
  ) : (
    body
  );

  if (!interactive) return content;

  return (
    <button
      type="button"
      {...tapHandlers}
      className="block cursor-pointer select-none bg-transparent"
      aria-label="うさぎにさわる"
    >
      {content}
    </button>
  );
}
