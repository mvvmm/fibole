import type { GameState, Round } from "@/types";
import { maxScore } from "@/lib/scoring";

const LAUNCH_DATE = "2026-06-19";

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function editionNumber(dateStr: string): number {
  const [ly, lm, ld] = LAUNCH_DATE.split("-").map(Number);
  const [dy, dm, dd] = dateStr.split("-").map(Number);
  const launch = Date.UTC(ly, lm - 1, ld);
  const game = Date.UTC(dy, dm - 1, dd);
  return Math.floor((game - launch) / 86_400_000) + 1;
}

function roundRow(answerScore: number, fibCorrect: boolean | null): string {
  const squares = "🟩".repeat(answerScore) + "🟥".repeat(3 - answerScore);
  const fib = fibCorrect ? "✅" : "❌";
  return `${squares}  ${fib}`;
}

export function buildShareText(gameState: GameState, rounds: Round[], date: string): string {
  const lines = [
    `Fibole No. ${editionNumber(date)}`,
    `Score ${gameState.totalScore}/${maxScore(rounds.length)}`,
    "",
    ...gameState.rounds.map((r) => roundRow(r.answerScore, r.fibCorrect)),
    "",
    "https://fibole.com",
  ];
  return lines.join("\n");
}
