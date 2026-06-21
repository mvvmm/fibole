import { useMemo } from "react";

// Edition 1 launch date — adjust if the actual launch date differs
const LAUNCH_DATE = "2026-06-19";

interface HomeScreenProps {
  date: string;
  onPlay: () => void;
  onHowToPlay: () => void;
}

function computeGameNumber(dateStr: string): number {
  const epoch = new Date(LAUNCH_DATE + "T12:00:00");
  const d = new Date(dateStr + "T12:00:00");
  return Math.max(1, Math.round((d.getTime() - epoch.getTime()) / 86400000) + 1);
}

function formatDateText(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function HomeScreen({ date, onPlay, onHowToPlay }: HomeScreenProps) {
  const gameNumber = useMemo(() => computeGameNumber(date), [date]);
  const dateText = useMemo(() => formatDateText(date), [date]);

  return (
    <div
      style={{
        minHeight: "100svh",
        maxWidth: 430,
        margin: "0 auto",
        padding: "0 34px 36px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Dateline */}
      <div
        style={{
          marginTop: "clamp(28px, 7.5svh, 64px)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            height: 1,
            flex: 1,
            background: "#ddd2bd",
            display: "block",
          }}
        />
        <span
          style={{
            font: "800 12px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#b4532f",
            whiteSpace: "nowrap",
          }}
        >
          No. {gameNumber}
        </span>
        <span
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#cdbfa3",
            display: "inline-block",
          }}
        />
        <span
          style={{
            font: "italic 400 14px/1 'Newsreader', serif",
            color: "#8a8472",
            whiteSpace: "nowrap",
          }}
        >
          {dateText}
        </span>
        <span
          style={{
            height: 1,
            flex: 1,
            background: "#ddd2bd",
            display: "block",
          }}
        />
      </div>

      {/* Hero — flex:1 centers the fixed-height unit; the unit itself never reflows */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fixed-size unit: text + doodles are one static element */}
        <div style={{ position: "relative", width: "100%", height: 460 }}>
          {/* Ink doodles — all at fixed pixel offsets within the 460px unit */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 34 34"
            fill="none"
            style={{
              position: "absolute",
              left: 58,
              top: 36,
              transform: "rotate(-6deg)",
              pointerEvents: "none",
            }}
          >
            <path d="M17 3V31M3 17H31" stroke="#d8b8a6" strokeWidth="2.8" strokeLinecap="round" />
            <path
              d="M7 7L27 27M27 7L7 27"
              stroke="#d8b8a6"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>
          <svg
            width="30"
            height="30"
            viewBox="0 0 40 40"
            fill="none"
            style={{
              position: "absolute",
              right: 62,
              top: 62,
              pointerEvents: "none",
            }}
          >
            <path
              d="M20 5C10 4 4 11 5 21C6 30 14 36 24 34C32 32 36 23 31 14C28 9 23 6 17 6"
              stroke="#cdbfa3"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="58"
            height="16"
            viewBox="0 0 60 16"
            fill="none"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 84,
              pointerEvents: "none",
            }}
          >
            <path
              d="M4 9C13 3 19 13 28 8C37 3 44 12 56 7"
              stroke="#d8b8a6"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="40"
            height="40"
            viewBox="0 0 58 58"
            fill="none"
            style={{
              position: "absolute",
              right: 6,
              top: 122,
              transform: "rotate(8deg)",
              pointerEvents: "none",
            }}
          >
            <path d="M29 8V50M8 29H50" stroke="#b4532f" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M14 14L44 44M44 14L14 44"
              stroke="#b4532f"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
          <svg
            width="26"
            height="26"
            viewBox="0 0 34 34"
            fill="none"
            style={{
              position: "absolute",
              left: 12,
              top: 146,
              transform: "rotate(-10deg)",
              pointerEvents: "none",
            }}
          >
            <path d="M17 4V30M4 17H30" stroke="#cdbfa3" strokeWidth="2.8" strokeLinecap="round" />
            <path
              d="M8 8L26 26M26 8L8 26"
              stroke="#cdbfa3"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="28"
            height="28"
            viewBox="0 0 40 40"
            fill="none"
            style={{
              position: "absolute",
              left: 4,
              top: 334,
              pointerEvents: "none",
            }}
          >
            <path
              d="M20 5C10 4 4 11 5 21C6 30 14 36 24 34C32 32 36 23 31 14C28 9 23 6 17 6"
              stroke="#cdbfa3"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="34"
            height="40"
            viewBox="0 0 36 44"
            fill="none"
            style={{
              position: "absolute",
              right: 6,
              top: 322,
              pointerEvents: "none",
            }}
          >
            <path
              d="M8 6C24 10 30 24 22 34C17 40 9 38 8 31C7 25 13 22 17 26"
              stroke="#d8b8a6"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <svg
            width="116"
            height="20"
            viewBox="0 0 120 26"
            fill="none"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 398,
              pointerEvents: "none",
            }}
          >
            <path
              d="M5 14C20 5 32 22 47 13C62 4 74 21 89 12C100 6 108 10 115 14"
              stroke="#d8b8a6"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </svg>

          {/* Title + tagline — centered in the 460px unit */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  font: "400 78px/0.92 'Libre Caslon Display', serif",
                  color: "#20201c",
                }}
              >
                Fibole
              </div>
              <svg
                width="244"
                height="22"
                viewBox="0 0 420 36"
                fill="none"
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: -14,
                }}
              >
                <path
                  d="M12 24C92 9 162 30 238 19C298 10 356 18 408 26"
                  stroke="#b4532f"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M30 32C92 22 156 33 232 27"
                  stroke="#b4532f"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
            <div
              style={{
                font: "400 25px/1.32 'Libre Caslon Display', serif",
                color: "#4a463d",
                marginTop: 52,
              }}
            >
              Four facts. Three are true.
              <br />
              Can you spot the fib?
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div>
        <button
          onClick={onPlay}
          style={{
            width: "100%",
            border: "none",
            background: "#20201c",
            color: "#f6f1e7",
            padding: 19,
            borderRadius: 4,
            font: "600 17px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Play today's puzzle
        </button>
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={onHowToPlay}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "400 13px/1 'Hanken Grotesk', sans-serif",
              color: "#b4532f",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            How to play →
          </button>
        </div>
      </div>
    </div>
  );
}
