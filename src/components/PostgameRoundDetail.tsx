import type { Round, RoundState } from "@/types";
import { CheckMark, XMark, FakeOval, PencilStrike, ScoreUnderline } from "./InkMarks";

interface Props {
  roundData: Round;
  roundState: RoundState;
  roundIndex: number;
  onBack: () => void;
}

function guessOrdinal(n: number): string {
  return (["1st", "2nd", "3rd"] as const)[n - 1] ?? `${n}th`;
}

function tryOrdinal(n: number): string {
  return (["first", "second", "third"] as const)[n - 1] ?? `${n}th`;
}

export function PostgameRoundDetail({ roundData, roundState, roundIndex, onBack }: Props) {
  const { answerGuesses, answerCorrect, answerScore, fibGuess, fibCorrect, fibScore } = roundState;
  const totalPoints = answerScore + fibScore;
  const roundLabel = `R${roundIndex + 1}`;

  let headline: string;
  if (answerScore > 0 && fibScore > 0) headline = "Both right.";
  else if (answerScore > 0) headline = "Half marks.";
  else if (fibScore > 0) headline = "Saved a point.";
  else headline = "No luck.";

  const headlineColor = answerScore > 0 && fibScore > 0 ? "#2f4a2e" : "#20201c";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            font: "700 11px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#a39a87",
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path
              d="M6 1L1 6L6 11M1.5 6H15"
              stroke="#a39a87"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Today's score
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              font: "700 11px/1 'Hanken Grotesk', sans-serif",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#c2b9a7",
            }}
          >
            {roundLabel}
          </span>
          <span style={{ font: "italic 400 14px/1 'Newsreader', serif", color: "#b4532f" }}>
            {roundData.topic}
          </span>
        </div>
      </div>

      {/* Answer status */}
      <div
        style={{
          marginTop: 22,
          padding: "13px 0",
          borderTop: "1px solid #ddd2bd",
          borderBottom: "1px solid #ddd2bd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {answerCorrect ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckMark size={22} />
            <div>
              <div
                style={{
                  font: "700 9.5px/1 'Hanken Grotesk', sans-serif",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#6f8a5f",
                }}
              >
                Solved · {tryOrdinal(answerGuesses.length)} try
              </div>
              <div
                style={{
                  font: "400 25px/1 'Libre Caslon Display', serif",
                  color: "#20201c",
                  marginTop: 5,
                }}
              >
                {roundData.answer}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div
                style={{
                  font: "700 9.5px/1 'Hanken Grotesk', sans-serif",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#a39a87",
                }}
              >
                Answer revealed
              </div>
              <div
                style={{
                  font: "400 25px/1 'Libre Caslon Display', serif",
                  color: "#20201c",
                  marginTop: 5,
                }}
              >
                {roundData.answer}
              </div>
            </div>
            <span
              style={{
                font: "600 16px/1 'Caveat', cursive",
                color: "#b09c7c",
                transform: "rotate(-5deg)",
                display: "inline-block",
              }}
            >
              no answer pts
            </span>
          </>
        )}
      </div>

      {/* Guesses */}
      <div style={{ marginTop: 18 }}>
        <div
          style={{
            font: "700 10px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#a39a87",
          }}
        >
          Your guesses{!answerCorrect ? " · all three spent" : ""}
        </div>
        <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 9 }}>
          {answerGuesses.map((guess, i) => {
            const isCorrect = answerCorrect && i === answerGuesses.length - 1;
            let caveatLabel = "";
            if (isCorrect) {
              caveatLabel =
                i === 0 ? "nailed it, first try" : `got it · ${guessOrdinal(i + 1)} of 3`;
            } else if (!answerCorrect) {
              caveatLabel =
                i === answerGuesses.length - 1
                  ? `${guessOrdinal(i + 1)} — out of guesses`
                  : guessOrdinal(i + 1);
            }
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isCorrect ? <CheckMark size={15} /> : <XMark size={15} color="#c08a73" />}
                <span
                  style={{
                    font: isCorrect
                      ? "italic 500 17px/1.2 'Newsreader', serif"
                      : "italic 400 16px/1.2 'Newsreader', serif",
                    color: isCorrect ? "#20201c" : "#9a9080",
                    ...(isCorrect
                      ? {}
                      : { textDecoration: "line-through", textDecorationColor: "#cbbfac" }),
                  }}
                >
                  {guess}
                </span>
                {caveatLabel && (
                  <span
                    style={{
                      font: `${isCorrect ? "600 15px" : "500 14px"}/1 'Caveat', cursive`,
                      color: isCorrect ? "#6f8a5f" : "#b09c7c",
                    }}
                  >
                    {caveatLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Facts */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column" }}>
        {roundData.facts.map((fact, i) => {
          const isFake = i === roundData.fib_index;
          const isPlayerMissedFake = fibGuess === i && !isFake;
          const isLast = i === roundData.facts.length - 1;
          const num = String(i + 1).padStart(2, "0");

          if (isFake) {
            return (
              <div
                key={i}
                style={{
                  padding: "11px 0",
                  borderTop: "1px solid #e8e0d1",
                  ...(isLast ? { borderBottom: "1px solid #e8e0d1" } : {}),
                }}
              >
                <div style={{ position: "relative" }}>
                  <FakeOval />
                  <div style={{ display: "flex", gap: 15 }}>
                    <div
                      style={{
                        font: "italic 400 14px/1.4 'Newsreader', serif",
                        color: "#b4532f",
                        minWidth: 20,
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        font: "400 13.5px/1.42 'Hanken Grotesk', sans-serif",
                        color: "#7a3a22",
                        paddingRight: 50,
                      }}
                    >
                      {fact}
                    </div>
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      top: -3,
                      right: 4,
                      font: "700 22px/1 'Caveat', cursive",
                      color: "#b4532f",
                      transform: "rotate(-7deg)",
                    }}
                  >
                    the fake
                  </span>
                </div>
                {fibCorrect ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginTop: 9,
                      paddingLeft: 35,
                    }}
                  >
                    <svg width="14" height="13" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M7.5 1.5V13.5M1.5 7.5H13.5"
                        stroke="#6f8a5f"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{ font: "italic 400 13px/1.3 'Newsreader', serif", color: "#5d7a52" }}
                    >
                      You caught it.{" "}
                      <span style={{ color: "#a86a4e" }}>
                        Actually true of {roundData.fib_true_subject}.
                      </span>
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      font: "italic 400 13px/1.3 'Newsreader', serif",
                      color: "#a86a4e",
                      marginTop: 9,
                      paddingLeft: 35,
                    }}
                  >
                    Actually true of {roundData.fib_true_subject}.
                  </div>
                )}
              </div>
            );
          }

          if (isPlayerMissedFake) {
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  padding: "11px 0",
                  borderTop: "1px solid #e8e0d1",
                  ...(isLast ? { borderBottom: "1px solid #e8e0d1" } : {}),
                }}
              >
                <PencilStrike />
                <div style={{ display: "flex", gap: 15 }}>
                  <div
                    style={{
                      font: "italic 400 14px/1.4 'Newsreader', serif",
                      color: "#aaa191",
                      minWidth: 20,
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      font: "400 13.5px/1.42 'Hanken Grotesk', sans-serif",
                      color: "#9a9080",
                      paddingRight: 58,
                    }}
                  >
                    {fact}
                  </div>
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 4,
                    font: "600 16px/1 'Caveat', cursive",
                    color: "#9a9080",
                    transform: "rotate(-5deg)",
                  }}
                >
                  your fake
                </span>
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 15,
                padding: "11px 0",
                borderTop: "1px solid #e8e0d1",
                ...(isLast ? { borderBottom: "1px solid #e8e0d1" } : {}),
              }}
            >
              <div
                style={{
                  font: "italic 400 14px/1.4 'Newsreader', serif",
                  color: "#bdb4a2",
                  minWidth: 20,
                }}
              >
                {num}
              </div>
              <div
                style={{ font: "400 13.5px/1.42 'Hanken Grotesk', sans-serif", color: "#6f6a5e" }}
              >
                {fact}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingTop: 14,
          borderTop: "1.5px solid #20201c",
        }}
      >
        <div>
          <div
            style={{
              font: "400 23px/1 'Libre Caslon Display', serif",
              color: headlineColor,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              font: "italic 400 14px/1.3 'Newsreader', serif",
              color: "#8a8472",
              marginTop: 5,
            }}
          >
            Answer {answerScore}&nbsp;·&nbsp;Fake {fibScore}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ font: "800 40px/0.9 'Hanken Grotesk', sans-serif", color: "#20201c" }}>
            +{totalPoints}
          </div>
          {totalPoints === 4 && <ScoreUnderline />}
        </div>
      </div>
    </div>
  );
}
