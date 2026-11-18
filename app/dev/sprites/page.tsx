'use client';

import { POSES, POSE_JA } from '@/lib/bunnyStates';

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
      <div className="h-10" />
    </main>
  );
}
