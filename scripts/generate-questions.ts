/**
 * Generates daily quiz questions and inserts them into the D1 database.
 *
 * Usage:
 *   pnpm generate --days=30 [--start=2026-07-01] [--category="US Presidents"]
 *
 * Requires .env with:
 *   ANTHROPIC_API_KEY
 *   CLOUDFLARE_API_TOKEN
 *   CLOUDFLARE_ACCOUNT_ID
 *   D1_DATABASE_ID
 *   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
 */

import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, CURATED_ENTITIES } from "./categories";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN ?? "";
const DB_ID = process.env.D1_DATABASE_ID ?? "";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";

if (!ACCOUNT_ID || !API_TOKEN || !DB_ID || !ANTHROPIC_KEY) {
  console.error("Missing required environment variables. Check .env.example");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// --------------------------------------------------------------------------
// D1 REST API helpers
// --------------------------------------------------------------------------

async function d1Query(sql: string, params: unknown[] = []): Promise<unknown[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`D1 query failed: ${res.status} ${text}`);
  }
  const body = (await res.json()) as { result: Array<{ results: unknown[] }> };
  return body.result[0]?.results ?? [];
}

async function getUsedAnswers(): Promise<Set<string>> {
  const rows = (await d1Query("SELECT answer FROM questions")) as Array<{
    answer: string;
  }>;
  return new Set(rows.map((r) => r.answer.toLowerCase()));
}

async function insertQuestion(
  date: string,
  roundNumber: number,
  topic: string,
  answer: string,
  facts: string[],
  fibIndex: number,
  fibTrueSubject: string
): Promise<void> {
  await d1Query(
    `INSERT OR IGNORE INTO questions
       (date, round_number, topic, answer, facts, fib_index, fib_true_subject)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      date,
      roundNumber,
      topic,
      answer,
      JSON.stringify(facts),
      fibIndex,
      fibTrueSubject,
    ]
  );
}

// --------------------------------------------------------------------------
// Wikipedia helpers
// --------------------------------------------------------------------------

async function fetchWikipediaSummary(title: string): Promise<string> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
  );
  if (!res.ok) throw new Error(`Wikipedia fetch failed for: ${title}`);
  const data = (await res.json()) as { extract?: string };
  return data.extract ?? "";
}

// --------------------------------------------------------------------------
// Claude Haiku fact generation
// --------------------------------------------------------------------------

interface FactsResult {
  facts: string[];
  fib_index: number;
  fib_subject: string;
}

async function generateFacts(
  entity: string,
  entityType: string,
  wikiContent: string,
  otherEntities: string[]
): Promise<FactsResult> {
  const otherEntity =
    otherEntities[Math.floor(Math.random() * otherEntities.length)] ?? "a similar entity";

  const prompt = `You are creating trivia for a daily facts-spotting game.

Entity: ${entity}
Type: ${entityType}
Wikipedia summary: ${wikiContent.slice(0, 2000)}

Task:
1. Generate exactly 3 true, specific, verifiable facts about "${entity}". Each fact should be 1-2 sentences, interesting, and clearly verifiable from the Wikipedia summary above.
2. Generate exactly 1 fib — a fact that is TRUE about "${otherEntity}" (another ${entityType}), but presented as if it could be about the same category. Do NOT mention "${otherEntity}" in the fib itself.
3. Mix the 4 items in a random order (don't put the fib last every time).

Return ONLY valid JSON with this exact shape:
{
  "facts": ["fact1", "fact2", "fact3", "fact4"],
  "fib_index": <0-3, the index of the fib>,
  "fib_subject": "${otherEntity}"
}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response: ${text}`);

  const parsed = JSON.parse(jsonMatch[0]) as FactsResult;
  if (
    !Array.isArray(parsed.facts) ||
    parsed.facts.length !== 4 ||
    typeof parsed.fib_index !== "number" ||
    !parsed.fib_subject
  ) {
    throw new Error(`Invalid response shape: ${text}`);
  }

  return parsed;
}

// --------------------------------------------------------------------------
// Main generation loop
// --------------------------------------------------------------------------

function parseCLIArgs(): { days: number; start: string; category?: string } {
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .filter((a) => a.startsWith("--"))
      .map((a) => {
        const [k, v] = a.slice(2).split("=");
        return [k, v ?? "true"];
      })
  );

  const days = parseInt(args.days ?? "7", 10);
  const start =
    args.start ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    })();

  return { days, start, category: args.category };
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

async function main() {
  const { days, start, category: filterCategory } = parseCLIArgs();
  const usedAnswers = await getUsedAnswers();

  console.log(
    `Generating ${days} days of questions starting ${start}. Used answers: ${usedAnswers.size}`
  );

  const cats = filterCategory
    ? CATEGORIES.filter((c) => c.name === filterCategory)
    : CATEGORIES;

  if (cats.length === 0) {
    console.error(`Unknown category: ${filterCategory}`);
    process.exit(1);
  }

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const date = addDays(start, dayOffset);
    console.log(`\n--- ${date} ---`);

    for (let round = 1; round <= 3; round++) {
      // Rotate categories across rounds and days
      const cat = cats[(dayOffset * 3 + round - 1) % cats.length];
      const pool =
        CURATED_ENTITIES[cat.name] ??
        (() => {
          throw new Error(`No entity pool for category: ${cat.name}`);
        })();

      const unused = pool.filter((e) => !usedAnswers.has(e.toLowerCase()));
      if (unused.length < 2) {
        console.warn(`  Round ${round}: Not enough unused entities for ${cat.name}, skipping`);
        continue;
      }

      const entity = unused[Math.floor(Math.random() * unused.length)];
      const otherEntities = unused.filter((e) => e !== entity).slice(0, 5);

      console.log(`  Round ${round}: [${cat.name}] ${entity}`);

      try {
        const wikiContent = await fetchWikipediaSummary(entity);
        const result = await generateFacts(
          entity,
          cat.entityType,
          wikiContent,
          otherEntities
        );

        await insertQuestion(
          date,
          round,
          cat.name,
          entity,
          result.facts,
          result.fib_index,
          result.fib_subject
        );

        usedAnswers.add(entity.toLowerCase());
        console.log(`    ✓ Inserted (fib #${result.fib_index + 1}, actually about ${result.fib_subject})`);

        // Respect rate limits
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`    ✗ Failed for ${entity}:`, err);
      }
    }
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
