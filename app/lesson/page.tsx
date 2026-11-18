'use client';

import Link from 'next/link';
import { TOPICS } from '@/lib/content/topics';
import { useAppState } from '@/lib/useAppState';

export default function LessonPage() {
  const { state } = useAppState();
  const done = new Set((state?.sessions ?? []).map((s) => s.topicId));

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">レッスン</h1>
      <p className="mt-1 text-xs text-ink-soft">すきな話題をえらんで、うさぎと英語で話そう</p>

      <ul className="mt-5 space-y-3">
        {TOPICS.map((t) => (
          <li key={t.id}>
            <Link
              href={`/chat/${t.id}`}
              className="flex items-center gap-3 rounded-3xl border border-line bg-card p-4 transition active:scale-[0.99]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lavender/60 text-xl">
                {t.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{t.title}</span>
                <span className="block text-xs text-ink-soft">{t.ja}</span>
              </span>
              {done.has(t.id) && <span className="pixel shrink-0 text-[10px] text-pink-deep">はなした</span>}
            </Link>
          </li>
        ))}
      </ul>
      <div className="h-8" />
    </main>
  );
}
