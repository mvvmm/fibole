export interface Round {
  round_number: number;
  topic: string;
  answer: string;
  facts: string[];
  fake_fact_index: number;
  fake_fact_true_subject: string;
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
  fakeFactGuess: number | null;
  fakeFactPhaseComplete: boolean;
  fakeFactCorrect: boolean | null;
  fakeFactScore: number;
}

export type GamePhase = "answer" | "fake-fact" | "complete";

export interface GameState {
  currentRound: number;
  phase: GamePhase;
  rounds: RoundState[];
  totalScore: number;
  completedAt: string | null;
}
