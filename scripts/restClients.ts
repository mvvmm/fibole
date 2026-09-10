// REST-API-backed DbClient/AiClient implementations (worker/clients.ts), for
// running the generation pipeline from a local Node script instead of inside
// a Cloudflare Worker. Uses the same D1 database and the same AI Gateway
// (with its $10/month spend limit, rate limit, and Authenticated Gateway) as
// the deployed cron — just invoked over HTTP instead of via bindings.
//
// The CLOUDFLARE_API_TOKEN used here must have Workers AI Run permission in
// addition to the D1:Edit scope the rest of the project's tooling needs —
// see AGENTS.md's "Generating questions" section.

import type { DbClient, AiClient } from "../worker/clients";

const API_BASE = "https://api.cloudflare.com/client/v4";

interface D1QueryResponse {
  success: boolean;
  result: { results: Record<string, unknown>[]; meta?: { changes?: number } }[];
  errors: { code: number; message: string }[];
}

export function restD1Client(accountId: string, databaseId: string, apiToken: string): DbClient {
  return {
    async query<T = Record<string, unknown>>(sql: string, params: (string | number | null)[] = []) {
      const res = await fetch(`${API_BASE}/accounts/${accountId}/d1/database/${databaseId}/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ sql, params }),
      });
      const json = (await res.json()) as D1QueryResponse;
      if (!json.success) {
        throw new Error(`D1 query failed: ${JSON.stringify(json.errors)}`);
      }
      const [statementResult] = json.result;
      return {
        results: (statementResult?.results ?? []) as T[],
        changes: statementResult?.meta?.changes ?? 0,
      };
    },
  };
}

interface AiRunResponse {
  success: boolean;
  result: unknown;
  errors: { code: number; message: string }[];
}

export function restAiClient(accountId: string, apiToken: string, gatewayId: string): AiClient {
  return {
    async run(model, inputs) {
      const res = await fetch(`${API_BASE}/accounts/${accountId}/ai/run/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          "cf-aig-gateway-id": gatewayId,
        },
        body: JSON.stringify(inputs),
      });
      if (res.status === 429) {
        // Matches factGeneration.ts's isSpendLimitError() substring check.
        throw new Error("429: rate limited or spend limit exceeded");
      }
      const json = (await res.json()) as AiRunResponse;
      if (!json.success) {
        throw new Error(`AI run failed: ${JSON.stringify(json.errors)}`);
      }
      return json.result;
    },
  };
}
