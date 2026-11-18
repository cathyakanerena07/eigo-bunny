'use client';

import { useEffect, useRef } from 'react';
import { createBgm, type Bgm } from './bgm';

export function useBgm(enabled: boolean): void {
  const ref = useRef<Bgm | null>(null);

  // Any tap on the page counts as the gesture iOS wants, and capture runs
  // before React's own handlers, so the toggle's first tap already unlocks it.
  useEffect(() => {
    if (!ref.current) ref.current = createBgm();
    const bgm = ref.current;
    if (!bgm) return;
    const unlock = () => bgm.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true });
    return () => window.removeEventListener('pointerdown', unlock, { capture: true });
  }, []);

  useEffect(() => {
    if (!ref.current) ref.current = createBgm();
    const bgm = ref.current;
    if (!bgm) return;

    if (!enabled) {
      bgm.stop();
      return;
    }

    let cancelled = false;
    const arm = () => {
      if (!cancelled) void bgm.start();
    };
    arm();
    window.addEventListener('pointerdown', arm, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', arm);
      bgm.stop();
    };
  }, [enabled]);

  useEffect(() => () => ref.current?.stop(), []);
}
