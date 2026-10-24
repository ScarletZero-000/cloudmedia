// XP/level system - pure functions, no DB needed.
// XP: uploads are the main driver, likes received reward quality, comments reward participation.

export type Tier = {
  name: string;
  bg: string;         // badge background (tailwind)
  text: string;       // badge text color
  ring: string;       // frame border color on profile
};

export const TIERS: Tier[] = [
  { name: "Newcomer", bg: "bg-stone-700",  text: "text-paper", ring: "border-ink-soft" },
  { name: "Rising",   bg: "bg-emerald-700", text: "text-paper", ring: "border-emerald-700" },
  { name: "Artist",   bg: "bg-sky-700",    text: "text-paper", ring: "border-sky-700" },
  { name: "Curator",  bg: "bg-violet-700", text: "text-paper", ring: "border-violet-700" },
  { name: "Legend",   bg: "bg-accent",     text: "text-paper", ring: "border-accent" },
];

export function computeXp(posts: number, likesReceived: number, comments: number): number {
  return posts * 25 + likesReceived * 3 + comments * 5;
}

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
