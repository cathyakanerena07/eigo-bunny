'use client';

import { useEffect } from 'react';
import { getBgm } from './bgm';
import { unlockSpeech } from './speech';

export function useBgm(enabled: boolean): void {
  // Any tap counts as the gesture iOS wants for both the music and the voice,
  // and capture runs before React's handlers, so the very first tap unlocks.
  useEffect(() => {
    const unlock = () => {
      getBgm()?.unlock();
      unlockSpeech();
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    return () => window.removeEventListener('pointerdown', unlock, { capture: true });
  }, []);

  useEffect(() => {
    const bgm = getBgm();
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

    // iOS suspends the audio context on its own — while scrolling, after a
    // phone call — so poke it back awake rather than guessing. But the silent
    // clip tells iOS this app plays in the background, so closing the app has
    // to hand the audio session straight back or the music follows you out.
    const wake = () => bgm.keepAlive();
    const onVisibility = () => (document.hidden ? bgm.pauseForBackground() : bgm.keepAlive());
    const leave = () => bgm.pauseForBackground();

    const timer = setInterval(wake, 4000);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('focus', wake);
    window.addEventListener('pageshow', wake);
    window.addEventListener('touchend', wake);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('pointerdown', arm);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('focus', wake);
      window.removeEventListener('pageshow', wake);
      window.removeEventListener('touchend', wake);
    };
  }, [enabled]);
}
