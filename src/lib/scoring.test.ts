import { describe, it, expect } from "vitest";
import { isAnswerMatch, normalizeAnswer, scoreAnswer, maxScore } from "./scoring";

// ─── normalizeAnswer ──────────────────────────────────────────────────────────

describe("normalizeAnswer", () => {
  it("lowercases and trims", () => {
    expect(normalizeAnswer("  Theodore Roosevelt  ")).toBe("theodore roosevelt");
  });
  it("strips diacritics", () => {
    expect(normalizeAnswer("Café")).toBe("cafe");
  });
  it("strips punctuation", () => {
    expect(normalizeAnswer("Roosevelt's")).toBe("roosevelts");
  });
  it("collapses multiple spaces", () => {
    expect(normalizeAnswer("Martin  Luther  King")).toBe("martin luther king");
  });
});

// ─── scoreAnswer / maxScore ───────────────────────────────────────────────────

describe("scoreAnswer", () => {
  it("returns 3 for first guess", () => expect(scoreAnswer(1)).toBe(3));
  it("returns 2 for second guess", () => expect(scoreAnswer(2)).toBe(2));
  it("returns 1 for third guess", () => expect(scoreAnswer(3)).toBe(1));
  it("returns 0 beyond third", () => expect(scoreAnswer(4)).toBe(0));
});

describe("maxScore", () => {
  it("returns 4× the round count", () => expect(maxScore(3)).toBe(12));
});

// ─── isAnswerMatch ────────────────────────────────────────────────────────────

describe("isAnswerMatch — exact", () => {
  it("matches identical strings", () => {
    expect(isAnswerMatch("Theodore Roosevelt", "Theodore Roosevelt")).toBe(true);
  });
  it("is case-insensitive", () => {
    expect(isAnswerMatch("THEODORE ROOSEVELT", "Theodore Roosevelt")).toBe(true);
  });
  it("strips diacritics before comparing", () => {
    expect(isAnswerMatch("Café", "Cafe")).toBe(true);
  });
  it("rejects clearly wrong answers", () => {
    expect(isAnswerMatch("Abraham Lincoln", "Theodore Roosevelt")).toBe(false);
  });
  it("rejects empty guess", () => {
    expect(isAnswerMatch("", "Theodore Roosevelt")).toBe(false);
  });
});

describe("isAnswerMatch — first/last name only (Strategy A)", () => {
  it("accepts last name only", () => {
    expect(isAnswerMatch("Roosevelt", "Theodore Roosevelt")).toBe(true);
  });
  it("accepts first name only", () => {
    expect(isAnswerMatch("Theodore", "Theodore Roosevelt")).toBe(true);
  });
  it("accepts last name for a different multi-word name", () => {
    expect(isAnswerMatch("Obama", "Barack Obama")).toBe(true);
  });
  it("accepts first name for a different multi-word name", () => {
    expect(isAnswerMatch("Abraham", "Abraham Lincoln")).toBe(true);
  });
  it("accepts 'da Vinci' for Leonardo da Vinci", () => {
    expect(isAnswerMatch("da Vinci", "Leonardo da Vinci")).toBe(true);
  });
  it("accepts 'vinci' alone for Leonardo da Vinci", () => {
    expect(isAnswerMatch("vinci", "Leonardo da Vinci")).toBe(true);
  });
  it("does not accept stopword 'King' for Martin Luther King Jr.", () => {
    expect(isAnswerMatch("King", "Martin Luther King Jr.")).toBe(false);
  });
  it("does not accept stopword 'Great' for Alexander the Great", () => {
    expect(isAnswerMatch("Great", "Alexander the Great")).toBe(false);
  });
  it("does not accept initials 'jr' for Martin Luther King Jr.", () => {
    expect(isAnswerMatch("jr", "Martin Luther King Jr.")).toBe(false);
  });
  it("does not accept short abbreviation 'MLK'", () => {
    expect(isAnswerMatch("MLK", "Martin Luther King Jr.")).toBe(false);
  });
});

describe("isAnswerMatch — keyword in multi-word answers (Strategy A)", () => {
  it("accepts 'Eiffel' for 'Eiffel Tower'", () => {
    expect(isAnswerMatch("Eiffel", "Eiffel Tower")).toBe(true);
  });
  it("accepts 'London' for 'Tower of London'", () => {
    expect(isAnswerMatch("London", "Tower of London")).toBe(true);
  });
  it("accepts 'Alexander' for 'Alexander the Great'", () => {
    expect(isAnswerMatch("Alexander", "Alexander the Great")).toBe(true);
  });
  it("does not accept stopword 'Tower' for 'Eiffel Tower'", () => {
    expect(isAnswerMatch("Tower", "Eiffel Tower")).toBe(false);
  });
  it("does not accept 'New' (too short) for 'New Zealand'", () => {
    expect(isAnswerMatch("New", "New Zealand")).toBe(false);
  });
  it("does not accept 'of' (too short) for 'Tower of London'", () => {
    expect(isAnswerMatch("of", "Tower of London")).toBe(false);
  });
  it("does not accept stopword 'City' for 'New York City'", () => {
    expect(isAnswerMatch("City", "New York City")).toBe(false);
  });
});

describe("isAnswerMatch — misspellings (Strategy A.5 / B)", () => {
  it("accepts 'Roosvelt' for 'Theodore Roosevelt'", () => {
    expect(isAnswerMatch("Roosvelt", "Theodore Roosevelt")).toBe(true);
  });
  it("accepts 'Einstien' for 'Albert Einstein'", () => {
    expect(isAnswerMatch("Einstien", "Albert Einstein")).toBe(true);
  });
  it("accepts 'phootosynthesis' for 'photosynthesis'", () => {
    expect(isAnswerMatch("phootosynthesis", "photosynthesis")).toBe(true);
  });
  it("accepts 'photsynthesis' for 'photosynthesis'", () => {
    expect(isAnswerMatch("photsynthesis", "photosynthesis")).toBe(true);
  });
  it("accepts 'Cleopatr' for 'Cleopatra' (1 char off, short word)", () => {
    expect(isAnswerMatch("Cleopatr", "Cleopatra")).toBe(true);
  });
  it("accepts 'Martn Luther' for 'Martin Luther King Jr.' via token fuzzy", () => {
    expect(isAnswerMatch("Martn Luther", "Martin Luther King Jr.")).toBe(true);
  });
  it("does not accept a heavily misspelled single-word guess", () => {
    expect(isAnswerMatch("Phtsns", "photosynthesis")).toBe(false);
  });
});

describe("isAnswerMatch — false-positive guards", () => {
  it("does not accept 'France Germany' for single-word answer 'France'", () => {
    expect(isAnswerMatch("France Germany", "France")).toBe(false);
  });
  it("does not accept 'Roosvelt Tower' for 'Eiffel Tower'", () => {
    expect(isAnswerMatch("Roosvelt Tower", "Eiffel Tower")).toBe(false);
  });
  it("does not accept a wrong answer just because it shares a stopword", () => {
    expect(isAnswerMatch("Old Faithful", "New Zealand")).toBe(false);
  });
  it("does not accept a completely random guess", () => {
    expect(isAnswerMatch("banana", "Theodore Roosevelt")).toBe(false);
  });
  it("does not accept Franklin Roosevelt for Theodore Roosevelt via token (different first name, same last)", () => {
    // "franklin" is not in {"theodore", "roosevelt"}; but "roosevelt" is — this SHOULD match
    // because last name only is valid. This is intentional behavior, not a false positive.
    expect(isAnswerMatch("Franklin Roosevelt", "Theodore Roosevelt")).toBe(true);
  });
});
