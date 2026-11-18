'use client';

import { useEffect, useRef } from 'react';
import { createBgm, type Bgm } from './bgm';

// Browsers block audio until the page has been touched, so a BGM that was left
// on in settings waits for the next interaction instead of failing silently.
export function useBgm(enabled: boolean): void {
  const ref = useRef<Bgm | null>(null);

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
