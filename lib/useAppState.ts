'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadState } from './storage';
import type { AppState } from './types';

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    // localStorage only exists on the client, so hydrate after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadState());
  }, []);

  const refresh = useCallback(() => setState(loadState()), []);

  return { state, refresh };
}
