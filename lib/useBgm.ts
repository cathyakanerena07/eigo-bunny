'use client';

import { useEffect } from 'react';
import { getBgm } from './bgm';

// Nothing here warms up the audio on a hunch any more. iOS hands the audio
// session to whoever touches it — an AudioContext merely running, or one
// throwaway utterance — and whatever the person was listening to stops. So the
// app only makes a sound when it actually has a sound to make: speakWhenAllowed
// retries on the next tap, which is gesture enough for iOS on its own.
export function useBgm(enabled: boolean): void {
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
