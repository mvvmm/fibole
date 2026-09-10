// Worker-only wiring for the daily Cron Trigger: builds the binding-backed
// DbClient/AiClient (worker/workerClients.ts) and hands them to the
// runtime-agnostic runTopUp (worker/generateCore.ts). Keep this file's only
// job as that wiring — the actual generation logic lives in generateCore.ts
// so the local CLI script (scripts/generate-questions.ts) can import it
// without pulling in Workers-only ambient types (D1Database, Ai, ...).

import type { Env } from "./types";
import { d1Client, workersAiClient } from "./workerClients";
import { runTopUp } from "./generateCore";

export async function scheduled(
  _controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  const db = d1Client(env.DB);
  const ai = workersAiClient(env.AI, env.AI_GATEWAY_ID);
  ctx.waitUntil(runTopUp(db, ai));
}
