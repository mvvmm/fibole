import { describe, it, expect } from "vitest";
import { formatDisplayDate, editionNumber, buildShareText } from "./share";
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

// ─── editionNumber ────────────────────────────────────────────────────────────

describe("editionNumber", () => {
  it("launch date is No. 1", () => {
    expect(editionNumber("2026-06-19")).toBe(1);
  });
  it("day after launch is No. 2", () => {
    expect(editionNumber("2026-06-20")).toBe(2);
  });
  it("handles month boundaries correctly", () => {
    expect(editionNumber("2026-07-01")).toBe(13);
  });
});

// ─── buildShareText ───────────────────────────────────────────────────────────

function makeGameState(rounds: { answerScore: number; fibScore: number }[]): GameState {
  const totalScore = rounds.reduce((s, r) => s + r.answerScore + r.fibScore, 0);
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
      fibGuess: 0,
      fibPhaseComplete: true,
      fibCorrect: r.fibScore > 0,
      fibScore: r.fibScore,
    })),
  };
}

describe("buildShareText", () => {
  it("produces the expected format for a typical game", () => {
    const state = makeGameState([
      { answerScore: 3, fibScore: 1 },
      { answerScore: 2, fibScore: 0 },
      { answerScore: 0, fibScore: 1 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-06-19");
    expect(text).toBe(
      [
        "Fibole No. 1",
        "Score 7/12",
        "",
        "🟩🟩🟩  ✅",
        "🟩🟩🟥  ❌",
        "🟥🟥🟥  ✅",
        "",
        "https://fibole.com",
      ].join("\n"),
    );
  });

  it("includes https://fibole.com as the last line", () => {
    const state = makeGameState([{ answerScore: 3, fibScore: 1 }]);
    const text = buildShareText(state, [{}] as never, "2026-06-20");
    expect(text.split("\n").at(-1)).toBe("https://fibole.com");
  });

  it("shows a perfect score correctly", () => {
    const state = makeGameState([
      { answerScore: 3, fibScore: 1 },
      { answerScore: 3, fibScore: 1 },
      { answerScore: 3, fibScore: 1 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-06-20");
    expect(text).toContain("Score 12/12");
    expect(text).toContain("🟩🟩🟩  ✅\n🟩🟩🟩  ✅\n🟩🟩🟩  ✅");
  });

  it("shows a zero score correctly", () => {
    const state = makeGameState([
      { answerScore: 0, fibScore: 0 },
      { answerScore: 0, fibScore: 0 },
      { answerScore: 0, fibScore: 0 },
    ]);
    const text = buildShareText(state, [{}, {}, {}] as never, "2026-06-20");
    expect(text).toContain("Score 0/12");
    expect(text).toContain("🟥🟥🟥  ❌\n🟥🟥🟥  ❌\n🟥🟥🟥  ❌");
  });

  it("uses the edition number, not the date", () => {
    const state = makeGameState([{ answerScore: 3, fibScore: 1 }]);
    const text = buildShareText(state, [{}] as never, "2026-06-21");
    expect(text.split("\n")[0]).toBe("Fibole No. 3");
  });
});
