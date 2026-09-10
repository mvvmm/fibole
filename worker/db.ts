// Thin D1 binding wrappers used by the cron generator. Mirrors the binding-API
// style worker/index.ts already uses for reads (env.DB.prepare(...).bind(...)),
// so no Cloudflare REST API / bearer token is needed at runtime.

import type { Difficulty } from "./difficulty";

export interface QuestionRow {
  date: string;
  roundNumber: 1 | 2 | 3;
  topic: string;
  answer: string;
  facts: [string, string, string, string];
  fibIndex: number;
  fibTrueSubject: string;
  difficulty: Difficulty;
}

/** Every entity ever used as a main `answer` — never reused, across all dates. */
export async function getUsedAnswers(db: D1Database): Promise<Set<string>> {
  const { results } = await db.prepare("SELECT answer FROM questions").all<{ answer: string }>();
  return new Set(results.map((r) => r.answer));
}

/** Round numbers present for each date within [startISO, endISO] (inclusive). */
export async function getRoundsInRange(
  db: D1Database,
  startISO: string,
  endISO: string,
): Promise<Map<string, Set<number>>> {
  const { results } = await db
    .prepare("SELECT date, round_number FROM questions WHERE date >= ? AND date <= ?")
    .bind(startISO, endISO)
    .all<{ date: string; round_number: number }>();

  const byDate = new Map<string, Set<number>>();
  for (const row of results) {
    let rounds = byDate.get(row.date);
    if (!rounds) {
      rounds = new Set();
      byDate.set(row.date, rounds);
    }
    rounds.add(row.round_number);
  }
  return byDate;
}

/** Global difficulty distribution to date. Analytics only — not read back for target selection. */
export async function getDifficultyCounts(db: D1Database): Promise<Record<Difficulty, number>> {
  const { results } = await db
    .prepare("SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty")
    .all<{ difficulty: Difficulty; count: number }>();

  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const row of results) counts[row.difficulty] = row.count;
  return counts;
}

/** Inserts one round. Returns whether a row was actually inserted (false = already present). */
export async function insertQuestion(db: D1Database, row: QuestionRow): Promise<boolean> {
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO questions
         (date, round_number, topic, answer, facts, fib_index, fib_true_subject, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.date,
      row.roundNumber,
      row.topic,
      row.answer,
      JSON.stringify(row.facts),
      row.fibIndex,
      row.fibTrueSubject,
      row.difficulty,
    )
    .run();
  return (result.meta.changes ?? 0) > 0;
}
