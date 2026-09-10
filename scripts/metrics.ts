// Read-only reporting over PRODUCTION D1, via the Cloudflare REST API (same
// transport as scripts/generate-questions.ts — see scripts/restClients.ts).
// Prints structural/operational metrics only: which dates have questions,
// how much buffer remains, difficulty mix, etc. Never prints answers, facts,
// fib indices, or fib_true_subject — nothing a player could use as a hint.
//
// Requires .env: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (D1:Edit is
// enough; no Workers AI permission needed here), D1_DATABASE_ID.
//
// Usage:
//   pnpm metrics

import "dotenv/config";
import { restD1Client } from "./restClients";
import { todayChicago, addDaysISO } from "../worker/date";
import type { Difficulty } from "../worker/difficulty";

const LAUNCH_DATE = "2026-06-19"; // edition No. 1

interface RoundRow {
  date: string;
  round_number: 1 | 2 | 3;
  difficulty: Difficulty;
}

function pct(n: number, total: number): string {
  return total === 0 ? "0%" : `${((n / total) * 100).toFixed(0)}%`;
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const databaseId = process.env.D1_DATABASE_ID;

  if (!accountId || !apiToken || !databaseId) {
    console.error("Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, or D1_DATABASE_ID in .env");
    process.exit(1);
  }

  const db = restD1Client(accountId, databaseId, apiToken);

  const [{ results: rows }, { results: answerCountRows }] = await Promise.all([
    db.query<RoundRow>(
      "SELECT date, round_number, difficulty FROM questions ORDER BY date, round_number",
    ),
    db.query<{ count: number }>("SELECT COUNT(DISTINCT answer) as count FROM questions"),
  ]);

  const today = todayChicago();

  const roundsByDate = new Map<string, Set<number>>();
  const difficultyCounts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const row of rows) {
    let rounds = roundsByDate.get(row.date);
    if (!rounds) {
      rounds = new Set();
      roundsByDate.set(row.date, rounds);
    }
    rounds.add(row.round_number);
    difficultyCounts[row.difficulty]++;
  }

  const dates = [...roundsByDate.keys()].sort();
  const isComplete = (date: string) => (roundsByDate.get(date)?.size ?? 0) === 3;
  const completeDates = dates.filter(isComplete);
  const incompleteDates = dates.filter((d) => !isComplete(d));

  // Gaps: any date strictly between the earliest and latest date with zero rows at all.
  const gaps: string[] = [];
  if (dates.length > 0) {
    const first = dates[0];
    const last = dates[dates.length - 1];
    for (let d = first; d < last; d = addDaysISO(d, 1)) {
      if (!roundsByDate.has(d)) gaps.push(d);
    }
  }

  // Buffer remaining: consecutive complete days starting today, going forward.
  let bufferDays = 0;
  for (let d = today; isComplete(d); d = addDaysISO(d, 1)) bufferDays++;

  // Editions published so far: complete days from launch through today (inclusive).
  const editionsPublished = completeDates.filter((d) => d >= LAUNCH_DATE && d <= today).length;
  const daysSinceLaunch = Math.floor(
    (new Date(today).getTime() - new Date(LAUNCH_DATE).getTime()) / 86_400_000 + 1,
  );

  const totalRounds = rows.length;
  const totalAnswersUsed = answerCountRows[0]?.count ?? 0;

  console.log("=== Fibole D1 metrics ===\n");

  console.log(`Today (America/Chicago): ${today}`);
  console.log(`Launch date:             ${LAUNCH_DATE} (edition No. 1)\n`);

  console.log("-- Coverage --");
  console.log(`Date range:              ${dates[0] ?? "—"} to ${dates[dates.length - 1] ?? "—"}`);
  console.log(`Days with any rows:      ${dates.length}`);
  console.log(`Complete days (3/3):     ${completeDates.length}`);
  console.log(`Incomplete days:         ${incompleteDates.length}`);
  if (incompleteDates.length > 0) {
    for (const d of incompleteDates) {
      const have = roundsByDate.get(d)?.size ?? 0;
      console.log(`  ${d} — ${have}/3 rounds`);
    }
  }
  console.log(`Gaps (no rows at all):   ${gaps.length}`);
  if (gaps.length > 0) {
    console.log(`  ${gaps.join(", ")}`);
  }
  console.log();

  console.log("-- Buffer --");
  console.log(`Complete days remaining from today: ${bufferDays} (cron target: 7)\n`);

  console.log("-- Retro --");
  console.log(`Days since launch:       ${daysSinceLaunch}`);
  console.log(`Editions published:      ${editionsPublished} / ${daysSinceLaunch}`);
  console.log(`Total rounds in DB:      ${totalRounds}`);
  console.log(`Distinct answers used:   ${totalAnswersUsed}\n`);

  console.log("-- Difficulty mix (all rounds ever generated) --");
  for (const level of ["easy", "medium", "hard"] as const) {
    const count = difficultyCounts[level];
    console.log(`  ${level.padEnd(6)} ${String(count).padStart(5)}  (${pct(count, totalRounds)})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
