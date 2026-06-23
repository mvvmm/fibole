import { useState, useCallback } from "react";
import type { GameState, GamePhase, RoundState } from "@/types";
import { isAnswerMatch, scoreAnswer } from "@/lib/scoring";

const TOTAL_ROUNDS = 3;

function emptyRound(): RoundState {
  return {
    answerGuesses: [],
    answerPhaseComplete: false,
    answerCorrect: false,
    answerScore: 0,
    fibGuess: null,
    fibPhaseComplete: false,
    fibCorrect: null,
    fibScore: 0,
  };
}

function initialState(): GameState {
  return {
    currentRound: 0,
    phase: "answer",
    rounds: Array.from({ length: TOTAL_ROUNDS }, emptyRound),
    totalScore: 0,
    completedAt: null,
  };
}

function computeTotalScore(rounds: RoundState[]): number {
  return rounds.reduce((sum, r) => sum + r.answerScore + r.fibScore, 0);
}

export function useGameState(date: string) {
  const storageKey = `gameState_${date}`;

  const [state, setState] = useState<GameState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored) as GameState;
    } catch {}
    return initialState();
  });

  const save = useCallback(
    (next: GameState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      setState(next);
    },
    [storageKey],
  );

  const submitAnswer = useCallback(
    (guess: string, correctAnswer: string) => {
      const ri = state.currentRound;
      const round = { ...state.rounds[ri] };
      const newGuesses = [...round.answerGuesses, guess];
      const guessNumber = newGuesses.length;
      const correct = isAnswerMatch(guess, correctAnswer);
      const exhausted = newGuesses.length >= 3;
      const phaseComplete = correct || exhausted;

      round.answerGuesses = newGuesses;
      round.answerCorrect = correct;
      round.answerPhaseComplete = phaseComplete;
      round.answerScore = phaseComplete && correct ? scoreAnswer(guessNumber) : 0;

      const newRounds = [...state.rounds];
      newRounds[ri] = round;

      const nextPhase: GamePhase = phaseComplete ? "fib" : "answer";

      save({
        ...state,
        phase: nextPhase,
        rounds: newRounds,
        totalScore: computeTotalScore(newRounds),
      });

      return correct;
    },
    [state, save],
  );

  const submitFib = useCallback(
    (guessIndex: number, correctIndex: number) => {
      const ri = state.currentRound;
      const round = { ...state.rounds[ri] };
      const correct = guessIndex === correctIndex;

      round.fibGuess = guessIndex;
      round.fibPhaseComplete = true;
      round.fibCorrect = correct;
      round.fibScore = correct ? 1 : 0;

      const newRounds = [...state.rounds];
      newRounds[ri] = round;

      // Record the result but stay on this round so it can be displayed.
      // Call advanceRound() to proceed.
      save({
        ...state,
        rounds: newRounds,
        totalScore: computeTotalScore(newRounds),
      });
    },
    [state, save],
  );

  const advanceRound = useCallback(() => {
    const nextRound = state.currentRound + 1;
    const complete = nextRound >= TOTAL_ROUNDS;
    save({
      ...state,
      currentRound: complete ? state.currentRound : nextRound,
      phase: complete ? "complete" : "answer",
      completedAt: complete ? new Date().toISOString() : null,
    });
  }, [state, save]);

  const giveUp = useCallback(() => {
    const ri = state.currentRound;
    const round = { ...state.rounds[ri] };
    round.answerPhaseComplete = true;
    round.answerCorrect = false;
    round.answerScore = 0;
    const newRounds = [...state.rounds];
    newRounds[ri] = round;
    save({
      ...state,
      phase: "fib",
      rounds: newRounds,
      totalScore: computeTotalScore(newRounds),
    });
  }, [state, save]);

  return { state, submitAnswer, submitFib, advanceRound, giveUp };
}
