# Skill: generate-questions

Populates the Fibole D1 database with daily quiz questions. You fetch Wikipedia content and derive facts from it directly — never use your own knowledge as a source of truth for facts.

## Parameters

| Parameter | Default |
|-----------|---------|
| Number of days | 7 |
| Start date | tomorrow (YYYY-MM-DD) |
| Category filter | none — all categories rotate |
| `--remote` | false (targets local D1 by default) |

When `--category` is specified, all 3 rounds use that category and there is no trending round. Useful for testing.

## Difficulty distribution

For any batch, target this default split across all rounds:
- **Easy** (~67%): monthly avg pageviews > 90k, or trending rank 1–100
- **Medium** (~24%): monthly avg pageviews 15k–90k, or trending rank 101–500
- **Hard** (~10%): monthly avg pageviews < 15k, or trending rank 501+

**Before generating**, compute the targets for the batch size (round fractions to nearest whole number, adjusting easy to make the total exact):

| Days | Total Qs | Easy | Medium | Hard |
|------|----------|------|--------|------|
| 1 | 3 | 2 | 1 | 0 |
| 3 | 9 | 6 | 2 | 1 |
| 7 | 21 | 14 | 5 | 2 |
| 14 | 42 | 28 | 10 | 4 |
| 30 | 90 | 60 | 21 | 9 |

**While generating**, maintain a running count of each difficulty inserted so far. Before each round, determine which difficulty is most behind its target (largest gap between target and actual) and use that as the **target difficulty** for entity selection that round. This naturally corrects drift as you go — no need to pre-assign difficulties to specific rounds.

When entity selection for a target difficulty fails (e.g., no category members fall in the hard band after 10 checks), fall back to the closest available difficulty and note it in the final report.

## Local vs remote

**Default (no flag) → local D1.** Use this when testing locally with `pnpm dev`.

**`--remote` → production D1.** Use this when generating real questions for the live game.

This mirrors the wrangler convention used elsewhere in the project (`pnpm db:migrate:local` vs `pnpm db:migrate:prod`).

### Local D1 queries

Use `wrangler d1 execute fibole-db --local` for all D1 reads and writes:

```bash
# Read
wrangler d1 execute fibole-db --local --json --command "SELECT answer FROM questions"

# Write
wrangler d1 execute fibole-db --local --json --command \
  "INSERT OR IGNORE INTO questions (date, round_number, topic, answer, facts, fib_index, fib_true_subject, difficulty) VALUES ('DATE', ROUND, 'TOPIC', 'ANSWER', '[\"f0\",\"f1\",\"f2\",\"f3\"]', FIB_INDEX, 'FIB_SUBJECT', 'DIFFICULTY')"
```

### Remote D1 queries (--remote)

Read credentials from `.env`:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_ID`

If any are missing, tell the user and stop. Use the Cloudflare REST API for all reads and writes:

```bash
# Read
curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}/query" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT answer FROM questions"}'

