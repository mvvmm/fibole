import { describe, it, expect } from "vitest";
import { isNonArticleTitle, filterEligibleTitles, shuffle } from "./wikipedia";

// ─── isNonArticleTitle ────────────────────────────────────────────────────────

describe("isNonArticleTitle", () => {
  it("flags the main page", () => {
    expect(isNonArticleTitle("Main_Page")).toBe(true);
  });
  it.each([
    "Special:Random",
    "Wikipedia:About",
    "File:Foo.jpg",
    "Portal:Science",
    "Help:Editing",
    "Template:Infobox",
    "Talk:Dog",
    "User:Someone",
    "Category:Animals",
  ])("flags non-article prefix %s", (title) => {
    expect(isNonArticleTitle(title)).toBe(true);
  });
  it("does not flag an ordinary article", () => {
    expect(isNonArticleTitle("Theodore_Roosevelt")).toBe(false);
  });
});

// ─── filterEligibleTitles ─────────────────────────────────────────────────────

describe("filterEligibleTitles", () => {
  it("removes non-article titles", () => {
    const result = filterEligibleTitles(["Dog", "Category:Animals"], new Set());
    expect(result).toEqual(["Dog"]);
  });
  it("removes titles already used as an answer, matching underscores to spaces", () => {
    const result = filterEligibleTitles(
      ["Theodore_Roosevelt", "Dog"],
      new Set(["Theodore Roosevelt"]),
    );
    expect(result).toEqual(["Dog"]);
  });
  it("keeps everything when nothing is excluded", () => {
    const result = filterEligibleTitles(["Dog", "Cat"], new Set());
    expect(result).toEqual(["Dog", "Cat"]);
  });
});

// ─── shuffle ──────────────────────────────────────────────────────────────────

describe("shuffle", () => {
  it("preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });
  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});
