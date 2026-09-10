// Worker-binding-backed implementations of the DbClient/AiClient interfaces
// (worker/clients.ts). Used only by worker/scheduled.ts's scheduled() handler
// — the pipeline logic itself (worker/db.ts, worker/factGeneration.ts) never
// touches D1Database/Ai bindings directly, so it also runs against the
// REST-backed clients in scripts/restClients.ts.

import type { DbClient, AiClient } from "./clients";

export function d1Client(DB: D1Database): DbClient {
  return {
    async query<T = Record<string, unknown>>(sql: string, params: (string | number | null)[] = []) {
      const stmt = params.length ? DB.prepare(sql).bind(...params) : DB.prepare(sql);
      const { results, meta } = await stmt.all<T>();
      return { results, changes: meta.changes ?? 0 };
    },
  };
}

// @cloudflare/workers-types' Ai.run() overloads are keyed by a fixed union of
// model-id literals that may not yet include a model this new — cast through
// a minimal structural type rather than fighting the generic overloads.
type AiRunFn = (
  model: string,
  inputs: Record<string, unknown>,
  options?: Record<string, unknown>,
) => Promise<unknown>;

export function workersAiClient(AI: Ai, gatewayId: string): AiClient {
  return {
    async run(model, inputs) {
      const run = AI.run.bind(AI) as unknown as AiRunFn;
      return run(model, inputs, { gateway: { id: gatewayId, skipCache: true } });
    },
  };
}
