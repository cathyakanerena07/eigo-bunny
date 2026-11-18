export const XP_PER_LEVEL = (level: number): number => 80 + (level - 1) * 35;

export function levelFromXp(xp: number): { level: number; into: number; need: number; ratio: number } {
  let level = 1;
  let rest = xp;
  for (;;) {
    const need = XP_PER_LEVEL(level);
    if (rest < need) return { level, into: rest, need, ratio: need > 0 ? rest / need : 0 };
    rest -= need;
    level += 1;
  }
}

export function totalXpForLevel(target: number): number {
  let sum = 0;
  for (let l = 1; l < target; l += 1) sum += XP_PER_LEVEL(l);
  return sum;
}

export function xpForSession(turns: number, durationSec: number, newWords: number): number {
  const fromTurns = Math.min(60, turns * 6);
  const fromTime = Math.min(40, Math.round(durationSec / 6));
  return Math.max(10, fromTurns + fromTime + newWords * 4);
}

export function gemsForSession(turns: number): number {
  return Math.min(40, 8 + turns * 2);
}
