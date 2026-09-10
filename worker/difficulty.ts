export type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

// ─── Pageview / rank banding ──────────────────────────────────────────────────
// Mirrors .claude/skills/generate-questions.md's difficulty distribution rules.

export function classifyByViews(monthlyAvgViews: number): Difficulty {
  if (monthlyAvgViews > 90_000) return "easy";
  if (monthlyAvgViews >= 15_000) return "medium";
  return "hard";
}

export function classifyByRank(rank: number): Difficulty {
  if (rank <= 100) return "easy";
  if (rank <= 500) return "medium";
  return "hard";
}

/**
 * Given candidates already bucketed by band, returns the band to sample from:
 * the target band if it has candidates, otherwise the nearest non-empty band.
 * Ports the skill's "fall back to the closest available difficulty" rule,
 * used for both trending rank-buckets and category pageview-buckets.
 */
export function nearestAvailableBand<T>(
  target: Difficulty,
  pools: Record<Difficulty, T[]>,
): Difficulty | null {
  if (pools[target].length > 0) return target;

  const targetIdx = DIFFICULTY_ORDER.indexOf(target);
  for (let dist = 1; dist < DIFFICULTY_ORDER.length; dist++) {
    const left = DIFFICULTY_ORDER[targetIdx - dist];
    const right = DIFFICULTY_ORDER[targetIdx + dist];
    if (left && pools[left].length > 0) return left;
    if (right && pools[right].length > 0) return right;
  }
  return null;
}

// ─── Day-of-week difficulty schedule ──────────────────────────────────────────
// Replaces the skill's running-tally-against-a-batch-target approach (which
// assumed a known N-day batch generated upfront) with a fixed per-weekday
// schedule, so a cron adding exactly one day at a time still reproduces the
// skill's target weekly ratio — 14 easy / 5 medium / 2 hard out of 21 rounds
// (~67% / 24% / 10%) — every week, with no dependency on D1's accumulated
// history. Ramps harder toward the weekend, like a crossword.

// Keyed by Date#getUTCDay(): 0 = Sunday ... 6 = Saturday.
const WEEKLY_SCHEDULE: Record<number, [Difficulty, Difficulty, Difficulty]> = {
  0: ["easy", "easy", "medium"], // Sunday
  1: ["easy", "easy", "easy"], // Monday
  2: ["easy", "easy", "easy"], // Tuesday
  3: ["easy", "easy", "medium"], // Wednesday
  4: ["easy", "easy", "medium"], // Thursday
  5: ["easy", "medium", "hard"], // Friday
  6: ["easy", "medium", "hard"], // Saturday
};

/** Target difficulty for a given round (1-3) of a given calendar date. */
export function difficultyForRound(dateISO: string, roundNumber: 1 | 2 | 3): Difficulty {
  return WEEKLY_SCHEDULE[weekdayOf(dateISO)][roundNumber - 1];
}

/** 0 (Sunday) - 6 (Saturday) for a plain "YYYY-MM-DD" calendar date. */
function weekdayOf(dateISO: string): number {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
