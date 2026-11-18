'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VOICE_PRESETS, englishVoices, speak, ttsSupported } from '@/lib/speech';
import { renamePet, resetAll, setSettings } from '@/lib/storage';
import { useAppState } from '@/lib/useAppState';
import type { EnglishLevel } from '@/lib/types';

const LEVELS: { id: EnglishLevel; ja: string; note: string }[] = [
  { id: 'beginner', ja: 'やさしい', note: '短くてかんたんな英語で話してくれる' },
  { id: 'intermediate', ja: 'ふつう', note: '日常の自然な英語' },
  { id: 'advanced', ja: 'むずかしい', note: 'ネイティブそのままの速さと言い回し' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { state, refresh } = useAppState();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!ttsSupported()) return;
    const load = () => setVoices(englishVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const s = state.settings;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">設定</h1>

      <section className="mt-5 rounded-3xl border border-line bg-card p-4">
        <label className="block">
          <span className="pixel text-xs text-ink-soft">うさぎの名前</span>
          <input
            type="text"
            defaultValue={state.pet.name}
            maxLength={12}
            onBlur={(e) => {
              renamePet(e.target.value);
              refresh();
            }}
            className="mt-1.5 w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-deep"
          />
        </label>
      </section>

      <section className="mt-4">
        <h2 className="pixel text-sm">英語レベル</h2>
        <ul className="mt-2 space-y-2">
          {LEVELS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => {
                  setSettings({ englishLevel: l.id });
                  refresh();
                }}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  s.englishLevel === l.id ? 'border-pink-deep bg-pink/40' : 'border-line bg-card'
                }`}
              >
                <span className="pixel text-sm">{l.ja}</span>
                <span className="mt-0.5 block text-xs text-ink-soft">{l.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 space-y-2">
        {[
          { key: 'showJa' as const, label: '日本語訳をだす', on: s.showJa },
          { key: 'autoSpeak' as const, label: 'うさぎの声をながす', on: s.autoSpeak },
        ].map((row) => (
          <button
            key={row.key}
            type="button"
            onClick={() => {
              setSettings({ [row.key]: !row.on });
              refresh();
            }}
            className="flex w-full items-center justify-between rounded-3xl border border-line bg-card px-4 py-3.5"
          >
            <span className="text-sm">{row.label}</span>
            <span
              className={`pixel rounded-full px-2.5 py-1 text-[10px] ${row.on ? 'bg-pink-deep text-white' : 'bg-line text-ink-soft'}`}
            >
              {row.on ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}
      </section>

      <section className="mt-4 rounded-3xl border border-line bg-card p-4">
        <h2 className="pixel text-sm">こえ</h2>
        {ttsSupported() ? (
          <>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {VOICE_PRESETS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSettings({ voicePreset: v.id, voiceName: null });
                    refresh();
                    speak('Hi! I am so happy to see you.', { preset: v.id });
                  }}
                  className={`rounded-2xl border px-1 py-3 text-center transition ${
                    s.voicePreset === v.id ? 'border-pink-deep bg-pink/40' : 'border-line bg-white'
                  }`}
                >
                  <span className="pixel block text-[11px] leading-tight">{v.ja}</span>
                  <span className="mt-1 block text-[10px] leading-tight text-ink-soft">{v.note}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
              タップすると試し聞きできる。声の高さの効きかたは端末によって差があるよ
            </p>

            <details className="mt-3">
              <summary className="pixel cursor-pointer text-[11px] text-ink-soft">
                端末の声を直接えらぶ
              </summary>
              <select
                value={s.voiceName ?? ''}
                onChange={(e) => {
                  setSettings({ voiceName: e.target.value || null });
                  refresh();
                }}
                className="mt-2 w-full rounded-2xl border border-line bg-white px-3 py-2.5 text-sm outline-none"
              >
                <option value="">おまかせ（上の選択にあわせる）</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => speak('Hi! Let us have a chat today.', { preset: s.voicePreset, voiceName: s.voiceName })}
                className="pixel mt-2 w-full rounded-full bg-sky py-2.5 text-xs"
              >
                ▶ ためしにきく
              </button>
            </details>
          </>
        ) : (
          <p className="mt-2 text-xs text-ink-soft">このブラウザは音声読み上げに対応していません</p>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-pink-deep/30 bg-pink/20 p-4">
        <h2 className="pixel text-sm text-pink-deep">さいしょから</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">
          レベル・ジェム・会話記録がぜんぶ消えて、たまごに戻る。元には戻せない
        </p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('ぜんぶ消して最初から？元に戻せないよ')) return;
            resetAll();
            refresh();
            router.push('/');
          }}
          className="pixel mt-3 w-full rounded-full border border-pink-deep/50 py-2.5 text-xs text-pink-deep"
        >
          データを消す
        </button>
      </section>
      <p className="pixel mt-6 text-center text-[10px] text-ink-soft/70">
        build {process.env.NEXT_PUBLIC_BUILD}
      </p>
      <div className="h-8" />
    </main>
  );
}
