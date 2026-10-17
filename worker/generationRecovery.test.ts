import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AiClient, DbClient } from "./clients";
import { runTopUp } from "./generateCore";
import { WikipediaClient } from "./wikipedia";

interface SavedRound {
  date: string;
  round_number: number;
  topic: string;
  answer: string;
}

function database() {
  const rows: SavedRound[] = [];
  const query: DbClient["query"] = async <T>(
    sql: string,
    params: (string | number | null)[] = [],
  ) => {
    let changes = 0;
    let results: SavedRound[] = [];
    if (sql.startsWith("SELECT")) {
      results = sql.includes("WHERE date = ?") ? rows.filter((r) => r.date === params[0]) : rows;
    } else if (sql.includes("INSERT")) {
      const [date, round, topic, answer] = params;
      if (!rows.some((r) => r.date === date && r.round_number === round)) {
        rows.push({
          date: String(date),
          round_number: Number(round),
          topic: String(topic),
          answer: String(answer),
        });
        changes = 1;
      }
    }
    return { results: results as T[], changes };
  };
  return { query, rows };
}

function ai(): AiClient {
  return {
    run: vi.fn().mockResolvedValue({
      tool_calls: [
        {
          name: "submit_round",
          arguments: {
            facts: [
              "This subject achieved a remarkable milestone in 1945.",
              "This subject received an international award in 1960.",
              "This subject established a new organization in 1970.",
              "This subject was recognized for a discovery in 1980.",
            ],
            fib_index: 3,
            fib_true_subject: "Donor",
          },
        },
      ],
    }),
  };
}

function successfulWikipedia() {
  return vi.fn().mockImplementation(async (input: string) => {
    const url = new URL(input);
    if (url.searchParams.get("prop") === "extracts") {
      return Response.json({
        query: { pages: [{ extract: "A sufficiently detailed Wikipedia extract." }] },
      });
    }
    if (url.searchParams.get("list") === "categorymembers") {
      const category = url.searchParams.get("cmtitle");
      return Response.json({
        query: {
          categorymembers: Array.from({ length: 20 }, (_, i) => ({
            title: `${category} subject ${i}`.replace("Category:", ""),
          })),
        },
      });
    }
    if (url.pathname.includes("/top/")) {
      return Response.json({
        items: [
          {
            articles: [
              { article: "Trending_A", rank: 1 },
              { article: "Trending_B", rank: 2 },
            ],
          },
        ],
      });
    }
    return Response.json({ items: [{ views: 100_000 }] });
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-19T12:00:00Z"));
  // Keep category order stable so duplicate-category regressions are observable.
  vi.spyOn(Math, "random").mockReturnValue(0.99999);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("generation recovery", () => {
  it("uses a recent trending dataset when yesterday's aggregate is not published yet", async () => {
    const successful = successfulWikipedia();
    const fetch = vi.fn().mockImplementation(async (input: string) => {
      if (input.includes("/top/") && input.endsWith("2026/10/18")) {
        return new Response(null, { status: 404 });
      }
      return successful(input);
    });
    vi.stubGlobal("fetch", fetch);
    const db = database();
    await runTopUp(db, ai(), { maxRounds: 1, wikipedia: new WikipediaClient(40) });
    expect(db.rows).toHaveLength(1);
    expect(db.rows[0].topic).toBe("Trending");
    expect(fetch.mock.calls.map(([url]) => url).filter((url) => url.includes("/top/"))).toEqual([
      expect.stringContaining("2026/10/18"),
      expect.stringContaining("2026/10/17"),
    ]);
  });

  it("stops a recursive category search before the Free plan limit and reports failure", async () => {
    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
    const fetch = vi.fn().mockImplementation(async (input: string) => {
      const subcategories = new URL(input).searchParams.get("cmtype") === "subcat";
      return Response.json({
        query: {
          categorymembers: subcategories
            ? Array.from({ length: 4 }, (_, i) => ({ title: `Category:Subcategory ${i}` }))
            : [],
        },
      });
    });
    vi.stubGlobal("fetch", fetch);
    const db = database();
    const model = ai();
    await expect(
      runTopUp(db, model, { maxRounds: 1, wikipedia: new WikipediaClient(40) }),
    ).rejects.toThrow("Question generation failed");
    expect(fetch).toHaveBeenCalledTimes(40);
    expect(model.run).not.toHaveBeenCalled();
    expect(db.rows).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Wikipedia request budget exhausted (40)"),
    );

    // The next invocation retries the same slot with a fresh budget and can save it.
    vi.stubGlobal("fetch", successfulWikipedia());
    await runTopUp(db, model, { maxRounds: 1, wikipedia: new WikipediaClient(40) });
    expect(db.rows).toHaveLength(1);
    expect(db.rows[0]).toMatchObject({ date: "2026-10-17", round_number: 1 });
  });

  it("fills missing rounds across invocations, preserves category variety, then stops at the horizon", async () => {
    vi.stubGlobal("fetch", successfulWikipedia());
    const db = database();
    const model = ai();
    for (let i = 1; i <= 3; i++) {
      await runTopUp(db, model, {
        horizonDays: 0,
        maxRounds: 1,
        wikipedia: new WikipediaClient(40),
      });
      expect(db.rows).toHaveLength(i);
    }
    expect(db.rows.map((r) => r.round_number)).toEqual([1, 2, 3]);
    expect(new Set(db.rows.map((r) => r.topic)).size).toBe(3);
    const fetchCount = vi.mocked(fetch).mock.calls.length;
    await runTopUp(db, model, { horizonDays: 0, maxRounds: 1, wikipedia: new WikipediaClient(40) });
    expect(vi.mocked(fetch).mock.calls).toHaveLength(fetchCount);
    expect(model.run).toHaveBeenCalledTimes(3);
  });

  it("keeps the CLI default of filling all missing rounds for one date", async () => {
    vi.stubGlobal("fetch", successfulWikipedia());
    const db = database();
    await runTopUp(db, ai(), { horizonDays: 0 });
    expect(db.rows.map((r) => r.round_number)).toEqual([1, 2, 3]);
  });
});
