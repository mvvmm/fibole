import { useEffect, useRef } from "react";
import type { QuestionsData } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { Round } from "./Round";
import { ShareCard } from "./ShareCard";

interface GameProps {
  data: QuestionsData;
}

export function Game({ data }: GameProps) {
  const { state, submitAnswer, submitFib, advanceRound, giveUp } = useGameState(data.date);

  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (prevPhaseRef.current === "answer" && state.phase === "fib") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

  if (state.phase === "complete") {
    return <ShareCard gameState={state} rounds={data.rounds} date={data.date} />;
  }

  const currentRoundData = data.rounds[state.currentRound];
  const currentRoundState = state.rounds[state.currentRound];

  if (!currentRoundData || !currentRoundState) return null;

  return (
    <Round
      key={state.currentRound}
      roundData={currentRoundData}
      roundState={currentRoundState}
      roundNumber={state.currentRound + 1}
      totalRounds={data.rounds.length}
      phase={state.phase}
      onSubmitAnswer={(guess) => submitAnswer(guess, currentRoundData.answer)}
      onSubmitFib={(index) => submitFib(index, currentRoundData.fib_index)}
      onNext={advanceRound}
      onGiveUp={giveUp}
    />
  );
}
