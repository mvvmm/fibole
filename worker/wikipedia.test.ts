import { afterEach, describe, it, expect, vi } from "vitest";
import { isNonArticleTitle, filterEligibleTitles, shuffle, WikipediaClient } from "./wikipedia";

afterEach(() => vi.unstubAllGlobals());

describe("WikipediaClient", () => {
  it("shares its request budget across API methods and concurrent extracts", async () => {
    const fetch = vi.fn().mockImplementation(async () => Response.json({}));
    vi.stubGlobal("fetch", fetch);
    const client = new WikipediaClient(3);
    await client.fetchTrendingTop("2026-10-16");
    await client.fetchCategoryMembers("Category:Test");
    const extracts = await Promise.allSettled([
      client.fetchExtract("Main"),
      client.fetchExtract("Donor"),
    ]);
    expect(extracts[1]).toMatchObject({ status: "rejected" });
    expect(fetch).toHaveBeenCalledTimes(3);
    await expect(client.fetchSubcategories("Category:Test")).rejects.toThrow("budget exhausted");
    expect(fetch).toHaveBeenCalledTimes(3);
    // A subsequent invocation gets an independent budget.
    await new WikipediaClient(3).fetchAveragePageviews("Main");
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("counts redirect hops before making another request", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(
        async () => new Response(null, { status: 302, headers: { Location: "/redirect" } }),
      );
    vi.stubGlobal("fetch", fetch);
    await expect(new WikipediaClient(2).fetchExtract("Main")).rejects.toThrow(
      "budget exhausted (2)",
    );
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ redirect: "manual" }),
    );
  });

  it("preserves the platform exception instead of treating it as an empty category", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Too many subrequests.")));
    await expect(new WikipediaClient().fetchCategoryMembers("Category:Test")).rejects.toThrow(
      "Too many subrequests.",
    );
  });

  it.each([429, 500])("reports HTTP %s as a failure", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status })));
    await expect(new WikipediaClient().fetchAveragePageviews("Main")).rejects.toThrow(
      `HTTP ${status}`,
    );
  });

  it("still treats a 404 dataset or article as an ordinary miss", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => new Response(null, { status: 404 })),
    );
    const client = new WikipediaClient();
    expect(await client.fetchTrendingTop("2026-10-16")).toEqual([]);
    expect(await client.fetchAveragePageviews("Main")).toBe(0);
    expect(await client.fetchExtract("Main")).toBeNull();
  });
});

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
