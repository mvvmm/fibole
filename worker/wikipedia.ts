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

async function wikiFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface TrendingArticle {
  title: string;
  rank: number;
}

/** Yesterday's (or any given date's) top Wikipedia pageviews, rank-ordered. */
export async function fetchTrendingTop(dateISO: string): Promise<TrendingArticle[]> {
  const [year, month, day] = dateISO.split("-");
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${year}/${month}/${day}`;
  const data = (await wikiFetch(url)) as {
    items?: { articles?: { article: string; rank: number }[] }[];
  } | null;
  const articles = data?.items?.[0]?.articles ?? [];
  return articles.map((a) => ({ title: a.article, rank: a.rank }));
}

/** Up to `limit` direct article titles in a category (namespace 0, type page). */
export async function fetchCategoryMembers(category: string, limit = 500): Promise<string[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=${limit}&cmnamespace=0&cmtype=page&format=json`;
  const data = (await wikiFetch(url)) as {
    query?: { categorymembers?: { title: string }[] };
  } | null;
  return (data?.query?.categorymembers ?? []).map((m) => m.title);
}

/** Up to `limit` subcategories of a category (namespace 14, type subcat). */
export async function fetchSubcategories(category: string, limit = 50): Promise<string[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=${limit}&cmnamespace=14&cmtype=subcat&format=json`;
  const data = (await wikiFetch(url)) as {
    query?: { categorymembers?: { title: string }[] };
  } | null;
  return (data?.query?.categorymembers ?? []).map((m) => m.title);
}

/**
 * Average monthly pageviews over a rolling window of `months` ending at the
 * last fully-complete month before `referenceDateISO` (defaults to now).
 */
export async function fetchAveragePageviews(
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
  const data = (await wikiFetch(url)) as { items?: { views: number }[] } | null;
  const items = data?.items ?? [];
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.views, 0) / items.length;
}

/** Plaintext extract for an article, truncated to `maxChars`. Null on failure/empty. */
export async function fetchExtract(title: string, maxChars = 15_000): Promise<string | null> {
  const encodedTitle = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodedTitle}&format=json&formatversion=2&explaintext=true`;
  const data = (await wikiFetch(url)) as { query?: { pages?: { extract?: string }[] } } | null;
  const extract = data?.query?.pages?.[0]?.extract;
  if (!extract) return null;
  return extract.length > maxChars ? extract.slice(0, maxChars) : extract;
}

function yyyymm(d: Date): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
