# AGENTS.md — Fibole

Daily fact-spotting game. Players see 4 items about a topic — 3 true facts, 1 fib — and must identify the answer (who/what the true facts describe) and spot the fib. Three rounds per day. No logins; all user state lives in localStorage.

See [design.md](design.md) for the visual language, typography, color palette, ink mark inventory, copy rules, and screen-state map.

## Stack

- **Frontend**: React + Vite → Cloudflare static assets
- **Backend**: Cloudflare Worker (`worker/index.ts`) — single API endpoint
- **Database**: Cloudflare D1 (SQLite) — questions only, no user data
- **Styling**: Tailwind CSS v4, mobile-first
- **Package manager**: pnpm

## Project Structure

```
src/               React SPA
  App.tsx          Loads today's questions, routes completed vs active game
  components/      Game, Round, FactList, AnswerInput, ShareCard, InkMarks
  hooks/           useGameState.ts — reads/writes localStorage
  lib/             scoring.ts, utils.ts
  types.ts
worker/            Cloudflare Worker
  index.ts         GET /api/questions?date=YYYY-MM-DD; wires in the scheduled() cron handler
  scheduled.ts     Cron-only wiring — builds binding-backed clients, calls generateCore's runTopUp
  generateCore.ts  Runtime-agnostic top-up/generation logic, shared with scripts/generate-questions.ts
migrations/        D1 schema (applied via wrangler)
scripts/           category data + the local question-generation CLI (see "Generating questions")
  categories.ts          ~180 category definitions
  generate-questions.ts  `pnpm generate` — runs generateCore.ts's pipeline over the Cloudflare REST API
.claude/skills/    Claude Code skills
  generate-questions.md   Skill for populating D1 with questions
```

## Setup

```bash
pnpm install
cp .env.example .env   # fill in CLOUDFLARE_API_TOKEN and CLOUDFLARE_API_TOKEN
```

Required `.env` values (never commit the real `.env`):
- `CLOUDFLARE_API_TOKEN` — D1:Edit + Workers Scripts:Edit + Account Settings:Read + Workers AI:Read (the last is only needed to run `pnpm generate`; see "Generating questions")
- `CLOUDFLARE_ACCOUNT_ID` — 9d38d6df51b1822215655c1a96ba0626
- `D1_DATABASE_ID` — 5fc36128-3e05-4fec-aded-4d0217231297

## Development

```bash
pnpm dev          # Vite + local Worker together (uses @cloudflare/vite-plugin)
```

The dev server runs the Worker locally via Miniflare. The `@` alias resolves to `src/`.

To test with questions, seed the local D1 first:
```bash
pnpm db:migrate:local          # apply schema to local D1
# then manually insert a row, or use the generate-questions skill against local
```

The app reads today's date as `new Date().toLocaleDateString('en-CA')` → `YYYY-MM-DD` and hits `/api/questions?date=<date>`.

## Testing

```bash
pnpm test        # Vitest in watch mode
pnpm test:run    # Single pass (good for CI)
```

Tests live alongside source files as `*.test.ts`. Config: `vitest.config.ts` (separate from `vite.config.ts` — omits the Cloudflare plugin so tests run in a plain Node environment).

## Pull Requests

Always run `pnpm format:write` before creating a PR.

## Build & Deploy

```bash
pnpm build        # Vite builds both client (dist/client/) and worker (dist/factual/)
pnpm deploy       # build + wrangler deploy
```

Deploy requires the `CLOUDFLARE_API_TOKEN` env var to be set.

## Database

```bash
pnpm db:migrate:local   # apply migrations to local D1
pnpm db:migrate:prod    # apply migrations to production D1 (--remote)
```

Schema: `migrations/` — one `questions` table with `UNIQUE(date, round_number)`. Columns include `difficulty TEXT` (easy/medium/hard, not yet surfaced in UI).

### Generating questions

