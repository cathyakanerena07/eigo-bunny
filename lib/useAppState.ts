'use client';

import { useCallback, useEffect, useState } from 'react';
import { STATE_EVENT, loadState } from './storage';
import type { AppState } from './types';

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // localStorage only exists on the client, so hydrate after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  const refresh = useCallback(() => setState(loadState()), []);

  // Every screen reads the same save, so a change anywhere has to reach them all.
  useEffect(() => {
    window.addEventListener(STATE_EVENT, refresh);
    return () => window.removeEventListener(STATE_EVENT, refresh);
  }, [refresh]);

  return { state, refresh };
}
