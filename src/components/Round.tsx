import type { Round as RoundData, RoundState } from "@/types";
import { FactList } from "./FactList";
import { AnswerInput } from "./AnswerInput";

const MAX_GUESSES = 3;

interface RoundProps {
  roundData: RoundData;
  roundState: RoundState;
  roundNumber: number;
  totalRounds: number;
  phase: "answer" | "fake-fact";
  onSubmitAnswer: (guess: string) => void;
  onSubmitFakeFact: (index: number) => void;
  onNext: () => void;
}

export function Round({
  roundData,
  roundState,
  roundNumber,
  totalRounds,
  phase,
  onSubmitAnswer,
  onSubmitFakeFact,
  onNext,
}: RoundProps) {
  const showResult = roundState.fakeFactPhaseComplete;
  const inFakeFactSelection = phase === "fake-fact" && !showResult;

  const lastGuessWrong =
    roundState.answerGuesses.length > 0 &&
    !roundState.answerCorrect &&
    !roundState.answerPhaseComplete;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Round {roundNumber} of {totalRounds}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {roundData.topic}
        </span>
      </div>

      {/* Answer reveal — shown once the answer phase is done */}
      {roundState.answerPhaseComplete && (
        <div
          className={`rounded-lg px-4 py-3 text-center text-sm font-semibold ${roundState.answerCorrect ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}
        >
          {roundState.answerCorrect
            ? `✓ ${roundData.answer}`
            : `The answer was: ${roundData.answer}`}
        </div>
      )}

      {/* Instructions */}
      {!showResult && (
        <p className="text-sm text-slate-500 text-center">
          {phase === "answer"
            ? "4 of these facts are true. 1 is fake. Who or what do the 4 true facts describe?"
            : "Now tap the fact you think is fake."}
        </p>
      )}

      {/* Facts */}
      <FactList
        facts={roundData.facts}
        mode={showResult ? "revealed" : inFakeFactSelection ? "selecting" : "reading"}
        selectedIndex={roundState.fakeFactGuess}
        correctIndex={roundData.fake_fact_index}
        onSelect={inFakeFactSelection ? onSubmitFakeFact : undefined}
      />

      {/* Answer input */}
      {phase === "answer" && !roundState.answerPhaseComplete && (
        <AnswerInput
          onSubmit={onSubmitAnswer}
          guessCount={roundState.answerGuesses.length}
          maxGuesses={MAX_GUESSES}
          disabled={roundState.answerGuesses.length >= MAX_GUESSES}
          lastGuessWrong={lastGuessWrong}
        />
      )}

      {/* Fake-fact hint */}
      {inFakeFactSelection && (
        <p className="text-xs text-slate-400 text-center">
          You have 1 chance to identify the fake fact.
        </p>
      )}

      {/* Round result */}
      {showResult && (
        <RoundResult
          roundData={roundData}
          roundState={roundState}
          isLastRound={roundNumber === totalRounds}
          onNext={onNext}
        />
      )}
    </div>
  );
}

function RoundResult({
  roundData,
  roundState,
  isLastRound,
  onNext,
}: {
  roundData: RoundData;
  roundState: RoundState;
  isLastRound: boolean;
  onNext: () => void;
}) {
  const roundTotal = roundState.answerScore + roundState.fakeFactScore;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-medium">
            {roundState.answerCorrect ? (
              <span className="text-green-600">✓ {roundData.answer}</span>
            ) : (
              <span className="text-slate-500">Answer: {roundData.answer}</span>
            )}
          </p>
          <p className="text-sm font-medium">
            {roundState.fakeFactCorrect ? (
              <span className="text-green-600">✓ Fake fact identified!</span>
            ) : (
              <span className="text-slate-500">Fake was fact #{roundData.fake_fact_index + 1}</span>
            )}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            That fact is actually true of:{" "}
            <span className="font-medium">{roundData.fake_fact_true_subject}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-3xl font-bold text-slate-900">{roundTotal}</p>
          <p className="text-xs text-slate-400">pts</p>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-slate-400">
        <span>Answer: {roundState.answerScore}pts</span>
        <span>·</span>
        <span>Fake fact: {roundState.fakeFactScore}pt</span>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
      >
        {isLastRound ? "See Final Score →" : "Next Round →"}
      </button>
    </div>
  );
}
