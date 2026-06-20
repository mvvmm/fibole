export function scoreAnswer(guessNumber: number): number {
  // guessNumber is 1-indexed: 1st guess = 3pts, 2nd = 2pts, 3rd = 1pt
  return Math.max(4 - guessNumber, 0);
}

export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

export function isAnswerMatch(guess: string, answer: string): boolean {
  return normalizeAnswer(guess) === normalizeAnswer(answer);
}

export function maxScore(rounds: number): number {
  return rounds * 4;
}
