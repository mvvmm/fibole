// Runtime-agnostic interfaces for the two I/O boundaries the generation
// pipeline needs (D1 + the AI Gateway). The Worker uses binding-backed
// implementations (worker/workerClients.ts); the local CLI script
// (scripts/generate-questions.ts) uses REST-API-backed ones
// (scripts/restClients.ts) — same pipeline code either way.

export interface DbQueryResult<T = Record<string, unknown>> {
  results: T[];
  /** Rows changed by an INSERT/UPDATE/DELETE; 0 (or irrelevant) for a SELECT. */
  changes: number;
}

export interface DbClient {
  query<T = Record<string, unknown>>(
    sql: string,
    params?: (string | number | null)[],
  ): Promise<DbQueryResult<T>>;
}

export interface AiClient {
  /** Runs a chat/tool-call-style model, returning the raw provider response. */
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}
