// Ports .claude/skills/generate-questions.md's Step 2 (trending round) and
// Step 3 (category round, including the container-category fallback) into
// code, wiring together wikipedia.ts (fetches) and difficulty.ts (banding).

import { CATEGORIES, type Category } from "../scripts/categories";
import {
  fetchTrendingTop,
  fetchCategoryMembers,
  fetchSubcategories,
  fetchAveragePageviews,
  filterEligibleTitles,
  shuffle,
} from "./wikipedia";
import {
  classifyByRank,
  classifyByViews,
  nearestAvailableBand,
  type Difficulty,
} from "./difficulty";

const MIN_CONTAINER_MEMBERS = 20;
const MAX_PAGEVIEW_CHECKS = 10;
const MAX_CATEGORY_ATTEMPTS = 8;
const MAX_CONTAINER_RECURSION_DEPTH = 2;

export interface SelectedEntity {
  /** Wikipedia title as returned by the API (underscores, e.g. "Theodore_Roosevelt"). */
  title: string;
  /** Display form with spaces, used as the D1 `answer` / donor display name. */
  displayName: string;
}

export interface EntitySelectionResult {
  main: SelectedEntity;
  donor: SelectedEntity;
  topic: string;
  entityType: string;
  actualDifficulty: Difficulty;
}

function toDisplayName(title: string): string {
  return title.replace(/_/g, " ");
}

// ─── Step 2: trending round ───────────────────────────────────────────────────

export async function selectTrendingEntity(
  usedAnswers: ReadonlySet<string>,
  targetDifficulty: Difficulty,
  yesterdayISO: string,
): Promise<EntitySelectionResult | null> {
  const trending = await fetchTrendingTop(yesterdayISO);
  if (trending.length === 0) return null;

  const eligible = filterEligibleTitles(
    trending.map((a) => a.title),
    usedAnswers,
  );
  if (eligible.length === 0) return null;

  const rankByTitle = new Map(trending.map((a) => [a.title, a.rank]));
  const pools: Record<Difficulty, string[]> = { easy: [], medium: [], hard: [] };
  for (const title of eligible) {
    pools[classifyByRank(rankByTitle.get(title)!)].push(title);
  }

  const band = nearestAvailableBand(targetDifficulty, pools);
  if (!band) return null;

  const mainTitle = shuffle(pools[band])[0];
  const donorPool = shuffle(eligible.filter((t) => t !== mainTitle));
  if (donorPool.length === 0) return null;

  return {
    main: { title: mainTitle, displayName: toDisplayName(mainTitle) },
    donor: { title: donorPool[0], displayName: toDisplayName(donorPool[0]) },
    topic: "Trending",
    entityType: "subject",
    actualDifficulty: classifyByRank(rankByTitle.get(mainTitle)!),
  };
}

// ─── Step 3: category round ───────────────────────────────────────────────────

/**
 * `excludeCategoryNames` keeps the 2 category rounds within one day distinct;
 * cross-day variety relies on the ~180-entry category list plus randomization
 * rather than tracked rotation state (a deliberate v1 simplification).
 */
export async function selectCategoryEntity(
  usedAnswers: ReadonlySet<string>,
  targetDifficulty: Difficulty,
  excludeCategoryNames: ReadonlySet<string> = new Set(),
): Promise<EntitySelectionResult | null> {
  const candidates = shuffle(CATEGORIES.filter((c) => !excludeCategoryNames.has(c.name)));
  const attempts = Math.min(MAX_CATEGORY_ATTEMPTS, candidates.length);

  for (let i = 0; i < attempts; i++) {
    const result = await tryCategory(candidates[i], usedAnswers, targetDifficulty);
    if (result) return result;
  }
  return null;
}

async function tryCategory(
  category: Category,
  usedAnswers: ReadonlySet<string>,
  targetDifficulty: Difficulty,
): Promise<EntitySelectionResult | null> {
  let members = await fetchCategoryMembers(category.wikipediaCategory);

  // Container-category fallback (skill Step 3a1): thin direct membership means
  // this category sorts articles into subcategories instead of holding them.
  if (members.length < MIN_CONTAINER_MEMBERS) {
    members = await expandContainerCategory(category.wikipediaCategory, 1);
  }
  if (members.length === 0) return null;

  const eligible = shuffle(filterEligibleTitles(members, usedAnswers));
  if (eligible.length === 0) return null;

  const checkCount = Math.min(MAX_PAGEVIEW_CHECKS, eligible.length);
  let closest: { title: string; distance: number; difficulty: Difficulty } | null = null;

  for (let i = 0; i < checkCount; i++) {
    const title = eligible[i];
    const views = await fetchAveragePageviews(title);

    // The category's view floor is a pre-filter guard — deliberately ignored
    // when targeting "hard", since the goal there is a genuinely low-view entity.
    if (
      targetDifficulty !== "hard" &&
      category.minMonthlyViews !== undefined &&
      views < category.minMonthlyViews
    ) {
      continue;
    }

    const actual = classifyByViews(views);
    if (actual === targetDifficulty) {
      return buildCategoryResult(category, title, eligible, actual);
    }

    const distance = distanceToBand(views, targetDifficulty);
    if (!closest || distance < closest.distance) {
      closest = { title, distance, difficulty: actual };
    }
  }

  if (!closest) return null;
  return buildCategoryResult(category, closest.title, eligible, closest.difficulty);
}

async function expandContainerCategory(category: string, depth: number): Promise<string[]> {
  const subcats = shuffle(await fetchSubcategories(category));
  if (subcats.length === 0) return [];

  const sampleSize = Math.min(subcats.length, 2 + Math.floor(Math.random() * 3)); // 2-4
  const chosen = subcats.slice(0, sampleSize);

  const pooled: string[] = [];
  for (const subcat of chosen) {
    let members = await fetchCategoryMembers(subcat);
    if (members.length < MIN_CONTAINER_MEMBERS && depth < MAX_CONTAINER_RECURSION_DEPTH) {
      members = await expandContainerCategory(subcat, depth + 1);
    }
    pooled.push(...members);
  }
  return pooled;
}

function buildCategoryResult(
  category: Category,
  mainTitle: string,
  candidatePool: string[],
  actualDifficulty: Difficulty,
): EntitySelectionResult | null {
  const donorPool = shuffle(candidatePool.filter((t) => t !== mainTitle));
  if (donorPool.length === 0) return null;

  return {
    main: { title: mainTitle, displayName: toDisplayName(mainTitle) },
    donor: { title: donorPool[0], displayName: toDisplayName(donorPool[0]) },
    topic: category.name,
    entityType: category.entityType,
    actualDifficulty,
  };
}

/** Distance from `views` to the nearest edge of `band` (0 if already inside it). */
function distanceToBand(views: number, band: Difficulty): number {
  if (band === "easy") return views > 90_000 ? 0 : 90_000 - views;
  if (band === "hard") return views < 15_000 ? 0 : views - 15_000;
  if (views < 15_000) return 15_000 - views;
  if (views > 90_000) return views - 90_000;
  return 0;
}
