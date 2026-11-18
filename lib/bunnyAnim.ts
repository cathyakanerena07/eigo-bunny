'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DOZING_AFTER_MS,
  IDLE_ACTIVITIES,
  IDLE_MAX_MS,
  IDLE_MIN_MS,
  REACTIONS,
  ROAM_ACTIVITIES,
  ROAM_CHANCE,
  ROAM_SPAN,
  SLEEPING_AFTER_MS,
  SLEEPY_AFTER_MS,
  STATES,
  TAP_POOL,
  TICK_MS,
  type BunnyState,
  type Frame,
  type Motion,
  type RigMood,
} from './bunnyStates';

export type { BunnyState, Frame, Motion, RigMood };
export { POSES, POSE_JA } from './bunnyStates';

type Program = {
  /** Higher wins. base 0, idle activity 1, sleep ladder 1, reaction 2. */
  priority: number;
  frames?: Frame[];
  rig?: RigMood;
  motion: Motion;
  motionMs: number;
  cycleKey: number;
  /** null = until something else replaces it */
  until: number | null;
  minUntil: number;
};

function reduced(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cycleLength(frames?: Frame[]): number {
  return frames?.reduce((n, f) => n + f.ms, 0) ?? 1000;
}

function programFor(state: BunnyState, now: number): Program {
  const def = STATES[state];
  return {
    priority: 0,
    frames: def.frames,
    rig: def.rig,
    motion: def.motion ?? 'breathe',
    motionMs: def.motionMs ?? cycleLength(def.frames),
    cycleKey: now,
    until: def.autoReturnMs ? now + def.autoReturnMs : null,
    minUntil: now + (def.minDisplayMs ?? 0),
  };
}

/** Where the bunny stands, as a share of its own width either side of centre. */
export type Place = { x: number; facing: 1 | -1; ms: number };

type Options = { interactive?: boolean; roam?: boolean };

export function useBunnyAnimator(base: BunnyState, options: Options = {}) {
  const interactive = options.interactive ?? false;
  const roaming = options.roam ?? false;

  const [frame, setFrame] = useState<Frame | null>(null);
  const [rig, setRig] = useState<RigMood | null>(STATES[base].rig ?? null);
  const [visual, setVisual] = useState<{ motion: Motion; motionMs: number; cycleKey: number }>({
    motion: 'breathe',
    motionMs: 3200,
    cycleKey: 0,
  });

  const program = useRef<Program>(programFor(base, 0));
  const frameIndex = useRef(0);
  const frameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteraction = useRef(0);
  const nextIdleAt = useRef(0);
  const lastActivity = useRef<string | null>(null);
  const baseRef = useRef(base);
  const [place, setPlace] = useState<Place>({ x: 0, facing: 1, ms: 0 });
  const placeX = useRef(0);

  const stopFrames = () => {
    if (frameTimer.current) clearTimeout(frameTimer.current);
    frameTimer.current = null;
  };

  // Cycle a frame list on its own clock, so each pose holds for its own time.
  const runFrames = useCallback((frames: Frame[]) => {
    stopFrames();
    frameIndex.current = 0;
    const step = () => {
      const f = frames[frameIndex.current % frames.length];
      setFrame(f);
      frameIndex.current += 1;
      frameTimer.current = setTimeout(step, f.ms);
    };
    step();
  }, []);

  const apply = useCallback(
    (next: Program) => {
      program.current = next;
      setVisual({ motion: next.motion, motionMs: next.motionMs, cycleKey: next.cycleKey });
      if (next.rig) {
        stopFrames();
        setRig(next.rig);
        setFrame(null);
      } else if (next.frames && next.frames.length) {
        setRig(null);
        if (reduced()) {
          setFrame(next.frames[0]);
          stopFrames();
        } else {
          runFrames(next.frames);
        }
      }
    },
    [runFrames],
  );

  const scheduleIdle = useCallback((now: number) => {
    nextIdleAt.current = now + IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS);
  }, []);

  // Base state changes always win: a conversation must never be interrupted.
  useEffect(() => {
    const now = Date.now();
    baseRef.current = base;
    lastInteraction.current = now;
    scheduleIdle(now);
    // The base state must take hold at once — a chat turn cannot wait a frame.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    apply(programFor(base, now));
  }, [base, apply, scheduleIdle]);

  useEffect(() => () => stopFrames(), []);

  // Clawd's idle tick: one cheap timer decides everything.
  useEffect(() => {
    if (!interactive) return;

    const id = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      const cur = program.current;

      if (cur.until !== null && now >= cur.until && now >= cur.minUntil) {
        apply(programFor(baseRef.current, now));
        scheduleIdle(now);
        return;
      }
      if (cur.priority >= 2 || baseRef.current !== 'idle') return;

      const sinceTouch = now - lastInteraction.current;

      // Falling asleep, staged.
      const wanted: BunnyState | null =
        sinceTouch >= SLEEPING_AFTER_MS
          ? 'sleeping'
          : sinceTouch >= DOZING_AFTER_MS
            ? 'dozing'
            : sinceTouch >= SLEEPY_AFTER_MS
              ? 'sleepy'
              : null;

      if (wanted) {
        if (roaming && placeX.current !== 0) {
          const facing: 1 | -1 = placeX.current > 0 ? -1 : 1;
          placeX.current = 0;
          setPlace({ x: 0, facing, ms: 2400 });
        }
        const want = programFor(wanted, now);
        if (cur.rig !== want.rig || cur.frames !== want.frames) {
          apply({ ...want, priority: 1, until: null, cycleKey: now });
        }
        return;
      }

      if (now < nextIdleAt.current || reduced()) return;

      const trip = roaming && Math.random() < ROAM_CHANCE;
      const pool = trip ? ROAM_ACTIVITIES : IDLE_ACTIVITIES;
      let pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick.id === lastActivity.current) {
        pick = pool[(pool.indexOf(pick) + 1) % pool.length];
      }
      lastActivity.current = pick.id;

      if (trip) {
        // Left / middle / right, never the zone it is already in: a destination
        // too close to the current spot reads as a twitch, not a walk.
        const edge = ROAM_SPAN * 0.33;
        const zone = placeX.current < -edge ? -1 : placeX.current > edge ? 1 : 0;
        const options = [-1, 0, 1].filter((z) => z !== zone);
        const target = options[Math.floor(Math.random() * options.length)];
        const to = Math.round(
          target === 0
            ? (Math.random() * 2 - 1) * ROAM_SPAN * 0.18
            : target * ROAM_SPAN * (0.62 + Math.random() * 0.38),
        );
        const facing: 1 | -1 = to < placeX.current ? -1 : 1;
        placeX.current = to;
        setPlace({ x: to, facing, ms: pick.ms });
      }
      apply({
        priority: 1,
        frames: pick.frames,
        motion: pick.motion,
        motionMs: pick.motionMs ?? cycleLength(pick.frames),
        cycleKey: now,
        until: now + pick.ms,
        minUntil: now + pick.ms,
      });
      scheduleIdle(now + pick.ms);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [interactive, roaming, apply, scheduleIdle]);

  const wake = useCallback(
    (kind: 'tap' | 'spam' | 'hold') => {
      const now = Date.now();
      const sleeping = ['sleepy', 'dozing', 'sleeping'].includes(
        program.current.frames === STATES.sleeping.frames ? 'sleeping' : '',
      );
      lastInteraction.current = now;
      const r = kind === 'tap' ? TAP_POOL[Math.floor(Math.random() * TAP_POOL.length)] : REACTIONS[kind];
      apply({
        priority: 2,
        frames: r.frames,
        motion: r.motion,
        motionMs: r.motionMs ?? cycleLength(r.frames),
        cycleKey: now,
        until: now + r.ms,
        minUntil: now + r.ms,
      });
      scheduleIdle(now + r.ms);
      return sleeping;
    },
    [apply, scheduleIdle],
  );

  const tapCount = useRef(0);
  const tapReset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);

  const onPointerDown = useCallback(() => {
    held.current = false;
    holdTimer.current = setTimeout(() => {
      held.current = true;
      wake('hold');
    }, 550);
  }, [wake]);

  const onPointerUp = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (held.current) return;
    tapCount.current += 1;
    if (tapReset.current) clearTimeout(tapReset.current);
    tapReset.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1400);
    wake(tapCount.current >= 3 ? 'spam' : 'tap');
  }, [wake]);

  useEffect(
    () => () => {
      if (tapReset.current) clearTimeout(tapReset.current);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  return {
    frame,
    rig,
    place,
    ...visual,
    tapHandlers: { onPointerDown, onPointerUp, onPointerCancel: onPointerUp },
  };
}
