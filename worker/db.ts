// D1 query wrappers used by the generation pipeline, written against the
// runtime-agnostic DbClient interface (worker/clients.ts) so the same
// functions run both in the Worker (worker/workerClients.ts's binding-backed
// client) and the local CLI script (scripts/restClients.ts's REST-backed one).

import type { DbClient } from "./clients";
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
export async function getUsedAnswers(db: DbClient): Promise<Set<string>> {
  const { results } = await db.query<{ answer: string }>("SELECT answer FROM questions");
  return new Set(results.map((r) => r.answer));
}

/** Round numbers present for each date within [startISO, endISO] (inclusive). */
export async function getRoundsInRange(
  db: DbClient,
  startISO: string,
  endISO: string,
): Promise<Map<string, Set<number>>> {
  const { results } = await db.query<{ date: string; round_number: number }>(
    "SELECT date, round_number FROM questions WHERE date >= ? AND date <= ?",
    [startISO, endISO],
  );

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
export async function getDifficultyCounts(db: DbClient): Promise<Record<Difficulty, number>> {
  const { results } = await db.query<{ difficulty: Difficulty; count: number }>(
    "SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty",
  );

  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const row of results) counts[row.difficulty] = row.count;
  return counts;
}

/** Inserts one round. Returns whether a row was actually inserted (false = already present). */
export async function insertQuestion(db: DbClient, row: QuestionRow): Promise<boolean> {
  const { changes } = await db.query(
    `INSERT OR IGNORE INTO questions
       (date, round_number, topic, answer, facts, fib_index, fib_true_subject, difficulty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.date,
      row.roundNumber,
      row.topic,
      row.answer,
      JSON.stringify(row.facts),
      row.fibIndex,
      row.fibTrueSubject,
      row.difficulty,
    ],
  );
  return changes > 0;
}
