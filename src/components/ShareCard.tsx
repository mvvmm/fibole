import { useState } from "react";
import type { GameState, Round } from "@/types";
import { maxScore } from "@/lib/scoring";
import { buildShareText, formatDisplayDate } from "@/lib/share";

interface ShareCardProps {
  gameState: GameState;
  rounds: Round[];
  date: string;
}

export function ShareCard({ gameState, rounds, date }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const total = gameState.totalScore;
  const max = maxScore(rounds.length);

  async function handleShare() {
    const text = buildShareText(gameState, rounds, date);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-4xl font-bold text-slate-900">
          {total}/{max}
        </p>
        <p className="text-slate-500 mt-1 text-sm">{formatDisplayDate(date)}</p>
      </div>

      <div className="space-y-2">
        {gameState.rounds.map((r, i) => {
          const roundTotal = r.answerScore + r.fakeFactScore;
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="text-sm text-slate-600">
                Round {i + 1}: {rounds[i]?.topic}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {r.answerCorrect ? "✅" : "❌"} {r.fakeFactCorrect ? "✅" : "❌"}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {roundTotal}pt{roundTotal !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleShare}
        className="w-full rounded-lg bg-slate-900 py-4 text-base font-semibold text-white active:scale-[0.98] transition-transform"
      >
        {copied ? "Copied!" : "Share Results"}
      </button>

      <p className="text-xs text-slate-400">Come back tomorrow for a new challenge!</p>
    </div>
  );
}
