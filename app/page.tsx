'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PixelBunny from '@/components/PixelBunny';
import PixelIcon, { type IconName } from '@/components/PixelIcon';
import LiveBunny from '@/components/LiveBunny';
import Room, { type RoomVariant } from '@/components/Room';
import { TOPICS, nextTopic } from '@/lib/content/topics';
import { levelFromXp } from '@/lib/level';
import { speakWhenAllowed } from '@/lib/speech';
import { currentStage, dayKey, moodNow, setSettings, wornAccessories } from '@/lib/storage';
import { STAGE_JA, STAGE_MIN_LEVEL, STAGE_ORDER } from '@/lib/sprites';
import { useAppState } from '@/lib/useAppState';

const GREETINGS = [
  { en: "Hello!\nLet's have a chat!", mood: 60 },
  { en: 'Hi there!\nI missed you.', mood: 35 },
  { en: "I'm a bit sleepy...\nTalk to me?", mood: 0 },
];

function moodFace(mood: number): IconName {
  if (mood >= 70) return 'face-happy';
  if (mood >= 40) return 'face-ok';
  return 'face-sleep';
}

export default function HomePage() {
  const { state, refresh } = useAppState();
  const [today, setToday] = useState<string | null>(null);
  const greeted = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(dayKey(Date.now()));
  }, []);

  const hello = state ? (GREETINGS.find((g) => moodNow(state.pet) >= g.mood) ?? GREETINGS[2]).en : '';
  const voice = state?.settings;

  const sayHello = useCallback(() => {
    if (!hello || !voice) return;
    speakWhenAllowed(hello.replace('\n', ' '), {
      preset: voice.voicePreset,
      voiceName: voice.voiceName,
    });
  }, [hello, voice]);

  useEffect(() => {
    if (!hello || !voice?.autoSpeak || greeted.current) return;
    greeted.current = true;
    return speakWhenAllowed(hello.replace('\n', ' '), {
      preset: voice.voicePreset,
      voiceName: voice.voiceName,
    });
  }, [hello, voice]);

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

  const accessories = wornAccessories(pet);

  const greeting = GREETINGS.find((g) => mood >= g.mood) ?? GREETINGS[GREETINGS.length - 1];
  const seed = today ? Number(today.replaceAll('-', '')) % TOPICS.length : 0;
  const done = new Set(sessions.map((s) => s.topicId));
  const topic = nextTopic(done, seed);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const nextStage = STAGE_ORDER[stageIndex + 1];
  const toNext = nextStage ? Math.max(0, STAGE_MIN_LEVEL[nextStage] - lv.level) : 0;

  return (
    <main className="mx-auto w-full max-w-md">
      <section className="relative overflow-hidden rounded-b-[28px]" style={{ height: 420 }}>
        <Room variant={room} className="absolute inset-0 size-full" />

        <div className="relative flex items-start justify-between px-4 pt-3">
          <div className="flex items-center gap-2 rounded-2xl bg-card/90 p-2 pr-4 shadow-sm backdrop-blur">
            <span className="grid size-10 place-items-center rounded-xl bg-pink/60">
              <PixelBunny stage={stage} size={34} accessories={accessories} />
            </span>
            <span>
              <span className="pixel block text-sm leading-tight">{pet.name}</span>
              <span className="pixel block text-[11px] leading-tight text-ink-soft">Lv. {lv.level}</span>
              <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-pink-deep" style={{ width: `${lv.ratio * 100}%` }} />
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const on = !state.settings.bgm;
                setSettings({ bgm: on });
                refresh();
                // Turning the sound on is a tap, which is the one moment iOS
                // will let the bunny speak — so let her say hello right then.
                if (on) sayHello();
              }}
              className={`grid size-10 place-items-center rounded-2xl shadow-sm backdrop-blur ${state.settings.bgm ? 'bg-cream' : 'bg-card/90'}`}
              aria-label={state.settings.bgm ? 'BGMをとめる' : 'BGMをながす'}
            >
              <PixelIcon name={state.settings.bgm ? 'note' : 'mute'} size={20} />
            </button>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 rounded-2xl bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
            >
              <PixelIcon name="gem" size={16} className="text-sky-deep" />
              <span className="pixel text-sm tabular-nums">{pet.gems}</span>
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={sayHello}
          className="relative mx-auto mt-4 block w-fit max-w-[80%] rounded-2xl border-2 border-dark bg-card px-4 py-2.5 shadow-sm active:translate-y-px"
          aria-label="もういちど聞く"
        >
          <p className="pixel whitespace-pre-line text-center text-sm leading-snug">{greeting.en}</p>
          <span className="absolute -bottom-2 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-dark bg-card" />
        </button>

        <div className="absolute inset-x-0 bottom-[70px] flex justify-center">
          <LiveBunny
            stage={stage}
            state={mood >= 40 ? 'idle' : 'sleepy'}
            accessories={accessories}
            size={190}
            interactive
            roam
          />
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl bg-card/90 px-3 py-2 shadow-sm backdrop-blur">
          <span className="pixel text-[10px] text-ink-soft">ごきげん</span>
          <PixelIcon name={moodFace(mood)} size={16} />
          <span className="block h-2 w-12 overflow-hidden rounded-full bg-line">
            <span className="block h-full rounded-full bg-cream" style={{ width: `${mood}%`, background: '#ffd84d' }} />
          </span>
        </div>
      </section>

      <section className="px-4 pt-5">
        <div className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_24px_-18px_rgba(37,36,61,0.6)]">
          <div className="flex items-center justify-between gap-2">
            <span className="pixel inline-flex items-center gap-1.5 rounded-full bg-pink px-3 py-1 text-[11px]">
              レッスン {topic.step}
            </span>
            <Link href="/lesson" className="pixel text-[11px] text-ink-soft underline">
              ほかのレッスン
            </Link>
          </div>
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
          <p className="pixel flex items-center gap-1.5 text-sm">
            <PixelIcon name="sprout" size={16} className="text-ink-soft" />
            いまの成長
          </p>
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
                      <PixelBunny stage={s} size={38} className="mx-auto" />
                    ) : (
                      <span className="grid h-[38px] place-items-center opacity-25">
                        <PixelBunny stage={s} size={34} className="grayscale" />
                      </span>
                    )}
                    <span className={`pixel mt-1 block text-[9px] ${reached ? 'text-ink-soft' : 'text-ink-soft/60'}`}>
                      {STAGE_JA[s]}
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
        <div className="h-8" />
      </section>
    </main>
  );
}
