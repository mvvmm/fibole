export interface Round {
  round_number: number;
  topic: string;
  answer: string;
  facts: string[];
  fib_index: number;
  fib_true_subject: string;
}

export interface QuestionsData {
  date: string;
  rounds: Round[];
}

export interface RoundState {
  answerGuesses: string[];
  answerPhaseComplete: boolean;
  answerCorrect: boolean;
  answerScore: number;
  fibGuess: number | null;
  fibPhaseComplete: boolean;
  fibCorrect: boolean | null;
  fibScore: number;
}

export type GamePhase = "answer" | "fib" | "complete";

export interface GameState {
  currentRound: number;
  phase: GamePhase;
  rounds: RoundState[];
  totalScore: number;
  completedAt: string | null;
}
