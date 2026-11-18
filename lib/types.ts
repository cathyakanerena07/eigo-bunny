import type { Stage } from './sprites';

export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced';

export type Turn = {
  role: 'user' | 'bunny';
  text: string;
  ja?: string;
  at: number;
};

export type Session = {
  id: string;
  at: number;
  topicId: string;
  topicTitle: string;
  durationSec: number;
  turns: Turn[];
  xpGained: number;
  gemsGained: number;
  newWords: string[];
  newPhrases: string[];
};

export type Pet = {
  name: string;
  xp: number;
  mood: number;
  gems: number;
  owned: string[];
  equipped: { hat: string | null; ribbon: string | null; glasses: string | null; room: string };
  bornAt: number;
  lastTalkAt: number | null;
  seenStage: Stage;
};

export type Settings = {
  englishLevel: EnglishLevel;
  showJa: boolean;
  autoSpeak: boolean;
  voiceName: string | null;
};

export type Memory = {
  facts: string[];
  lastTopics: string[];
};

export type AppState = {
  pet: Pet;
  settings: Settings;
  sessions: Session[];
  memory: Memory;
  words: string[];
  phrases: string[];
  days: string[];
};
