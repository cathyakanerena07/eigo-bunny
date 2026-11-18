'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Bunny from '@/components/Bunny';
import LiveBunny from '@/components/LiveBunny';
import Room, { type RoomVariant } from '@/components/Room';
import { TOPICS, topicOfTheDay } from '@/lib/content/topics';
import { itemById } from '@/lib/content/shop';
import { levelFromXp } from '@/lib/level';
import { currentStage, dayKey, moodNow } from '@/lib/storage';
import { STAGE_JA, STAGE_MIN_LEVEL, STAGE_ORDER } from '@/lib/sprites';
import { useAppState } from '@/lib/useAppState';

const GREETINGS = [
  { en: "Hello!\nLet's have a chat!", mood: 60 },
  { en: 'Hi there!\nI missed you.', mood: 35 },
  { en: "I'm a bit sleepy...\nTalk to me?", mood: 0 },
];

function moodFace(mood: number): string {
  if (mood >= 70) return '😊';
  if (mood >= 40) return '🙂';
  return '😴';
}

export default function HomePage() {
  const { state } = useAppState();
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(dayKey(Date.now()));
  }, []);

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const { pet, sessions } = state;
  const lv = levelFromXp(pet.xp);
  const stage = currentStage(state);
  const mood = moodNow(pet);
  const room = (pet.equipped.room ?? 'room-day') as RoomVariant;

  const accessories = [pet.equipped.hat, pet.equipped.ribbon, pet.equipped.glasses]
    .map((id) => itemById(id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => ({ id: i.id, color: i.color }));

  const greeting = GREETINGS.find((g) => mood >= g.mood) ?? GREETINGS[GREETINGS.length - 1];
  const seed = today ? Number(today.replaceAll('-', '')) % TOPICS.length : 0;
  const topic = topicOfTheDay(seed);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const nextStage = STAGE_ORDER[stageIndex + 1];
  const toNext = nextStage ? Math.max(0, STAGE_MIN_LEVEL[nextStage] - lv.level) : 0;

  return (
    <main className="mx-auto w-full max-w-md">
      <section className="relative overflow-hidden rounded-b-[28px]" style={{ height: 420 }}>
        <Room variant={room} className="absolute inset-0 size-full" />

        <div className="safe-top relative flex items-start justify-between px-4">
          <div className="flex items-center gap-2 rounded-2xl bg-card/90 p-2 pr-4 shadow-sm backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-pink/60">
              <Bunny stage={stage} size={32} accessories={accessories} />
            </span>
            <span>
              <span className="pixel block text-sm leading-tight">{pet.name}</span>
              <span className="pixel block text-[11px] leading-tight text-ink-soft">Lv. {lv.level}</span>
              <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-pink-deep" style={{ width: `${lv.ratio * 100}%` }} />
              </span>
            </span>
          </div>

          <Link
            href="/shop"
            className="flex items-center gap-1.5 rounded-2xl bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
          >
            <span className="text-sm">💎</span>
            <span className="pixel text-sm tabular-nums">{pet.gems}</span>
          </Link>
        </div>

        <div className="relative mx-auto mt-4 w-fit max-w-[80%] rounded-2xl border-2 border-dark bg-card px-4 py-2.5 shadow-sm">
          <p className="pixel whitespace-pre-line text-center text-sm leading-snug">{greeting.en}</p>
          <span className="absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-dark bg-card" />
        </div>

        <div className="absolute inset-x-0 bottom-[70px] flex justify-center">
          <LiveBunny
            stage={stage}
            state={mood >= 40 ? 'idle' : 'sleepy'}
            accessories={accessories}
            size={190}
            interactive
          />
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl bg-card/90 px-3 py-2 shadow-sm backdrop-blur">
          <span className="pixel text-[10px] text-ink-soft">ごきげん</span>
          <span className="text-sm">{moodFace(mood)}</span>
          <span className="block h-2 w-12 overflow-hidden rounded-full bg-line">
            <span className="block h-full rounded-full bg-cream" style={{ width: `${mood}%`, background: '#ffd84d' }} />
          </span>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_24px_-18px_rgba(37,36,61,0.6)]">
          <span className="pixel inline-flex items-center gap-1.5 rounded-full bg-pink px-3 py-1 text-[11px]">
            💬 今日のレッスン
          </span>
          <p className="pixel mt-3 text-center text-lg leading-snug">{topic.title}</p>
          <p className="mt-1 text-center text-xs text-ink-soft">{topic.ja}</p>
          <Link
            href={`/chat/${topic.id}`}
            className="pixel mt-4 flex items-center justify-center gap-2 rounded-full bg-pink-deep py-3.5 text-base text-white shadow-[0_8px_18px_-10px_rgba(244,154,200,1)] transition active:translate-y-0.5"
          >
            はじめる →
          </Link>
        </div>

        <div className="mt-4 rounded-3xl border border-line bg-card p-5">
          <p className="pixel text-sm">🌱 いまの成長</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="pixel shrink-0 text-base">Lv. {lv.level}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full bg-pink-deep" style={{ width: `${lv.ratio * 100}%` }} />
            </span>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {nextStage
              ? toNext > 0
                ? `あと ${toNext} レベルで ${STAGE_JA[nextStage]} に進化！`
                : `まもなく ${STAGE_JA[nextStage]} に進化！`
              : 'さいごの姿になったよ'}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            {STAGE_ORDER.slice(1).map((s, i) => {
              const reached = STAGE_ORDER.indexOf(s) <= stageIndex;
              const isNow = s === stage;
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  {i > 0 && <span className="text-ink-soft">›</span>}
                  <div
                    className={`flex-1 rounded-2xl px-1 py-2 text-center ${isNow ? 'bg-cream/70 ring-2 ring-pink-deep' : 'bg-lavender/40'}`}
                  >
                    {reached ? (
                      <Bunny stage={s} size={38} className="mx-auto" />
                    ) : (
                      <span className="pixel grid h-[38px] place-items-center text-lg text-ink-soft opacity-50">?</span>
                    )}
                    <span className="pixel mt-1 block text-[9px] text-ink-soft">
                      {reached ? STAGE_JA[s] : '???'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sessions.length === 0 && (
          <p className="pixel mt-4 text-center text-[11px] leading-relaxed text-ink-soft">
            はじめて話すと、たまごからかえるよ
          </p>
        )}
      </section>
    </main>
  );
}
