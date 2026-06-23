import { useState } from "react";
import type { Round as RoundData, RoundState } from "@/types";
import { FactList } from "./FactList";
import { AnswerInput } from "./AnswerInput";
import {
  CheckMark,
  LongUnderline,
  MediumUnderline,
  ShortUnderline,
  ScoreUnderline,
  TopicSpark,
} from "./InkMarks";

const MAX_GUESSES = 3;

const ORDINALS = ["first", "second", "third"];

interface RoundProps {
  roundData: RoundData;
  roundState: RoundState;
  roundNumber: number;
  totalRounds: number;
  phase: "answer" | "fib";
  onSubmitAnswer: (guess: string) => void;
  onSubmitFib: (index: number) => void;
  onNext: () => void;
  onGiveUp: () => void;
}

export function Round({
  roundData,
  roundState,
  roundNumber,
  totalRounds,
  phase,
  onSubmitAnswer,
  onSubmitFib,
  onNext,
  onGiveUp,
}: RoundProps) {
  const [pendingFibIndex, setPendingFibIndex] = useState<number | null>(null);

  const isResult = roundState.fibPhaseComplete;
  const isAnswerPhase = phase === "answer";
  const inFibSelection = phase === "fib" && !isResult;
  const isLastRound = roundNumber === totalRounds;

  const lastGuessWrong =
    roundState.answerGuesses.length > 0 &&
    !roundState.answerCorrect &&
    !roundState.answerPhaseComplete;

  const lastWrongGuess = lastGuessWrong
    ? roundState.answerGuesses[roundState.answerGuesses.length - 1]
    : undefined;

  const solvedOrdinal = ORDINALS[roundState.answerGuesses.length - 1] ?? "third";

  const RoundTopicRow = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          font: "700 11px/1 'Hanken Grotesk', sans-serif",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#a39a87",
        }}
      >
        Round {roundNumber} / {totalRounds}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          font: "italic 400 15px/1 'Newsreader', serif",
          color: "#b4532f",
          whiteSpace: "nowrap",
        }}
      >
        <TopicSpark />
        {roundData.topic}
      </span>
    </div>
  );

  // ── ANSWER PHASE ────────────────────────────────────────────────────
  if (isAnswerPhase) {
    return (
      <div>
        {RoundTopicRow}

        <div style={{ position: "relative", marginTop: 24 }}>
          <div
            style={{
              font: "400 26px/1.3 'Libre Caslon Display', serif",
              color: "#20201c",
            }}
          >
            Who or what do these
            <br />
            facts describe?
          </div>
          <LongUnderline style={{ position: "absolute", left: 0, bottom: -9, display: "block" }} />
          <div
            style={{
              position: "absolute",
              right: -2,
              top: 22,
              transform: "rotate(5deg)",
              textAlign: "right",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                display: "block",
                font: "600 17px/1.05 'Caveat', cursive",
                color: "#a39a87",
                whiteSpace: "nowrap",
              }}
            >
              * one of them
              <br />
              is a fib!
            </span>
            <svg
              width="36"
              height="26"
              viewBox="0 0 36 30"
              fill="none"
              style={{ display: "block", margin: "3px 10px 0 auto" }}
            >
              <path
                d="M25 2C29 9 22 17 18 26M11.5 21Q14.5 25 18 26Q21.5 25 24.5 21"
                stroke="#a39a87"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <FactList facts={roundData.facts} mode="reading" />
        </div>

        <div style={{ marginTop: 24 }}>
          <AnswerInput
            onSubmit={onSubmitAnswer}
            guessCount={roundState.answerGuesses.length}
            maxGuesses={MAX_GUESSES}
            disabled={false}
            lastGuessWrong={lastGuessWrong}
            lastWrongGuess={lastWrongGuess}
            onGiveUp={onGiveUp}
          />
        </div>
      </div>
    );
  }

  // ── FIB SELECTION PHASE ──────────────────────────────────────────────
  if (inFibSelection) {
    const answerCorrect = roundState.answerCorrect;
    const headingText = answerCorrect ? "Now — which is the fib?" : "Still — spot the fib?";
    const hintText = answerCorrect ? "one shot at this" : "a point of pride is still a point";
    const Underline = answerCorrect ? MediumUnderline : ShortUnderline;

    return (
      <div>
        {RoundTopicRow}

        {/* Reveal banner */}
        <div
          style={{
            marginTop: 22,
            padding: "14px 0",
            borderTop: "1px solid #ddd2bd",
            borderBottom: "1px solid #ddd2bd",
            display: "flex",
            alignItems: "center",
            gap: 14,
            justifyContent: answerCorrect ? undefined : "space-between",
          }}
        >
          {answerCorrect ? (
            <>
              <CheckMark size={26} />
              <div>
                <div
                  style={{
                    font: "700 10px/1 'Hanken Grotesk', sans-serif",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#6f8a5f",
                  }}
                >
                  Solved · {solvedOrdinal} try
                </div>
                <div
                  style={{
                    font: "400 26px/1 'Libre Caslon Display', serif",
                    color: "#20201c",
                    marginTop: 5,
                  }}
                >
                  {roundData.answer}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div
                  style={{
                    font: "700 10px/1 'Hanken Grotesk', sans-serif",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#a39a87",
                  }}
                >
                  Answer revealed
                </div>
                <div
                  style={{
                    font: "400 26px/1 'Libre Caslon Display', serif",
                    color: "#20201c",
                    marginTop: 5,
                  }}
                >
                  {roundData.answer}
                </div>
              </div>
              <span
                style={{
                  font: "600 17px/1 'Caveat', cursive",
                  color: "#b09c7c",
                  transform: "rotate(-5deg)",
                }}
              >
                no points
              </span>
            </>
          )}
        </div>

        {/* Heading */}
        <div style={{ position: "relative", marginTop: 26 }}>
          <div
            style={{
              font: "400 23px/1.25 'Libre Caslon Display', serif",
              color: "#20201c",
            }}
          >
            {headingText}
          </div>
          <Underline style={{ position: "absolute", left: 0, bottom: -8, display: "block" }} />
        </div>

        <div style={{ marginTop: 28 }}>
          <FactList
            facts={roundData.facts}
            mode="selecting"
            selectedIndex={pendingFibIndex}
            onSelect={setPendingFibIndex}
          />
        </div>

        <button
          onClick={() => pendingFibIndex !== null && onSubmitFib(pendingFibIndex)}
          disabled={pendingFibIndex === null}
          style={{
            marginTop: 24,
            width: "100%",
            border: "none",
            background: pendingFibIndex !== null ? "#20201c" : "#c9c1b4",
            color: "#f6f1e7",
            padding: 16,
            borderRadius: 4,
            font: "600 15px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.04em",
            cursor: pendingFibIndex !== null ? "pointer" : "default",
            transition: "background 0.15s",
          }}
        >
          Lock in the fib
        </button>

        <div
          style={{
            textAlign: "center",
            font: "500 15px/1 'Caveat', cursive",
            color: "#a39a87",
            marginTop: 12,
          }}
        >
          {hintText}
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────────────────
  const roundTotal = roundState.answerScore + roundState.fibScore;
  const { answerCorrect, fibCorrect, answerScore, fibScore } = roundState;

  const headline =
    answerCorrect && fibCorrect
      ? "Both right."
      : !answerCorrect && fibCorrect
        ? "Fib spotted."
        : answerCorrect && !fibCorrect
          ? "Half marks."
          : "Tomorrow's yours.";

  const headlineColor = answerCorrect && fibCorrect ? "#2f4a2e" : "#20201c";

  return (
    <div>
      {RoundTopicRow}

      {/* Compact reveal */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 0",
          borderTop: "1px solid #ddd2bd",
          borderBottom: "1px solid #ddd2bd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {answerCorrect && <CheckMark size={22} />}
          {!answerCorrect && (
            <span
              style={{
                font: "700 10px/1 'Hanken Grotesk', sans-serif",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#a39a87",
              }}
            >
              Answer
            </span>
          )}
          <div
            style={{
              font: "400 24px/1 'Libre Caslon Display', serif",
              color: "#20201c",
            }}
          >
            {roundData.answer}
          </div>
        </div>
        {answerCorrect && (
          <span
            style={{
              font: "600 17px/1 'Caveat', cursive",
              color: "#6f8a5f",
            }}
          >
            {solvedOrdinal} try
          </span>
        )}
      </div>

      {/* Fact list */}
      <div style={{ marginTop: 14 }}>
        <FactList
          facts={roundData.facts}
          mode="revealed"
          selectedIndex={roundState.fibGuess}
          correctIndex={roundData.fib_index}
          fibSubject={roundData.fib_true_subject}
        />
      </div>

      {/* Score section */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: "1.5px solid #20201c",
        }}
      >
        <div>
          <div
            style={{
              font: "400 25px/1 'Libre Caslon Display', serif",
              color: headlineColor,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              font: "italic 400 15px/1.3 'Newsreader', serif",
              color: "#8a8472",
              marginTop: 6,
            }}
          >
            Answer {answerScore}&nbsp;·&nbsp;Fib {fibScore}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              font: "800 46px/0.9 'Hanken Grotesk', sans-serif",
              color: roundTotal > 0 ? "#20201c" : "#b8b0a0",
            }}
          >
            {roundTotal > 0 ? `+${roundTotal}` : "0"}
          </div>
          {roundTotal > 0 && <ScoreUnderline />}
        </div>
      </div>

      <button
        onClick={onNext}
        style={{
          marginTop: 18,
          width: "100%",
          border: "none",
          background: "#20201c",
          color: "#f6f1e7",
          padding: 16,
          borderRadius: 4,
          font: "600 15px/1 'Hanken Grotesk', sans-serif",
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        {isLastRound ? "See results" : "Next round →"}
      </button>
    </div>
  );
}
