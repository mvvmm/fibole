import { describe, it, expect } from "vitest";
import {
  classifyByViews,
  classifyByRank,
  nearestAvailableBand,
  difficultyForRound,
} from "./difficulty";

// ─── classifyByViews ──────────────────────────────────────────────────────────

describe("classifyByViews", () => {
  it("is easy above 90k", () => expect(classifyByViews(90_001)).toBe("easy"));
  it("is medium at exactly 90k", () => expect(classifyByViews(90_000)).toBe("medium"));
  it("is medium at exactly 15k", () => expect(classifyByViews(15_000)).toBe("medium"));
  it("is hard below 15k", () => expect(classifyByViews(14_999)).toBe("hard"));
});

// ─── classifyByRank ───────────────────────────────────────────────────────────

describe("classifyByRank", () => {
  it("is easy at rank 1", () => expect(classifyByRank(1)).toBe("easy"));
  it("is easy at rank 100", () => expect(classifyByRank(100)).toBe("easy"));
  it("is medium at rank 101", () => expect(classifyByRank(101)).toBe("medium"));
  it("is medium at rank 500", () => expect(classifyByRank(500)).toBe("medium"));
  it("is hard at rank 501", () => expect(classifyByRank(501)).toBe("hard"));
});

// ─── nearestAvailableBand ─────────────────────────────────────────────────────

describe("nearestAvailableBand", () => {
  it("returns the target band when it has candidates", () => {
    const pools = { easy: [1], medium: [2], hard: [3] };
    expect(nearestAvailableBand("medium", pools)).toBe("medium");
  });
  it("falls back to an adjacent band when the target is empty", () => {
    const pools = { easy: [], medium: [2], hard: [] };
    expect(nearestAvailableBand("hard", pools)).toBe("medium");
  });
  it("falls back across two steps when needed", () => {
    const pools = { easy: [1], medium: [], hard: [] };
    expect(nearestAvailableBand("hard", pools)).toBe("easy");
  });
  it("returns null when every band is empty", () => {
    const pools = { easy: [], medium: [], hard: [] };
    expect(nearestAvailableBand("easy", pools)).toBeNull();
  });
});

// ─── difficultyForRound (day-of-week schedule) ───────────────────────────────

describe("difficultyForRound", () => {
  it("is all-easy on Monday", () => {
    expect(difficultyForRound("2026-09-07", 1)).toBe("easy");
    expect(difficultyForRound("2026-09-07", 2)).toBe("easy");
    expect(difficultyForRound("2026-09-07", 3)).toBe("easy");
  });
  it("ramps to medium by round 3 on Wednesday", () => {
    expect(difficultyForRound("2026-09-09", 1)).toBe("easy");
    expect(difficultyForRound("2026-09-09", 2)).toBe("easy");
    expect(difficultyForRound("2026-09-09", 3)).toBe("medium");
  });
  it("covers all three bands on Friday", () => {
    expect(difficultyForRound("2026-09-11", 1)).toBe("easy");
    expect(difficultyForRound("2026-09-11", 2)).toBe("medium");
    expect(difficultyForRound("2026-09-11", 3)).toBe("hard");
  });
  it("covers all three bands on Saturday", () => {
    expect(difficultyForRound("2026-09-12", 1)).toBe("easy");
    expect(difficultyForRound("2026-09-12", 2)).toBe("medium");
    expect(difficultyForRound("2026-09-12", 3)).toBe("hard");
  });
  it("is deterministic across repeated calls for the same date", () => {
    expect(difficultyForRound("2026-09-11", 3)).toBe(difficultyForRound("2026-09-11", 3));
  });
  it("the weekly schedule sums to the skill's target ratio (14/5/2 per 21)", () => {
    const dates = [
      "2026-09-06", // Sun
      "2026-09-07", // Mon
      "2026-09-08", // Tue
      "2026-09-09", // Wed
      "2026-09-10", // Thu
      "2026-09-11", // Fri
      "2026-09-12", // Sat
    ];
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const date of dates) {
      for (const round of [1, 2, 3] as const) {
        counts[difficultyForRound(date, round)]++;
      }
    }
    expect(counts).toEqual({ easy: 14, medium: 5, hard: 2 });
  });
});
