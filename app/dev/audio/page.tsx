'use client';

import { useEffect, useState } from 'react';

type Entry = { at: string; what: string };

// Everything this app could possibly use to take the audio session, watched
// live. If the log stays empty while a video stops, the app is not the cause.
export default function AudioDoctor() {
  const [log, setLog] = useState<Entry[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const push = (what: string) =>
      setLog((l) => [{ at: new Date().toLocaleTimeString('ja-JP'), what }, ...l].slice(0, 40));

    const w = window as unknown as Record<string, unknown>;
    const RealCtx = w.AudioContext as typeof AudioContext | undefined;
    const RealWebkitCtx = w.webkitAudioContext as typeof AudioContext | undefined;
    const realPlay = HTMLMediaElement.prototype.play;
    const synth = window.speechSynthesis;
    const realSpeak = synth?.speak.bind(synth);
    const realCancel = synth?.cancel.bind(synth);

    if (RealCtx) {
      const Patched = function (...a: unknown[]) {
        push('AudioContext を作った');
        return new (RealCtx as unknown as new (...x: unknown[]) => AudioContext)(...a);
      };
      Patched.prototype = RealCtx.prototype;
      w.AudioContext = Patched;
      if (RealWebkitCtx) w.webkitAudioContext = Patched;
    }

    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      push(`音声ファイルを再生 (${(this.src || '').slice(0, 20)})`);
      return realPlay.call(this);
    };

    if (synth && realSpeak) {
      synth.speak = (u: SpeechSynthesisUtterance) => {
        push(`読み上げ: "${(u.text || '').trim().slice(0, 20) || '(無音)'}"`);
        realSpeak(u);
      };
      synth.cancel = () => {
        push('読み上げを止めた');
        realCancel?.();
      };
    }

    const t = setInterval(() => setNow((n) => n + 1), 1000);
    return () => {
      clearInterval(t);
      if (RealCtx) {
        w.AudioContext = RealCtx;
        if (RealWebkitCtx) w.webkitAudioContext = RealWebkitCtx;
      }
      HTMLMediaElement.prototype.play = realPlay;
      if (synth && realSpeak && realCancel) {
        synth.speak = realSpeak;
        synth.cancel = realCancel;
      }
    };
  }, []);

  const media = typeof document === 'undefined' ? [] : [...document.querySelectorAll('audio, video')];
  const speaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;

  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <h1 className="pixel text-xl">音のしんだん</h1>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        このページを開いたまま、止まってしまう操作をしてみてね。
        <br />
        アプリが音に触ったら下に出るよ（{now} 秒 みてる）
      </p>

      <section className="mt-4 rounded-3xl border border-line bg-card p-4">
        <p className="pixel text-sm">いまの状態</p>
        <ul className="mt-2 space-y-1 text-xs text-ink-soft">
          <li>読み上げ中: {speaking ? 'はい' : 'いいえ'}</li>
          <li>音声ファイルの数: {media.length}</li>
          <li>build {process.env.NEXT_PUBLIC_BUILD}</li>
        </ul>
      </section>

      <section className="mt-4">
        <p className="pixel text-sm">さわった記録</p>
        {log.length === 0 ? (
          <p className="mt-2 rounded-3xl border border-line bg-card p-5 text-center text-xs leading-relaxed text-ink-soft">
            まだ一度も音に触っていません。
            <br />
            この状態で動画が止まるなら、原因はこのアプリの外にあります
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {log.map((e, i) => (
              <li key={`${e.at}-${i}`} className="rounded-2xl border border-line bg-card px-3 py-2 text-xs">
                <span className="pixel text-ink-soft">{e.at}</span> {e.what}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="h-8" />
    </main>
  );
}
