'use client';

import Bunny, { type Accessory } from '@/components/Bunny';
import BunnyRig from '@/components/BunnyRig';
import type { Pose } from '@/lib/bunnyStates';
import type { Stage } from '@/lib/sprites';

type Props = {
  stage: Stage;
  pose?: Pose;
  talking?: boolean;
  accessories?: Accessory[];
  size?: number;
  className?: string;
};

// One bunny for the whole app: the same face everywhere, only the ears grow.
export default function PixelBunny({
  stage,
  pose = 'normal',
  talking = false,
  accessories = [],
  size = 120,
  className = '',
}: Props) {
  if (stage === 'egg') return <Bunny stage="egg" size={size} className={className} />;
  return (
    <BunnyRig
      stage={stage}
      pose={pose}
      talking={talking}
      accessories={accessories}
      size={size}
      tight
      className={className}
    />
  );
}
