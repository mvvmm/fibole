# AGENTS.md — Fibole

Daily fact-spotting game. Players see 5 facts about a topic — 4 true, 1 fake — and must identify the answer (who/what the true facts describe) and spot the fake. Three rounds per day. No logins; all user state lives in localStorage.

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
  components/      Game, Round, FactList, AnswerInput, ShareCard
  hooks/           useGameState.ts — reads/writes localStorage
  lib/             scoring.ts, utils.ts
  types.ts
worker/            Cloudflare Worker
  index.ts         GET /api/questions?date=YYYY-MM-DD
migrations/        D1 schema (applied via wrangler)
scripts/           Content generation (not deployed)
  generate-questions.ts
  categories.ts
.claude/skills/    Claude Code skills
  generate-questions.md   Skill for populating D1 with questions
```

## Setup

```bash
pnpm install
cp .env.example .env   # fill in CLOUDFLARE_API_TOKEN and CLOUDFLARE_API_TOKEN
```

Required `.env` values (never commit the real `.env`):
- `CLOUDFLARE_API_TOKEN` — D1:Edit + Workers Scripts:Edit + Account Settings:Read
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

Schema: `migrations/0001_init.sql` — one `questions` table with `UNIQUE(date, round_number)`.

### Generating questions

Use the `.claude/skills/generate-questions.md` skill. This is the only supported way to populate D1 — there is no script that calls an external API; Claude Code does the work directly:
1. Fetches Wikipedia summaries for each entity
2. Derives 4 true facts + 1 fake fact from the Wikipedia text
3. Inserts via Cloudflare D1 REST API

```
# In a Claude Code session:
/generate-questions --days=7 --start=2026-06-21
```

The skill handles dedup automatically (queries existing answers before picking entities).

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
      "facts": ["fact0", "fact1", "fact2", "fact3", "fact4"],
      "fake_fact_index": 2,
      "fake_fact_true_subject": "John F. Kennedy"
    }
  ]
}
```

Returns 404 if no questions exist for the date.

## Game Logic

- **Answer phase**: Up to 3 guesses. Score: 3 (first guess) / 2 / 1 / 0.
- **Fake-fact phase**: 1 tap to identify the fake. Score: 1 / 0.
- **Max score**: 12 per day (3 rounds × 4 pts).
- **State**: `localStorage` key `gameState_YYYY-MM-DD`. Completed games show results on reload.

## Code Conventions

- TypeScript throughout (strict)
- Path alias `@/` → `src/`
- No default exports on components — named exports only
- Tailwind utility classes inline, no CSS modules
- No external state management — React state + localStorage only
- `@cloudflare/workers-types` for Worker type bindings (`Env` in `worker/types.ts`)

## Key Gotchas

- `pnpm db:migrate:prod` requires `--remote` (already set in package.json) — without it wrangler silently targets local
- The Vite plugin redirects wrangler config to `dist/factual/wrangler.json` at build time; don't edit that file
- Questions are served including the answer and fake index — no anti-cheat, by design (no user accounts)
- The `facts` column is stored as a JSON string; parse it with `JSON.parse` on read
