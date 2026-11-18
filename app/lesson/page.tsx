'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { CHAPTERS, nextTopic, topicsOfChapter } from '@/lib/content/topics';
import { unlockSpeech } from '@/lib/speech';
import { useAppState } from '@/lib/useAppState';

export default function LessonPage() {
  const router = useRouter();
  const { state } = useAppState();
  const [theme, setTheme] = useState('');

  const done = new Set((state?.sessions ?? []).map((s) => s.topicId));
  const next = nextTopic(done);
  const typed = theme.trim();

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">レッスン</h1>
      <p className="mt-1 text-xs text-ink-soft">じゅんばんに すすむと、だんだん話せるようになるよ</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (typed) {
            if (state?.settings.autoSpeak) unlockSpeech();
            router.push(`/chat/custom?t=${encodeURIComponent(typed)}`);
          }
        }}
        className="mt-5 rounded-3xl border border-line bg-card p-4"
      >
        <div className="flex items-center gap-2">
          <PixelIcon name="spark" size={16} className="shrink-0 text-lavender-deep" />
          <span className="pixel text-xs">じぶんで テーマをきめる</span>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="話したいことを書いてね（例：旅行の計画）"
            className="min-w-0 flex-1 rounded-2xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-lavender-deep"
          />
          <button
            type="submit"
            disabled={!typed}
            className="shrink-0 rounded-2xl bg-lavender-deep px-4 py-2 text-sm font-medium text-white transition active:scale-[0.97] disabled:opacity-40"
          >
            はなす
          </button>
        </div>
        <p className="mt-2 text-[11px] text-ink-soft">書いたことから、うさぎがレッスンを作ってくれるよ</p>
      </form>

      {CHAPTERS.map((c, i) => {
        const topics = topicsOfChapter(c.id);
        const cleared = topics.filter((t) => done.has(t.id)).length;

        return (
          <section key={c.id} className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="pixel text-[10px] text-lavender-deep">CHAPTER {i + 1}</p>
                <h2 className="pixel truncate text-sm">{c.ja}</h2>
              </div>
              <span className="pixel shrink-0 text-[10px] text-ink-soft">
                {cleared} / {topics.length} おわった
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">{c.note}</p>

            <ul className="mt-3 space-y-3">
              {topics.map((t) => {
                const isNext = t.id === next.id;

                return (
                  <li key={t.id}>
                    <Link
                      href={`/chat/${t.id}`}
                      onPointerDown={state?.settings.autoSpeak ? unlockSpeech : undefined}
                      className={`flex items-center gap-3 rounded-3xl border bg-card p-4 transition active:scale-[0.99] ${
                        isNext ? 'border-lavender-deep ring-2 ring-lavender-deep/40' : 'border-line'
                      }`}
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lavender/60 text-dark">
                        <PixelIcon name={t.icon} size={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        {isNext && (
                          <span className="pixel block text-[9px] text-lavender-deep">つぎはこれ</span>
                        )}
                        <span className="flex min-w-0 items-baseline gap-1.5">
                          <span className="pixel shrink-0 text-[10px] text-ink-soft">{t.step}</span>
                          <span className="truncate text-sm font-medium">{t.title}</span>
                        </span>
                        <span className="block text-xs text-ink-soft">{t.ja}</span>
                      </span>
                      {done.has(t.id) && (
                        <span className="pixel shrink-0 text-[10px] text-pink-deep">はなした</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="h-8" />
    </main>
  );
}
