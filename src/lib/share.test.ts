import { describe, it, expect } from "vitest";
import { formatDisplayDate, formatShareDate, scoreToEmoji, buildShareText } from "./share";
import type { GameState } from "@/types";

// ─── formatDisplayDate ────────────────────────────────────────────────────────

describe("formatDisplayDate", () => {
  it("formats a date as 'Mon D, YYYY'", () => {
    expect(formatDisplayDate("2026-07-19")).toBe("Jul 19, 2026");
  });
  it("handles single-digit day", () => {
    expect(formatDisplayDate("2026-01-05")).toBe("Jan 5, 2026");
  });
  it("handles December", () => {
    expect(formatDisplayDate("2026-12-31")).toBe("Dec 31, 2026");
  });
});

// ─── formatShareDate ──────────────────────────────────────────────────────────

describe("formatShareDate", () => {
  it("formats as M/D/YY with no padding", () => {
    expect(formatShareDate("2026-07-19")).toBe("7/19/26");
  });
  it("strips leading zeros from month and day", () => {
    expect(formatShareDate("2026-01-05")).toBe("1/5/26");
  });
  it("uses two-digit year", () => {
    expect(formatShareDate("2030-06-20")).toBe("6/20/30");
  });
});

// ─── scoreToEmoji ─────────────────────────────────────────────────────────────

describe("scoreToEmoji", () => {
  it("maps 0 → 0️⃣", () => expect(scoreToEmoji(0)).toBe("0️⃣"));
  it("maps 1 → 1️⃣", () => expect(scoreToEmoji(1)).toBe("1️⃣"));
  it("maps 2 → 2️⃣", () => expect(scoreToEmoji(2)).toBe("2️⃣"));
  it("maps 3 → 3️⃣", () => expect(scoreToEmoji(3)).toBe("3️⃣"));
  it("falls back to 0️⃣ for out-of-range values", () => expect(scoreToEmoji(99)).toBe("0️⃣"));
});

// ─── buildShareText ───────────────────────────────────────────────────────────

function makeGameState(rounds: { answerScore: number; fakeFactScore: number }[]): GameState {
  const totalScore = rounds.reduce((s, r) => s + r.answerScore + r.fakeFactScore, 0);
  return {
    currentRound: rounds.length,
    phase: "complete",
    totalScore,
    completedAt: null,
    rounds: rounds.map((r) => ({
      answerGuesses: [],
      answerPhaseComplete: true,
      answerCorrect: r.answerScore > 0,
      answerScore: r.answerScore,
      fakeFactGuess: 0,
      fakeFactPhaseComplete: true,
      fakeFactCorrect: r.fakeFactScore > 0,
      fakeFactScore: r.fakeFactScore,
    })),
  };
}

describe("buildShareText", () => {
  it("produces the expected format for a typical game", () => {
    const state = makeGameState([
      { answerScore: 0, fakeFactScore: 0 },
      { answerScore: 2, fakeFactScore: 1 },
      { answerScore: 3, fakeFactScore: 1 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-07-19");
    expect(text).toBe(
      [
        "Fibole • 7/19/26",
        "Score: 7/12",
        "",
        "0️⃣/0️⃣",
        "2️⃣/1️⃣",
        "3️⃣/1️⃣",
        "",
        "https://fibole.com",
      ].join("\n"),
    );
  });

  it("includes https://fibole.com as the last line", () => {
    const state = makeGameState([{ answerScore: 3, fakeFactScore: 1 }]);
    const text = buildShareText(state, [{}] as never, "2026-06-20");
    expect(text.split("\n").at(-1)).toBe("https://fibole.com");
  });

  it("shows a perfect score correctly", () => {
    const state = makeGameState([
      { answerScore: 3, fakeFactScore: 1 },
      { answerScore: 3, fakeFactScore: 1 },
      { answerScore: 3, fakeFactScore: 1 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-06-20");
    expect(text).toContain("Score: 12/12");
    expect(text).toContain("3️⃣/1️⃣\n3️⃣/1️⃣\n3️⃣/1️⃣");
  });

  it("shows a zero score correctly", () => {
    const state = makeGameState([
      { answerScore: 0, fakeFactScore: 0 },
      { answerScore: 0, fakeFactScore: 0 },
      { answerScore: 0, fakeFactScore: 0 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-06-20");
    expect(text).toContain("Score: 0/12");
    expect(text).toContain("0️⃣/0️⃣\n0️⃣/0️⃣\n0️⃣/0️⃣");
  });
});
