'use client';

import Link from 'next/link';
import PixelBunny from '@/components/PixelBunny';
import PixelIcon from '@/components/PixelIcon';
import StatPill from '@/components/StatPill';
import { levelFromXp } from '@/lib/level';
import { currentStage, wornAccessories } from '@/lib/storage';
import { STAGE_JA, STAGE_MIN_LEVEL, STAGE_ORDER } from '@/lib/sprites';
import { useAppState } from '@/lib/useAppState';

function fmtMinutes(sec: number): string {
  const m = Math.round(sec / 60);
  return m < 60 ? `${m}分` : `${Math.floor(m / 60)}時間${m % 60}分`;
}

export default function GrowthPage() {
  const { state } = useAppState();

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const lv = levelFromXp(state.pet.xp);
  const stage = currentStage(state);
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const totalSec = state.sessions.reduce((n, s) => n + s.durationSec, 0);
  const accessories = wornAccessories(state.pet);

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">成長記録</h1>

      <section className="mt-5 rounded-3xl border border-line bg-card p-5">
        <div className="flex items-center gap-4">
          <PixelBunny stage={stage} accessories={accessories} size={88} />
          <div className="min-w-0 flex-1">
            <p className="pixel text-base">{state.pet.name}</p>
            <p className="pixel text-xs text-ink-soft">
              Lv. {lv.level} · {STAGE_JA[stage]}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-pink-deep" style={{ width: `${lv.ratio * 100}%` }} />
            </div>
            <p className="pixel mt-1 text-[10px] tabular-nums text-ink-soft">
              {lv.into} / {lv.need} XP
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-1">
          {STAGE_ORDER.map((s) => {
            const reached = STAGE_ORDER.indexOf(s) <= stageIndex;
            const now = s === stage;
            return (
              <div key={s} className="flex-1 text-center">
                <div
                  className={`mx-auto grid h-14 place-items-center rounded-2xl ${now ? 'bg-cream/80 ring-2 ring-pink-deep' : reached ? 'bg-lavender/40' : 'bg-line/60'}`}
                >
                  {reached ? (
                    <PixelBunny stage={s} size={42} />
                  ) : (
                    <span className="opacity-25">
                      <PixelBunny stage={s} size={38} className="grayscale" />
                    </span>
                  )}
                </div>
                <p className={`pixel mt-1 text-[9px] ${reached ? 'text-ink-soft' : 'text-ink-soft/60'}`}>
                  {STAGE_JA[s]}
                </p>
                <p className="pixel text-[8px] text-ink-soft opacity-70">
                  {STAGE_MIN_LEVEL[s] > 0 ? `Lv.${STAGE_MIN_LEVEL[s]}` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <StatPill label="はなした日" value={`${state.days.length}日`} tone="pink" />
        <StatPill label="あわせて" value={fmtMinutes(totalSec)} tone="sky" />
        <StatPill label="おぼえた単語" value={`${state.words.length}`} tone="lavender" />
        <StatPill label="フレーズ" value={`${state.phrases.length}`} tone="pink" />
      </section>

      <Link
        href="/words"
        className="mt-4 flex items-center gap-3 rounded-3xl border border-line bg-card p-4 transition active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky/60">
          <PixelIcon name="book" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="pixel block text-sm">おぼえた単語一覧</span>
          <span className="block text-xs text-ink-soft">
            単語 {state.words.length} ・ フレーズ {state.phrases.length}
          </span>
        </span>
        <span className="pixel shrink-0 text-ink-soft">›</span>
      </Link>

      <section className="mt-4">
        <p className="pixel text-sm">かいわ履歴</p>
        {state.sessions.length === 0 ? (
          <p className="mt-3 rounded-3xl border border-line bg-card p-5 text-center text-xs text-ink-soft">
            まだ会話していないよ。
            <Link href="/lesson" className="ml-1 text-pink-deep underline">
              レッスンへ
            </Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {state.sessions.map((s) => (
              <li key={s.id} className="rounded-3xl border border-line bg-card p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm">{s.topicTitle}</span>
                  <span className="pixel shrink-0 text-[11px] text-pink-deep">+{s.xpGained}XP</span>
                </div>
                <p className="pixel mt-1 text-[10px] text-ink-soft">
                  {new Date(s.at).toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
                  {fmtMinutes(s.durationSec)} · {s.turns.filter((t) => t.role === 'user').length}回はなした
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="h-8" />
    </main>
  );
}
