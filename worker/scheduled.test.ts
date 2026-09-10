import { describe, it, expect } from "vitest";
import { trendingRoundPosition, findDateNeedingWork } from "./scheduled";

// ─── trendingRoundPosition ────────────────────────────────────────────────────

describe("trendingRoundPosition", () => {
  it("is deterministic for the same date", () => {
    expect(trendingRoundPosition("2026-09-11")).toBe(trendingRoundPosition("2026-09-11"));
  });
  it("always returns 1, 2, or 3", () => {
    for (const date of ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-01-01"]) {
      expect([1, 2, 3]).toContain(trendingRoundPosition(date));
    }
  });
  it("varies across different dates (not a constant)", () => {
    const positions = new Set(
      ["2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-01-01"].map(
        trendingRoundPosition,
      ),
    );
    expect(positions.size).toBeGreaterThan(1);
  });
});

// ─── findDateNeedingWork ──────────────────────────────────────────────────────

describe("findDateNeedingWork", () => {
  it("returns null when every date in the horizon is fully complete", () => {
    const rounds = new Map<string, Set<number>>();
    for (let i = 0; i <= 7; i++) rounds.set(addDays("2026-09-09", i), new Set([1, 2, 3]));
    expect(findDateNeedingWork(rounds, "2026-09-09")).toBeNull();
  });

  it("finds a date with no rows at all as missing all 3 rounds", () => {
    const rounds = new Map<string, Set<number>>();
    for (let i = 0; i <= 6; i++) rounds.set(addDays("2026-09-09", i), new Set([1, 2, 3]));
    // 2026-09-16 (offset 7) has no rows.
    const result = findDateNeedingWork(rounds, "2026-09-09");
    expect(result).toEqual({ date: "2026-09-16", missingRounds: [1, 2, 3] });
  });

  it("finds a partially-generated date and reports only the missing rounds", () => {
    const rounds = new Map<string, Set<number>>();
    for (let i = 0; i <= 7; i++) rounds.set(addDays("2026-09-09", i), new Set([1, 2, 3]));
    rounds.set("2026-09-12", new Set([1, 3])); // round 2 missing
    const result = findDateNeedingWork(rounds, "2026-09-09");
    expect(result).toEqual({ date: "2026-09-12", missingRounds: [2] });
  });

  it("returns the earliest incomplete date, not a later one", () => {
    const rounds = new Map<string, Set<number>>();
    for (let i = 0; i <= 7; i++) rounds.set(addDays("2026-09-09", i), new Set([1, 2, 3]));
    rounds.set("2026-09-10", new Set([1])); // earlier gap
    rounds.set("2026-09-15", new Set([1, 2])); // later gap
    const result = findDateNeedingWork(rounds, "2026-09-09");
    expect(result?.date).toBe("2026-09-10");
  });
});

function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
