// XP/level system — pure functions, no DB needed.
// XP: uploads are the main driver, likes received reward quality, comments reward participation.

export type Tier = {
  name: string;
  color: string;      // tailwind classes for the border/ring
  chip: string;       // chip styling
};

export const TIERS: Tier[] = [
  { name: "Newcomer", color: "border-ink-soft", chip: "border-ink-soft text-ink-soft" },
  { name: "Rising",   color: "border-emerald-600", chip: "border-emerald-600 text-emerald-700" },
  { name: "Artist",   color: "border-sky-500", chip: "border-sky-500 text-sky-600" },
  { name: "Curator",  color: "border-violet-500", chip: "border-violet-500 text-violet-600" },
  { name: "Legend",   color: "border-accent", chip: "border-accent text-accent" },
];

export function computeXp(posts: number, likesReceived: number, comments: number): number {
  return posts * 25 + likesReceived * 3 + comments * 5;
}

// Level curve: level 1 at 0xp, then each level costs more (sqrt curve keeps early levels snappy)
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 40)) + 1;
}

export function xpForLevel(level: number): number {
  return 40 * (level - 1) ** 2;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));
  return { level, current, next, pct, into: xp - current, need: next - xp };
}

export function tierForLevel(level: number): Tier {
  if (level >= 20) return TIERS[4];
  if (level >= 12) return TIERS[3];
  if (level >= 7) return TIERS[2];
  if (level >= 3) return TIERS[1];
  return TIERS[0];
}
