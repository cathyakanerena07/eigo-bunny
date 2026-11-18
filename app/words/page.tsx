'use client';

import { useState } from 'react';
import Link from 'next/link';
import PixelIcon from '@/components/PixelIcon';
import { useAppState } from '@/lib/useAppState';

export default function WordsPage() {
  const { state } = useAppState();
  const [q, setQ] = useState('');

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const needle = q.trim().toLowerCase();
  const match = (s: string) => !needle || s.toLowerCase().includes(needle);
  const words = state.words.filter(match);
  const phrases = state.phrases.filter(match);
  const empty = state.words.length === 0 && state.phrases.length === 0;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <Link href="/growth" className="pixel text-xs text-ink-soft">
        ‹ 成長記録
      </Link>
      <h1 className="pixel mt-2 text-xl">おぼえた単語</h1>
      <p className="mt-1 text-xs text-ink-soft">うさぎとの会話で出てきた言葉がたまっていくよ</p>

      {empty ? (
        <p className="mt-6 rounded-3xl border border-line bg-card p-6 text-center text-xs leading-relaxed text-ink-soft">
          まだ空っぽ。
          <Link href="/lesson" className="ml-1 text-pink-deep underline">
            レッスン
          </Link>
          で話すとたまっていくよ
        </p>
      ) : (
        <>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="さがす"
            className="mt-4 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-pink-deep"
          />

          <section className="mt-5">
            <div className="flex items-baseline justify-between">
              <h2 className="pixel text-sm">単語</h2>
              <span className="pixel text-[11px] tabular-nums text-ink-soft">{words.length}</span>
            </div>
            {words.length === 0 ? (
              <p className="mt-2 text-xs text-ink-soft">見つからなかった</p>
            ) : (
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {words.map((w) => (
                  <li key={w} className="rounded-2xl border border-line bg-card px-3 py-2.5 text-sm">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <div className="flex items-baseline justify-between">
              <h2 className="pixel text-sm">フレーズ</h2>
              <span className="pixel text-[11px] tabular-nums text-ink-soft">{phrases.length}</span>
            </div>
            {phrases.length === 0 ? (
              <p className="mt-2 text-xs text-ink-soft">見つからなかった</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {phrases.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 rounded-2xl border border-line bg-card px-3 py-2.5 text-sm"
                  >
                    <PixelIcon name="bubble" size={16} className="mt-0.5 shrink-0 text-ink-soft" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      <div className="h-8" />
    </main>
  );
}