# Write (same endpoint, different SQL)
```

## Round structure per day

Each day has 3 rounds — 1 trending and 2 category. The trending round is assigned to a **random position** (1, 2, or 3) for each day; it is not always round 1. Pick the position with `Math.floor(Math.random() * 3) + 1` (or any equivalent random draw) fresh for each day.

## Step 1 — Deduplicate and find start date

Run both queries using the appropriate method from **Local vs remote** above.

**Used answers** — never repeat an entity as a main answer:
```sql
SELECT answer FROM questions
```
Keep this set in memory throughout the session.

**Last populated date** — to determine where to append:
```sql
SELECT MAX(date) as last_date FROM questions
```

If `--start` was not specified by the user, set it to the day after `last_date`. If the table is empty, default to tomorrow. This ensures new questions always append after existing ones with no gaps or overlaps.

## Step 2 — Pick entity (Trending round)

Skip this step if `--category` was specified. Otherwise, randomly assign the trending round to position 1, 2, or 3 for the current day before beginning that day's rounds. The remaining two positions are category rounds.

Fetch yesterday's top Wikipedia pageviews:

```bash
curl -s "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/YYYY/MM/DD"
```

Response has `items[0].articles` — an array sorted by rank. Filter out:
- `Main_Page`, and anything starting with `Special:`, `Wikipedia:`, `File:`, `Portal:`, `Help:`, `Template:`, `Talk:`, `User:`, `Category:`
- Any article already in the used-answers set

Filter the list into rank bands, then sample from the band matching the **target difficulty** for this round:
- **easy** → sample from rank 1–100
- **medium** → sample from rank 101–500
- **hard** → sample from rank 501+

If the target band has no eligible articles (e.g., all hard-band articles are already used), fall back to the next closest band and note the deviation.

Also pick a **donor entity** for the fib: any other article from the full filtered pool, different from the main entity.

## Step 3 — Pick entity (Rounds 2–3: Category)

Refer to `scripts/categories.ts` for the full category list (~180 entries). Rotate through categories across rounds and days to maintain variety.

**a. Fetch category members from Wikipedia:**

```bash
curl -s "https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:CATEGORY_NAME&cmlimit=500&cmnamespace=0&cmtype=page&format=json"
```

This returns up to 500 article titles directly in that category.

**b. Filter and shuffle** — remove any titles already in the used-answers set. Shuffle the remaining list.

**c. Check pageviews and match target difficulty** — for up to 10 candidates in order, fetch monthly avg pageviews:

```bash
curl -s "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/ARTICLE_TITLE/monthly/YYYYMMDD/YYYYMMDD"
```

Use a 5-month rolling window ending at the last complete month. Average the returned monthly view counts.

Accept the first candidate whose views fall in the **target difficulty** band:
- **easy**: > 90,000/month
- **medium**: 15,000–90,000/month
- **hard**: < 15,000/month

Note: when targeting **hard**, the category's `minMonthlyViews` floor is ignored — the goal is to find a low-view entity. If no candidate lands in the target band after 10 checks, use the candidate with views closest to the target band boundary and record the fallback in the report.

**d. Record difficulty** as the band the selected entity actually landed in (not the target — they may differ on fallback).

**e. Pick donor entity** — any other member from the shuffled category list, different from the main entity.

## Step 4 — Fetch Wikipedia content

Fetch the Wikipedia REST summary for both the main entity and the donor entity:

```bash
curl -s "https://en.wikipedia.org/api/rest_v1/page/summary/ENTITY_NAME_UNDERSCORED"
```

Use the `extract` field. If the fetch fails or returns no extract, pick a different entity and retry.

## Step 5 — Derive facts from Wikipedia content

Using **only** the Wikipedia extract text — no outside knowledge:

**3 true facts** about the main entity. Each fact must:
- Be 1–2 sentences, grounded only in the entity's Wikipedia extract
- Be **specific and verifiable** — a concrete number, named event, named person, specific year, or singular achievement. Never a vague thematic description that could plausibly apply to many people (e.g., "known for their powerful voice" or "incorporated political themes in their work").
- Cover a **different characteristic** than the other facts — don't write two facts that are both about the same thing (e.g., two facts about band membership, two about Olympic results, two about where someone was born).
- **Never name the entity itself**, use an obvious synonym, or use a parent classification so specific it identifies the answer (e.g., for "Blue Whale" do not write "baleen whale"; for "Peyton Manning" do not write "Indianapolis Colts quarterback"). Refer to the subject only as "this [entity type]" or use non-identifying descriptors.

**1 fib** — a specific detail drawn **only** from the donor entity's Wikipedia extract, presented as if it could describe a generic entity of the same type. The fib must:
- Also be **specific and verifiable** — same standard as the true facts. A fact that could be true of many people is useless as a fib; it needs to be uniquely sourced from the donor.
- Cover a characteristic **not already covered** by any of the 3 true facts
- **Not directly contradict** any true fact — that makes it guessable by elimination
- Not name the donor entity in the fib text
- Also follow the no-naming rule: don't name or strongly imply the main entity

**Self-check before finalising:** read all 4 statements together and verify each one:
- (a) Is it specific enough that it couldn't describe a dozen other people? If not, revise to a more concrete detail.
- (b) No other statement covers the same characteristic
- (c) It contains no word or phrase that names or strongly implies the main entity

Revise any that fail.

**Examples of what to avoid**

*Vague, thematic — bad for both facts and fibs:*
> ❌ "This artist's works have incorporated socially conscious and sexual themes, generating both controversy and critical acclaim." ← could describe dozens of artists, not uniquely verifiable

*Specific and verifiable — good:*
> ✅ "This artist has won 16 Grammy Awards and 12 Brit Awards." ← concrete, checkable, uniquely identifying

*Two facts about the same characteristic (band membership) — bad:*
> ❌ "Since 2022, the band has consisted of just two of its original members: Dave Gahan and Martin Gore."
> ❌ [fib] "This band consisted of four members: a vocalist/guitarist, a drummer, a bassist, and a second guitarist who also played keyboards."

*Fib that directly contradicts a true fact — bad:*
> ✅ "This athlete won two gold medals and a silver at the 1932 Summer Olympics."
> ❌ [fib] "This athlete won four gold medals at the 1932 Summer Olympics." ← same event, contradicts the medal count

Mix all 4 items in **random order** (don't put the fib last every time). Record:
- `fib_index` — 0-based index of the fib in the shuffled array
- `fib_true_subject` — the donor entity's name (shown to players after the round)

## Step 6 — Insert into D1

Use the appropriate method from **Local vs remote** above. The SQL is the same either way:

```sql
INSERT OR IGNORE INTO questions
  (date, round_number, topic, answer, facts, fib_index, fib_true_subject, difficulty)
VALUES
  ('DATE', ROUND_NUMBER, 'TOPIC', 'ANSWER', '["fact0","fact1","fact2","fact3"]', FIB_INDEX, 'FIB_SUBJECT', 'DIFFICULTY')
```

`INSERT OR IGNORE` is idempotent — re-running won't duplicate rows.

Add the entity to the in-memory used-answers set after a successful insert.

## Step 7 — Report

After all days and rounds are complete, report:
- Date range covered
- Total rows inserted vs skipped
- Difficulty breakdown
- Any Wikipedia fetch failures or category errors
