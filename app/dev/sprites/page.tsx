'use client';

import Bunny from '@/components/Bunny';
import BunnyRig from '@/components/BunnyRig';
import { POSES, POSE_JA } from '@/lib/bunnyStates';
import { SHOP_ITEMS } from '@/lib/content/shop';
import { STAGE_JA, STAGE_ORDER } from '@/lib/sprites';

const WEARABLE = SHOP_ITEMS.filter((i) => i.slot !== 'room').map((i) => ({ id: i.id, color: i.color, name: i.name }));
const COMBOS = [[], ...WEARABLE.map((w) => [w]), WEARABLE.slice(0, 2), WEARABLE];

export default function SpritePreview() {
  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">スプライト一覧</h1>
      <p className="mt-1 text-xs text-ink-soft">
        切り出した {POSES.length} ポーズ。元のシートは /assets/bunny/_sheet.png に残してある
      </p>

      <ul className="mt-5 grid grid-cols-3 gap-3">
        {POSES.map((p) => (
          <li key={p} className="rounded-2xl border border-line bg-card p-2 text-center">
            <div className="grid h-24 place-items-center overflow-hidden rounded-xl bg-lavender/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/bunny/bunny-${p}.png`}
                alt={p}
                className="bn bn-breathe"
                style={{ width: 84, height: 'auto', imageRendering: 'pixelated' }}
              />
            </div>
            <p className="pixel mt-1 text-[10px]">{POSE_JA[p]}</p>
            <p className="pixel text-[9px] text-ink-soft">{p}</p>
          </li>
        ))}
      </ul>
      <h2 className="pixel mt-10 text-sm">きせかえ（リグ）</h2>
      <ul className="mt-2 grid grid-cols-3 gap-3">
        {COMBOS.map((c, i) => (
          <li key={i} className="rounded-2xl border border-line bg-card p-2 text-center">
            <div className="grid h-24 place-items-center rounded-xl bg-lavender/30">
              <BunnyRig pose="normal" accessories={c} size={84} />
            </div>
            <p className="pixel mt-1 text-[9px] text-ink-soft">{c.map((x) => x.name).join('+') || 'なし'}</p>
          </li>
        ))}
      </ul>

      <h2 className="pixel mt-8 text-sm">きせかえ（スプライト・成長別）</h2>
      {COMBOS.map((c, i) => (
        <div key={i} className="mt-3">
          <p className="pixel text-[9px] text-ink-soft">{c.map((x) => x.name).join('+') || 'なし'}</p>
          <ul className="mt-1 grid grid-cols-5 gap-2">
            {STAGE_ORDER.map((st) => (
              <li key={st} className="rounded-2xl border border-line bg-card p-1 text-center">
                <Bunny stage={st} accessories={c} size={56} className="mx-auto" />
                <p className="pixel text-[8px] text-ink-soft">{STAGE_JA[st]}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="h-10" />
    </main>
  );
}
