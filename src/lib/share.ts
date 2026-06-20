import type { GameState, Round } from "@/types";
import { maxScore } from "@/lib/scoring";

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatShareDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${month}/${day}/${String(year).slice(2)}`;
}

const SCORE_EMOJI = ["0️⃣", "1️⃣", "2️⃣", "3️⃣"] as const;

export function scoreToEmoji(n: number): string {
  return SCORE_EMOJI[n] ?? "0️⃣";
}

export function buildShareText(gameState: GameState, rounds: Round[], date: string): string {
  const lines = [
    `Fibole • ${formatShareDate(date)}`,
    `Score: ${gameState.totalScore}/${maxScore(rounds.length)}`,
    "",
    ...gameState.rounds.map(
      (r) => `${scoreToEmoji(r.answerScore)}/${scoreToEmoji(r.fakeFactScore)}`,
    ),
    "",
    "https://fibole.com",
  ];
  return lines.join("\n");
}
