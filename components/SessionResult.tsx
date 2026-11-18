'use client';

import Link from 'next/link';
import type { Accessory } from '@/components/Bunny';
import PixelBunny from '@/components/PixelBunny';
import PixelIcon from '@/components/PixelIcon';
import type { Stage } from '@/lib/sprites';
import type { Session } from '@/lib/types';

export default function SessionResult({
  petName,
  stage,
  accessories,
  session,
  praise,
  leveledTo,
}: {
  petName: string;
  stage: Stage;
  accessories: Accessory[];
  session: Session;
  praise: string;
  leveledTo: number | null;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-5 pt-10">
      {leveledTo && (
        <div className="pop mb-2 rounded-full bg-cream px-5 py-2 shadow-sm">
          <p className="pixel flex items-center justify-center gap-1.5 text-base">
            <PixelIcon name="star" size={16} />
            レベルアップ！ Lv. {leveledTo}
          </p>
        </div>
      )}

      <div className="relative">
        {leveledTo && (
          <span className="shine absolute inset-0 -z-10 grid place-items-center">
            <span className="block size-52 rounded-full bg-cream/70 blur-xl" />
          </span>
        )}
        <PixelBunny
          stage={stage}
          pose={leveledTo ? 'levelup' : 'glad'}
          accessories={accessories}
          size={190}
        />
      </div>

      <p className="pixel mt-2 text-lg">おつかれさま！</p>
      <p className="mt-1 text-center text-sm leading-relaxed text-ink-soft">{praise}</p>

      <div className="mt-5 grid w-full grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line bg-card p-4 text-center">
          <p className="pixel text-2xl tabular-nums text-pink-deep">+{session.xpGained}</p>
          <p className="pixel mt-0.5 text-[11px] text-ink-soft">けいけんち</p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-4 text-center">
          <p className="pixel text-2xl tabular-nums text-sky-deep">+{session.gemsGained}</p>
          <p className="pixel mt-0.5 text-[11px] text-ink-soft">ジェム</p>
        </div>
      </div>

      {session.newWords.length > 0 && (
        <div className="mt-4 w-full rounded-3xl border border-line bg-card p-4">
          <p className="pixel text-[11px] text-ink-soft">おぼえた単語</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.newWords.map((w) => (
              <span key={w} className="rounded-full bg-sky px-2.5 py-1 text-xs">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {session.newPhrases.length > 0 && (
        <div className="mt-3 w-full rounded-3xl border border-line bg-card p-4">
          <p className="pixel text-[11px] text-ink-soft">つかえるフレーズ</p>
          <ul className="mt-2 space-y-1.5">
            {session.newPhrases.map((p) => (
              <li key={p} className="rounded-2xl bg-lavender/50 px-3 py-2 text-sm">
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex w-full gap-3 pb-10">
        <Link
          href="/lesson"
          className="pixel flex-1 rounded-full border border-line bg-card py-3.5 text-center text-sm"
        >
          ほかのレッスン
        </Link>
        <Link
          href="/"
          className="pixel flex-1 rounded-full bg-pink-deep py-3.5 text-center text-sm text-white"
        >
          ホームへ
        </Link>
      </div>

      <p className="pixel pb-6 text-[10px] text-ink-soft">{petName}とのきろくは「成長記録」に残るよ</p>
    </main>
  );
}
