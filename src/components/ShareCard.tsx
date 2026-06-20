import { useState } from "react";
import type { GameState, Round } from "@/types";
import { maxScore } from "@/lib/scoring";
import { buildShareText } from "@/lib/share";
import { BrandSwash, CheckMark, ScoreCircle, XMark } from "./InkMarks";

interface ShareCardProps {
  gameState: GameState;
  rounds: Round[];
  date: string;
}

function formatLongDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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
    <div>
      {/* Fibole header */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            font: "400 30px/1 'Libre Caslon Display', serif",
            color: "#20201c",
          }}
        >
          Fibole
        </div>
        <BrandSwash style={{ display: "block", margin: "6px auto 0" }} />
      </div>

      {/* Score with ink circle */}
      <div style={{ textAlign: "center", marginTop: 46 }}>
        <div
          style={{
            font: "700 11px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#a39a87",
          }}
        >
          Today's score
        </div>
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "baseline",
            whiteSpace: "nowrap",
            marginTop: 16,
          }}
        >
          <span
            style={{
              font: "400 84px/0.9 'Libre Caslon Display', serif",
              color: "#20201c",
            }}
          >
            {total}
          </span>
          <span
            style={{
              font: "400 52px/0.9 'Libre Caslon Display', serif",
              color: "#b8b0a0",
            }}
          >
            /{max}
          </span>
          <ScoreCircle />
        </div>
        <div
          style={{
            font: "italic 400 17px/1 'Newsreader', serif",
            color: "#8a8472",
            marginTop: 22,
          }}
        >
          {formatLongDate(date)}
        </div>
      </div>

      {/* Round rows */}
      <div style={{ marginTop: 40 }}>
        {gameState.rounds.map((r, i) => {
          const roundTotal = r.answerScore + r.fakeFactScore;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 2px",
                borderTop: "1px solid #e2d9c6",
                borderBottom: i === gameState.rounds.length - 1 ? "1px solid #e2d9c6" : undefined,
              }}
            >
              <div>
                <div
                  style={{
                    font: "700 10px/1 'Hanken Grotesk', sans-serif",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#a39a87",
                  }}
                >
                  Round {i + 1}
                </div>
                <div
                  style={{
                    font: "600 16px/1.1 'Hanken Grotesk', sans-serif",
                    color: "#2a2823",
                    marginTop: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {rounds[i]?.topic}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  {r.answerCorrect ? <CheckMark size={17} /> : <XMark size={15} color="#b4532f" />}
                  {r.fakeFactCorrect ? (
                    <CheckMark size={17} />
                  ) : (
                    <XMark size={15} color="#b4532f" />
                  )}
                </span>
                <span
                  style={{
                    font: "700 18px/1 'Hanken Grotesk', sans-serif",
                    color: "#20201c",
                    minWidth: 24,
                    textAlign: "right",
                  }}
                >
                  {roundTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        style={{
          marginTop: 32,
          width: "100%",
          border: "none",
          background: "#20201c",
          color: "#f6f1e7",
          padding: 17,
          borderRadius: 4,
          font: "600 16px/1 'Hanken Grotesk', sans-serif",
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        {copied ? "Copied!" : "Share results"}
      </button>

      <div
        style={{
          textAlign: "center",
          font: "italic 400 15px/1 'Newsreader', serif",
          color: "#a39a87",
          marginTop: 16,
        }}
      >
        Come back tomorrow for a new challenge
      </div>
    </div>
  );
}
