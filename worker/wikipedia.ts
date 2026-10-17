// Wikipedia / Wikimedia API client used by the daily cron generator.
// Ports .claude/skills/generate-questions.md's Steps 2-4 fetch calls into code.

const USER_AGENT = "Fibole/1.0 (https://fibole.com; contact: root.mvm@gmail.com)";

const NON_ARTICLE_PREFIXES = [
  "Special:",
  "Wikipedia:",
  "File:",
  "Portal:",
  "Help:",
  "Template:",
  "Talk:",
  "User:",
  "Category:",
];

// ─── Pure filters ─────────────────────────────────────────────────────────────

/** True for the main page or any non-article-namespace title. */
export function isNonArticleTitle(title: string): boolean {
  if (title === "Main_Page" || title === "Main Page") return true;
  return NON_ARTICLE_PREFIXES.some((prefix) => title.startsWith(prefix));
}

/** Removes non-article titles and anything already used as a main answer. */
export function filterEligibleTitles(titles: string[], usedAnswers: ReadonlySet<string>): string[] {
  return titles.filter(
    (title) => !isNonArticleTitle(title) && !usedAnswers.has(title.replace(/_/g, " ")),
  );
}

/** Fisher-Yates shuffle, returns a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Live fetches ─────────────────────────────────────────────────────────────

export interface TrendingArticle {
  title: string;
  rank: number;
}

/** One client per generation run; its budget includes redirect hops. */
export class WikipediaClient {
  private requests = 0;

  constructor(private readonly maxRequests = Infinity) {}

  private async request(initialUrl: string): Promise<unknown | null> {
    let url = initialUrl;
    for (let redirects = 0; redirects <= 5; redirects++) {
      if (this.requests >= this.maxRequests) {
        throw new Error(`Wikipedia request budget exhausted (${this.maxRequests})`);
      }
      this.requests++;
      let res: Response;
      try {
        res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          redirect: "manual",
        });
      } catch (cause) {
        throw new Error(`Wikipedia request failed for ${url}: ${String(cause)}`, { cause });
      }
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("Location");
        await res.body?.cancel();
        if (!location) throw new Error(`Wikipedia redirect without Location for ${url}`);
        url = new URL(location, url).href;
        continue;
      }
      // A missing article or unavailable pageview dataset is an ordinary miss.
      // Transport errors and rate limits must reach the cron's failure logs.
      if (res.status === 404) {
        await res.body?.cancel();
        return null;
      }
      if (!res.ok) {
        await res.body?.cancel();
        throw new Error(`Wikipedia HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    }
    throw new Error(`Too many Wikipedia redirects for ${initialUrl}`);
  }

  /** Yesterday's (or any given date's) top Wikipedia pageviews, rank-ordered. */
  async fetchTrendingTop(dateISO: string): Promise<TrendingArticle[]> {
    const [year, month, day] = dateISO.split("-");
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${year}/${month}/${day}`;
    const data = (await this.request(url)) as {
      items?: { articles?: { article: string; rank: number }[] }[];
    } | null;
    const articles = data?.items?.[0]?.articles ?? [];
    return articles.map((a) => ({ title: a.article, rank: a.rank }));
  }

  /** Up to `limit` direct article titles in a category (namespace 0, type page). */
  async fetchCategoryMembers(category: string, limit = 500): Promise<string[]> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=${limit}&cmnamespace=0&cmtype=page&format=json`;
    const data = (await this.request(url)) as {
      query?: { categorymembers?: { title: string }[] };
    } | null;
    return (data?.query?.categorymembers ?? []).map((m) => m.title);
  }

  /** Up to `limit` subcategories of a category (namespace 14, type subcat). */
  async fetchSubcategories(category: string, limit = 50): Promise<string[]> {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=${limit}&cmnamespace=14&cmtype=subcat&format=json`;
    const data = (await this.request(url)) as {
      query?: { categorymembers?: { title: string }[] };
    } | null;
    return (data?.query?.categorymembers ?? []).map((m) => m.title);
  }

  /**
   * Average monthly pageviews over a rolling window of `months` ending at the
   * last fully-complete month before `referenceDateISO` (defaults to now).
   */
  async fetchAveragePageviews(
    title: string,
    months = 5,
    referenceDateISO = todayISO(),
  ): Promise<number> {
    const [refYear, refMonth] = referenceDateISO.split("-").map(Number);
    // Last complete month is the one before the reference date's month.
    const endMonthDate = new Date(Date.UTC(refYear, refMonth - 1, 1));
    endMonthDate.setUTCMonth(endMonthDate.getUTCMonth() - 1);
    const startMonthDate = new Date(endMonthDate);
    startMonthDate.setUTCMonth(startMonthDate.getUTCMonth() - (months - 1));

    const start = `${yyyymm(startMonthDate)}01`;
    const end = `${yyyymm(endMonthDate)}01`;
    const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${encodedTitle}/monthly/${start}/${end}`;
    const data = (await this.request(url)) as { items?: { views: number }[] } | null;
    const items = data?.items ?? [];
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.views, 0) / items.length;
  }

  /** Plaintext extract for an article, truncated to `maxChars`. Null for a missing/empty article; throws on request failure. */
  async fetchExtract(title: string, maxChars = 15_000): Promise<string | null> {
    const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodedTitle}&format=json&formatversion=2&explaintext=true`;
    const data = (await this.request(url)) as { query?: { pages?: { extract?: string }[] } } | null;
    const extract = data?.query?.pages?.[0]?.extract;
    if (!extract) return null;
    return extract.length > maxChars ? extract.slice(0, maxChars) : extract;
  }
}

function yyyymm(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
