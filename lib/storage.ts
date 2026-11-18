import { itemById, SHOP_ITEMS, type ShopSlot } from './content/shop';
import { levelFromXp } from './level';
import { stageFromLevel, type Stage } from './sprites';
import type { AppState, Pet, Session, Settings } from './types';

const KEY = 'eigo-bunny:v1';

export const DEFAULT_STATE: AppState = {
  pet: {
    name: 'ぴょんちゃん',
    xp: 0,
    mood: 80,
    gems: 120,
    owned: [],
    equipped: { hat: null, ribbon: null, glasses: null, scarf: null, cheek: null, room: 'room-day' },
    bornAt: 0,
    lastTalkAt: null,
    seenStage: 'egg',
  },
  settings: { englishLevel: 'beginner', showJa: true, autoSpeak: true, voicePreset: 'girl', voiceName: null, bgm: false },
  sessions: [],
  memory: { facts: [], lastTopics: [] },
  words: [],
  phrases: [],
  days: [],
};

export function dayKey(at: number): string {
  return new Date(at).toLocaleDateString('sv-SE');
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_STATE);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh = structuredClone(DEFAULT_STATE);
      fresh.pet.bornAt = Date.now();
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = structuredClone(DEFAULT_STATE);
    return {
      ...base,
      ...parsed,
      pet: {
        ...base.pet,
        ...(parsed.pet ?? {}),
        equipped: { ...base.pet.equipped, ...(parsed.pet?.equipped ?? {}) },
      },
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      memory: { ...base.memory, ...(parsed.memory ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export const STATE_EVENT = 'eigo-bunny:state';

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(STATE_EVENT));
  } catch {
    // quota or private mode — the app still runs, it just will not remember
  }
}

export function updateState(fn: (s: AppState) => AppState): AppState {
  const next = fn(loadState());
  saveState(next);
  return next;
}

export function currentStage(state: AppState): Stage {
  const { level } = levelFromXp(state.pet.xp);
  return stageFromLevel(level, state.sessions.length > 0);
}

// Mood drifts down when you stay away, but nothing is ever lost or undone.
export function moodNow(pet: Pet, now = Date.now()): number {
  if (!pet.lastTalkAt) return pet.mood;
  const days = Math.floor((now - pet.lastTalkAt) / 86_400_000);
  return Math.max(10, Math.min(100, pet.mood - days * 12));
}

const WEARABLE: ShopSlot[] = Array.from(
  new Set(SHOP_ITEMS.filter((i) => i.slot !== 'room').map((i) => i.slot)),
);

export function wornAccessories(pet: Pet): { id: string; color: string }[] {
  return WEARABLE.map((slot) => itemById(pet.equipped[slot]))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => ({ id: i.id, color: i.color }));
}

export function setSettings(patch: Partial<Settings>): AppState {
  return updateState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function renamePet(name: string): AppState {
  return updateState((s) => ({ ...s, pet: { ...s.pet, name: name.slice(0, 12) || s.pet.name } }));
}

export function commitSession(session: Session, facts: string[]): AppState {
  return updateState((s) => {
    const day = dayKey(session.at);
    const words = Array.from(new Set([...s.words, ...session.newWords]));
    const phrases = Array.from(new Set([...s.phrases, ...session.newPhrases]));
    return {
      ...s,
      pet: {
        ...s.pet,
        xp: s.pet.xp + session.xpGained,
        gems: s.pet.gems + session.gemsGained,
        mood: Math.min(100, moodNow(s.pet, session.at) + 18),
        lastTalkAt: session.at,
      },
      sessions: [session, ...s.sessions].slice(0, 200),
      memory: {
        facts: Array.from(new Set([...facts, ...s.memory.facts])).slice(0, 12),
        lastTopics: [session.topicTitle, ...s.memory.lastTopics].slice(0, 5),
      },
      words,
      phrases,
      days: s.days.includes(day) ? s.days : [...s.days, day],
    };
  });
}

export function markStageSeen(stage: Stage): AppState {
  return updateState((s) => ({ ...s, pet: { ...s.pet, seenStage: stage } }));
}

export function buyItem(id: string, price: number): AppState {
  return updateState((s) => {
    if (s.pet.owned.includes(id) || s.pet.gems < price) return s;
    return { ...s, pet: { ...s.pet, gems: s.pet.gems - price, owned: [...s.pet.owned, id] } };
  });
}

export function equipItem(slot: ShopSlot, id: string | null): AppState {
  return updateState((s) => ({
    ...s,
    pet: {
      ...s.pet,
      equipped: { ...s.pet.equipped, [slot]: slot === 'room' ? (id ?? 'room-day') : id },
    },
  }));
}

export function resetAll(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
