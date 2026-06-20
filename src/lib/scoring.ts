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

// Words too generic to count as meaningful single-token matches.
const TOKEN_STOPWORDS = new Set([
  "city",
  "the",
  "new",
  "old",
  "great",
  "king",
  "lake",
  "cape",
  "fort",
  "port",
  "saint",
  "san",
  "von",
  "van",
  "tower",
  "and",
  "for",
]);

const TOKEN_MIN_LENGTH = 4;

function tokenize(s: string): string[] {
  return s.split(" ").filter((t) => t.length > 0);
}

function isSig(t: string): boolean {
  return t.length >= TOKEN_MIN_LENGTH && !TOKEN_STOPWORDS.has(t);
}

// Optimal String Alignment distance — like Levenshtein but counts transpositions
// ("ie"↔"ei") as a single edit, which is common in real misspellings.
function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[m][n];
}

function fuzzyMatch(a: string, b: string): boolean {
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  const minLen = Math.min(a.length, b.length);
  if (maxLen === 0) return true;
  if (minLen <= 5) return dist <= 1;
  return 1 - dist / maxLen >= 0.82;
}

export function isAnswerMatch(guess: string, answer: string): boolean {
  const normGuess = normalizeAnswer(guess);
  const normAnswer = normalizeAnswer(answer);

  if (normGuess === normAnswer) return true;
  if (normGuess.length === 0) return false;

  const gTokens = tokenize(normGuess);
  const aTokens = tokenize(normAnswer);
  const sigATokens = aTokens.filter(isSig);
  const aSet = new Set(aTokens);

  // Skip token strategies when the answer is a single word but the guess has
  // multiple significant tokens — prevents "France Germany" matching "France".
  const skipTokenStrategies =
    sigATokens.length === 1 && aTokens.length === 1 && gTokens.filter(isSig).length > 1;

  if (!skipTokenStrategies) {
    // Strategy A: any significant guess token exactly in the answer.
    for (const t of gTokens) {
      if (isSig(t) && aSet.has(t)) return true;
    }
    // Strategy A.5: per-token fuzzy — handles "Roosvelt" → "Roosevelt".
    for (const gt of gTokens) {
      if (!isSig(gt)) continue;
      for (const at of sigATokens) {
        if (fuzzyMatch(gt, at)) return true;
      }
    }
  }

  // Strategy B: full-string fuzzy for single-word typos.
  return fuzzyMatch(normGuess, normAnswer);
}

export function maxScore(rounds: number): number {
  return rounds * 4;
}
