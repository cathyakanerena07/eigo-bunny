'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PixelBunny from '@/components/PixelBunny';
import LiveBunny from '@/components/LiveBunny';
import SessionResult from '@/components/SessionResult';
import { itemById } from '@/lib/content/shop';
import { customTopic, topicById } from '@/lib/content/topics';
import { gemsForSession, levelFromXp, xpForSession } from '@/lib/level';
import { createRecognizer, speak, speechSupported, stopSpeaking, type Recognizer } from '@/lib/speech';
import { commitSession, currentStage, setSettings } from '@/lib/storage';
import { useAppState } from '@/lib/useAppState';
import type { Session, Turn } from '@/lib/types';

type Summary = { newWords: string[]; newPhrases: string[]; facts: string[]; praise: string };

export default function ChatScreen({ topicId, customText }: { topicId: string; customText?: string }) {
  const router = useRouter();
  const { state, refresh } = useAppState();
  const topic = topicId === 'custom' && customText ? customTopic(customText) : topicById(topicId);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [result, setResult] = useState<{ session: Session; summary: Summary; leveledTo: number | null } | null>(null);
  const [ending, setEnding] = useState(false);

  const startedAt = useRef(0);
  const openedRef = useRef(false);
  const recRef = useRef<Recognizer | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const turnsRef = useRef<Turn[]>([]);

  const ask = useCallback(
    async (history: Turn[]) => {
      if (!state || !topic) return;
      setThinking(true);
      setError(null);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            petName: state.pet.name,
            topicId: topic.id,
            customText,
            level: state.settings.englishLevel,
            memory: state.memory,
            turns: history,
          }),
        });
        const data = (await res.json()) as { en?: string; ja?: string; error?: string; mock?: boolean };
        if (data.mock) setMock(true);
        if (!res.ok || !data.en) {
          setError(data.error ?? 'うまく話せなかった');
          return;
        }
        const turn: Turn = { role: 'bunny', text: data.en, ja: data.ja, at: Date.now() };
        const next = [...turnsRef.current, turn];
        turnsRef.current = next;
        setTurns(next);
        if (state.settings.autoSpeak) {
          speak(data.en, { preset: state.settings.voicePreset, voiceName: state.settings.voiceName });
        }
      } catch {
        setError('通信に失敗した');
      } finally {
        setThinking(false);
      }
    },
    [state, topic, customText],
  );

  // The canned opener shows instantly; only a self-chosen theme has to wait on
  // the model, and that is the slowest moment in the whole app.
  useEffect(() => {
    if (!state || !topic || openedRef.current) return;
    openedRef.current = true;
    startedAt.current = Date.now();
    if (!topic.opener) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void ask([]);
      return;
    }
    const turn: Turn = { role: 'bunny', text: topic.opener, at: Date.now() };
    turnsRef.current = [turn];
    setTurns([turn]);
    if (state.settings.autoSpeak) {
      speak(topic.opener, { preset: state.settings.voicePreset, voiceName: state.settings.voiceName });
    }
  }, [state, topic, ask]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, thinking]);

  useEffect(() => () => recRef.current?.dispose(), []);

  // Leaving the tab kills the microphone anyway; end the session cleanly.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) recRef.current?.stop();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim();
      if (!clean || thinking) return;
      recRef.current?.stop();
      const next: Turn[] = [...turnsRef.current, { role: 'user', text: clean, at: Date.now() }];
      turnsRef.current = next;
      setTurns(next);
      setDraft('');
      setHintOpen(false);
      void ask(next);
    },
    [ask, thinking],
  );

  const toggleMic = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    // One recogniser for the whole screen: it restarts itself between phrases,
    // and a fresh object per tap is what used to leave the mic stuck.
    if (!recRef.current) {
      recRef.current = createRecognizer({
        onText: setDraft,
        onStop: (reason) => {
          setListening(false);
          if (reason === 'silence') setError('声が聞こえなかったみたい。もう一回マイクをタップしてね');
          if (reason === 'timeout') setError('長くなったので一度きったよ。続きはマイクをタップしてね');
        },
        onError: setError,
      });
    }
    if (!recRef.current) {
      setError('このブラウザは音声入力に対応してないみたい');
      return;
    }
    setError(null);
    stopSpeaking();
    setListening(true);
    recRef.current.start();
  }, [listening]);

  const finish = useCallback(async () => {
    if (!state || !topic || ending) return;
    setEnding(true);
    recRef.current?.dispose();
    window.speechSynthesis?.cancel();

    const userTurns = turnsRef.current.filter((t) => t.role === 'user');
    if (userTurns.length === 0) {
      router.replace('/');
      return;
    }

    let summary: Summary = { newWords: [], newPhrases: [], facts: [], praise: 'おつかれさま！' };
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ petName: state.pet.name, topicTitle: topic.title, turns: turnsRef.current }),
      });
      summary = { ...summary, ...((await res.json()) as Summary) };
    } catch {
      // keep the fallback summary
    }

    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const session: Session = {
      id: `s-${startedAt.current}`,
      at: startedAt.current,
      topicId: topic.id,
      topicTitle: topic.title,
      durationSec,
      turns: turnsRef.current,
      xpGained: xpForSession(userTurns.length, durationSec, summary.newWords.length),
      gemsGained: gemsForSession(userTurns.length),
      newWords: summary.newWords,
      newPhrases: summary.newPhrases,
    };

    const before = levelFromXp(state.pet.xp).level;
    const after = commitSession(session, summary.facts);
    const afterLevel = levelFromXp(after.pet.xp).level;
    refresh();
    setResult({ session, summary, leveledTo: afterLevel > before ? afterLevel : null });
  }, [state, topic, ending, router, refresh]);

  if (!topic) {
    return (
      <main className="grid min-h-dvh place-items-center gap-3 px-6 text-center">
        <p className="text-sm text-ink-soft">そのレッスンは見つからなかった</p>
        <Link href="/lesson" className="pixel text-pink-deep underline">
          レッスン一覧へ
        </Link>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-line border-t-pink-deep" />
      </main>
    );
  }

  const stage = currentStage(state);
  const accessories = [state.pet.equipped.hat, state.pet.equipped.ribbon, state.pet.equipped.glasses]
    .map((id) => itemById(id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => ({ id: i.id, color: i.color }));

  if (result) {
    return (
      <SessionResult
        petName={state.pet.name}
        stage={stage}
        accessories={accessories}
        session={result.session}
        praise={result.summary.praise}
        leveledTo={result.leveledTo}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#faf7ff]">
      <header className="safe-top sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-card/95 px-4 pb-3 backdrop-blur">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-pink/60">
          <LiveBunny
            stage={stage}
            state={thinking ? 'thinking' : listening ? 'listening' : 'idle'}
            accessories={accessories}
            size={40}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="pixel block truncate text-sm">{state.pet.name}</span>
          <span className="block truncate text-[11px] text-ink-soft">{topic.ja}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setSettings({ showJa: !state.settings.showJa });
            refresh();
          }}
          className={`pixel rounded-full px-2.5 py-1.5 text-[10px] ${state.settings.showJa ? 'bg-sky text-ink' : 'bg-line text-ink-soft'}`}
        >
          訳
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={ending}
          className="pixel rounded-full bg-pink-deep px-3 py-1.5 text-[11px] text-white disabled:opacity-60"
        >
          {ending ? '…' : 'おわる'}
        </button>
      </header>

      {mock && (
        <p className="bg-cream/70 px-4 py-2 text-center text-[11px] text-ink-soft">
          APIキー未設定のため、決まった返事を返しています（AI応答ではありません）
        </p>
      )}

      <div className="flex-1 space-y-3 px-4 py-4">
        {turns.map((t, i) =>
          t.role === 'bunny' ? (
            <div key={i} className="rise flex items-end gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-pink/50">
                <PixelBunny stage={stage} size={26} accessories={accessories} />
              </span>
              <div className="max-w-[78%] rounded-2xl rounded-bl-sm border-2 border-dark bg-card px-3.5 py-2.5">
                <p className="text-[15px] leading-relaxed">{t.text}</p>
                {state.settings.showJa && t.ja && <p className="mt-1 text-xs text-ink-soft">{t.ja}</p>}
                <button
                  type="button"
                  onClick={() => speak(t.text, { preset: state.settings.voicePreset, voiceName: state.settings.voiceName })}
                  className="pixel mt-1.5 text-[10px] text-pink-deep"
                >
                  🔊 もう一回きく
                </button>
              </div>
            </div>
          ) : (
            <div key={i} className="rise flex justify-end">
              <p className="max-w-[78%] rounded-2xl rounded-br-sm bg-lavender px-3.5 py-2.5 text-[15px] leading-relaxed">
                {t.text}
              </p>
            </div>
          ),
        )}

        {thinking && (
          <div className="flex items-end gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-pink/50">
              <PixelBunny stage={stage} size={26} talking accessories={accessories} />
            </span>
            <span className="rounded-2xl rounded-bl-sm border-2 border-dark bg-card px-4 py-3">
              <span className="pixel text-sm text-ink-soft">● ● ●</span>
            </span>
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-pink-deep/40 bg-pink/40 px-3 py-2 text-center text-xs">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {hintOpen && (
        <div className="mx-4 mb-2 rounded-2xl border border-line bg-cream/70 p-3">
          <p className="pixel text-[11px]">つかえそうな言葉</p>
          <p className="mt-1 text-sm">{topic.targetWords.join(' · ')}</p>
          <p className="pixel mt-2 text-[11px]">こう始めてみよう</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {['I think...', 'Actually,', 'Last week I', 'How about you?'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft((d) => `${d}${d ? ' ' : ''}${s} `)}
                className="rounded-full bg-card px-2.5 py-1 text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="safe-bottom sticky bottom-0 border-t border-line bg-card/95 px-3 pt-2 backdrop-blur">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setHintOpen((o) => !o)}
            className={`pixel grid size-11 shrink-0 place-items-center rounded-2xl text-[10px] ${hintOpen ? 'bg-cream' : 'bg-line'}`}
          >
            ヒント
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder={listening ? 'きいてるよ…' : 'English here...'}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-pink-deep"
          />
          {speechSupported() && (
            <button
              type="button"
              onClick={toggleMic}
              className={`grid size-11 shrink-0 place-items-center rounded-2xl text-lg ${listening ? 'bg-pink-deep text-white' : 'bg-sky'}`}
              aria-label="音声入力"
            >
              🎤
            </button>
          )}
          <button
            type="button"
            onClick={() => send(draft)}
            disabled={!draft.trim() || thinking}
            className="pixel grid size-11 shrink-0 place-items-center rounded-2xl bg-pink-deep text-white disabled:opacity-40"
            aria-label="送信"
          >
            ↑
          </button>
        </div>
        <p className="pixel pb-1 pt-1.5 text-center text-[9px] text-ink-soft">
          {listening ? 'もう一度タップで入力おわり' : '英語で書いても、マイクで話してもOK'}
        </p>
      </div>
    </main>
  );
}
