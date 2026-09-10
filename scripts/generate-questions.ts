// Manually runs the same generation pipeline the daily Worker cron uses
// (worker/scheduled.ts's runTopUp) — against PRODUCTION D1 and the real AI
// Gateway, via the Cloudflare REST API instead of Worker bindings. There is
// no "local" mode: the REST API always talks to your real Cloudflare
// account, unlike `wrangler dev`'s local D1 simulation. Useful for
// backfilling/bulk-seeding without waiting for the cron, or for testing
// pipeline changes without wrangler dev/deploy. See AGENTS.md's "Generating
// questions" section.
//
// Requires .env: CLOUDFLARE_API_TOKEN (needs Workers AI Run permission, in
// addition to the D1:Edit scope the rest of the project's tooling needs),
// CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID. Optionally AI_GATEWAY_ID (defaults
// to "fibole-questions").
//
// Usage:
//   pnpm generate                # fills in the next 1 missing day
//   pnpm generate -- --days=7    # fills in the next 7 missing days

import "dotenv/config";
import { runTopUp } from "../worker/generateCore";
import { restD1Client, restAiClient } from "./restClients";

// Generously larger than any plausible existing buffer, so each runTopUp
// call finds the next missing day regardless of how far ahead it's already
// queued — see worker/scheduled.ts's runTopUp docstring.
const SEARCH_HORIZON_DAYS = 400;

function parseDaysArg(): number {
  const arg = process.argv.find((a) => a.startsWith("--days="));
  const days = arg ? Number(arg.slice("--days=".length)) : 1;
  if (!Number.isInteger(days) || days < 1) {
    throw new Error(`--days must be a positive integer, got: "${arg}"`);
  }
  return days;
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const databaseId = process.env.D1_DATABASE_ID;
  const gatewayId = process.env.AI_GATEWAY_ID ?? "fibole-questions";

  if (!accountId || !apiToken || !databaseId) {
    console.error("Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, or D1_DATABASE_ID in .env");
    process.exit(1);
  }

  const days = parseDaysArg();
  const db = restD1Client(accountId, databaseId, apiToken);
  const ai = restAiClient(accountId, apiToken, gatewayId);

  console.log(`Generating ${days} day(s) against PRODUCTION D1 via the Cloudflare REST API...`);
  for (let i = 0; i < days; i++) {
    console.log(`\n--- Run ${i + 1}/${days} ---`);
    await runTopUp(db, ai, SEARCH_HORIZON_DAYS);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
