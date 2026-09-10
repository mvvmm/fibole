// Daily Cron Trigger entry point: keeps D1 topped up ~7 days ahead of today,
// generating exactly one missing round at a time so a partial failure one
// night is recovered (not skipped) by a later run instead of stalling forever.

import type { Env } from "./types";
import { todayChicago, addDaysISO } from "./date";
import { getUsedAnswers, getRoundsInRange, insertQuestion } from "./db";
import { difficultyForRound } from "./difficulty";
import {
  selectTrendingEntity,
  selectCategoryEntity,
  type EntitySelectionResult,
} from "./entitySelection";
import { fetchExtract } from "./wikipedia";
import { generateFacts, AiGatewaySpendLimitError, EntityRejectedError } from "./factGeneration";

const HORIZON_DAYS = 7;
const MAX_ENTITY_ATTEMPTS = 3;

export interface DateNeedingWork {
  date: string;
  missingRounds: (1 | 2 | 3)[];
}

/**
 * Deterministic hash of the date string -> 1, 2, or 3. The skill's one-shot
 * `Math.random()` draw for the trending round's position isn't safe for a
 * cron that may recover a missing round on a later run — it must not re-roll
 * which position was "trending" for a date already partially generated.
 */
export function trendingRoundPosition(dateISO: string): 1 | 2 | 3 {
  let hash = 0;
  for (let i = 0; i < dateISO.length; i++) {
    hash = (hash * 31 + dateISO.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 3) + 1) as 1 | 2 | 3;
}

/** First date in [today, today+horizonDays] missing any of rounds 1-3, if any. */
export function findDateNeedingWork(
  roundsByDate: ReadonlyMap<string, ReadonlySet<number>>,
  todayISO: string,
  horizonDays = HORIZON_DAYS,
): DateNeedingWork | null {
  for (let offset = 0; offset <= horizonDays; offset++) {
    const date = addDaysISO(todayISO, offset);
    const present = roundsByDate.get(date) ?? new Set<number>();
    const missingRounds = ([1, 2, 3] as const).filter((r) => !present.has(r));
    if (missingRounds.length > 0) return { date, missingRounds };
  }
  return null;
}

export async function runDailyTopUp(env: Env): Promise<void> {
  const today = todayChicago();
  const horizonEnd = addDaysISO(today, HORIZON_DAYS);

  const roundsByDate = await getRoundsInRange(env.DB, today, horizonEnd);
  const work = findDateNeedingWork(roundsByDate, today);
  if (!work) {
    console.log(
      JSON.stringify({ level: "info", message: "buffer already topped up", through: horizonEnd }),
    );
    return;
  }

  const usedAnswers = await getUsedAnswers(env.DB);
  const trendingRound = trendingRoundPosition(work.date);
  const yesterdayOfWorkDate = addDaysISO(work.date, -1);
  // Keeps the (up to) 2 category rounds within this date distinct from each other.
  const categoryNamesUsedToday = new Set<string>();

  for (const roundNumber of work.missingRounds) {
    try {
      await generateRound(
        env,
        work.date,
        roundNumber,
        roundNumber === trendingRound,
        yesterdayOfWorkDate,
        usedAnswers,
        categoryNamesUsedToday,
      );
    } catch (err) {
      if (err instanceof AiGatewaySpendLimitError) {
        console.error(
          JSON.stringify({
            level: "error",
            stage: "ai_gateway_spend_limit_exceeded",
            date: work.date,
            round: roundNumber,
          }),
        );
        return; // budget is exhausted for the rest of this run too — stop rather than keep failing
      }
      console.error(
        JSON.stringify({
          level: "error",
          stage: "generate_round",
          date: work.date,
          round: roundNumber,
          message: err instanceof Error ? err.message : String(err),
        }),
      );
      // Round is left missing — a later run retries just this slot.
    }
  }
}

/**
 * Selects an entity and generates its round, retrying with a *different*
 * entity (not just a different prompt) if the model rejects the fetched
 * content as a poor match for the expected entity type — e.g. Wikipedia's
 * category search returning a document instead of a person. Bounded to
 * `MAX_ENTITY_ATTEMPTS` so a persistently bad category can't loop forever.
 */
async function generateRound(
  env: Env,
  date: string,
  roundNumber: 1 | 2 | 3,
  isTrending: boolean,
  yesterdayISO: string,
  usedAnswers: Set<string>,
  categoryNamesUsedToday: Set<string>,
): Promise<void> {
  const targetDifficulty = difficultyForRound(date, roundNumber);

  for (let attempt = 1; attempt <= MAX_ENTITY_ATTEMPTS; attempt++) {
    const selection: EntitySelectionResult | null = isTrending
      ? await selectTrendingEntity(usedAnswers, targetDifficulty, yesterdayISO)
      : await selectCategoryEntity(usedAnswers, targetDifficulty, categoryNamesUsedToday);

    if (!selection) {
      throw new Error(`no eligible entity found for ${isTrending ? "trending" : "category"} round`);
    }
    // Excluding the category here also means a rejected category won't be
    // retried within this round — the next attempt (if any) picks a new one.
    if (!isTrending) categoryNamesUsedToday.add(selection.topic);

    const [mainExtract, donorExtract] = await Promise.all([
      fetchExtract(selection.main.title),
      fetchExtract(selection.donor.title),
    ]);
    if (!mainExtract || !donorExtract) {
      const missingWhich = !mainExtract ? selection.main.displayName : selection.donor.displayName;
      throw new Error(`failed to fetch Wikipedia extract for "${missingWhich}"`);
    }

    try {
      const generated = await generateFacts(env, {
        entityType: selection.entityType,
        mainName: selection.main.displayName,
        mainExtract,
        donorName: selection.donor.displayName,
        donorExtract,
      });

      const inserted = await insertQuestion(env.DB, {
        date,
        roundNumber,
        topic: selection.topic,
        answer: selection.main.displayName,
        facts: generated.facts,
        fibIndex: generated.fibIndex,
        fibTrueSubject: generated.fibTrueSubject,
        difficulty: selection.actualDifficulty,
      });

      if (inserted) usedAnswers.add(selection.main.displayName);
      return;
    } catch (err) {
      if (err instanceof EntityRejectedError && attempt < MAX_ENTITY_ATTEMPTS) {
        // Exclude from future picks so the next attempt (this round, and any
        // future round/date) doesn't select it again. This permanently marks
        // it "used" even though it was never a real answer — an acceptable
        // tradeoff given rejections should be rare, in exchange for not
        // needing a separate short-lived exclusion set.
        usedAnswers.add(selection.main.displayName);
        console.warn(
          JSON.stringify({
            level: "warn",
            stage: "entity_rejected",
            date,
            round: roundNumber,
            entity: selection.main.displayName,
            reason: err.message,
            attempt,
          }),
        );
        continue;
      }
      throw err;
    }
  }
}

export async function scheduled(
  _controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  ctx.waitUntil(runDailyTopUp(env));
}