Three ways to populate D1. The first two share one core pipeline (`worker/generateCore.ts`'s `runTopUp`) behind a runtime-agnostic `DbClient`/`AiClient` interface (`worker/clients.ts`) — same logic, different transport to D1/Workers AI:

- **Automated (primary)** — a daily Worker Cron Trigger (`worker/scheduled.ts`, `0 0 * * *` UTC) tops up D1 to a rolling 7-day buffer, generating only the missing round(s) for the earliest incomplete date each run, so a partial failure gets recovered by a later run rather than skipped. Talks to D1 and Workers AI via bindings (`worker/workerClients.ts`).
- **Manual, local script** — `pnpm generate` (`scripts/generate-questions.ts`; `-- --days=N` to fill in N missing days) runs the identical pipeline from your machine, over the Cloudflare REST API (`scripts/restClients.ts`) instead of bindings. There is no "local" mode — it always targets PRODUCTION D1 and spends real (small) AI Gateway budget. Requires `.env`'s `CLOUDFLARE_API_TOKEN` to also hold **Account → Workers AI → Read** permission, separate from whatever `AI Gateway` permission administers the gateway itself — the gateway only routes/bills the request; the model-execution endpoint is gated by Workers AI permission regardless of the gateway header. Use this to top up the buffer without waiting for the cron, or to test pipeline changes without `wrangler dev`/deploy.
- **Manual, interactive skill (backfill)** — the `.claude/skills/generate-questions.md` skill, run via Claude Code:
  ```
  /generate-questions --days=7 --start=2026-07-01
  ```
  Use this for bulk-seeding many days at once or regenerating a specific bad day — not day-to-day generation. Its Step 5 fact/fib rules are mirrored in `worker/factGeneration.ts`'s system prompt; keep both in sync if the rules change, since there's no way to share code between markdown prose executed by Claude and a TypeScript string executed by DeepSeek.

Entity selection (trending pageviews, or a `scripts/categories.ts` category with a container-category subcat fallback) and difficulty targeting (a fixed day-of-week schedule in `worker/difficulty.ts`) are deterministic TypeScript; only the final fact/fib derivation is a single structured call to DeepSeek V4 Flash on Workers AI (`worker/factGeneration.ts`), routed through the `fibole-questions` AI Gateway. If the model judges a selected entity doesn't actually match its expected category, it calls `reject_entity` instead of forcing facts from mismatched content, and the caller retries with a different entity (bounded, so a persistently bad category can't loop forever). That gateway's $10/month spend limit, 20/hour rate limit, Authenticated Gateway, and Unified Billing credit balance are configured in the Cloudflare dashboard/API, not in `wrangler.jsonc`.

All three paths dedup automatically against existing answers before picking entities (`worker/db.ts`'s `getUsedAnswers` for the two automated/script paths; a `SELECT` in the skill).

## API

`GET /api/questions?date=YYYY-MM-DD`

Response:
```json
{
  "date": "2026-06-20",
  "rounds": [
    {
      "round_number": 1,
      "topic": "US Presidents",
      "answer": "Theodore Roosevelt",
      "facts": ["fact0", "fact1", "fact2", "fact3"],
      "fib_index": 2,
      "fib_true_subject": "John F. Kennedy"
    }
  ]
}
```

Returns 404 if no questions exist for the date.

## Game Logic

- **Answer phase**: Up to 3 guesses. Score: 3 (first guess) / 2 / 1 / 0.
- **Fib phase**: 1 tap to identify the fib. Score: 1 / 0.
- **Max score**: 12 per day (3 rounds × 4 pts).
- **State**: `localStorage` key `gameState_YYYY-MM-DD`. Completed games show results on reload.

## Code Conventions

- TypeScript throughout (strict)
- Path alias `@/` → `src/`
- No default exports on components — named exports only
- UI components use inline `style` props for design-token values (custom colors, fonts, px sizes); Tailwind is kept for global resets only
- No external state management — React state + localStorage only
- `@cloudflare/workers-types` for Worker type bindings (`Env` in `worker/types.ts`)

## Key Gotchas

- `pnpm db:migrate:prod` requires `--remote` (already set in package.json) — without it wrangler silently targets local
- The Vite plugin redirects wrangler config to `dist/factual/wrangler.json` at build time; don't edit that file
- Plain `wrangler dev` (including `--test-scheduled`, for testing the cron) reads that pre-built redirected config and bundle, not your live `wrangler.jsonc`/`worker/*.ts` edits — run `pnpm build` after any such change before testing locally this way
- Questions are served including the answer and fib index — no anti-cheat, by design (no user accounts)
- The `facts` column is stored as a JSON string; parse it with `JSON.parse` on read
- `env.AI.run()` in local dev always hits the real Workers AI/AI Gateway service (no local mock) — real usage, small but real cost
