'use client';

import PixelBunny from '@/components/PixelBunny';
import { ACCESSORY_RIG } from '@/lib/sprites';
import type { Stage } from '@/lib/sprites';

type Props = { itemId: string; color: string; stage: Stage; size?: number };

// Wearing it is the only honest preview — a floating shape says nothing about
// how it will actually sit on your bunny.
export default function ItemPreview({ itemId, color, stage, size = 58 }: Props) {
  if (!ACCESSORY_RIG[itemId]) {
    return <span className="block size-7 rounded-lg" style={{ background: color }} />;
  }
  return <PixelBunny stage={stage} accessories={[{ id: itemId, color }]} size={size} />;
}
