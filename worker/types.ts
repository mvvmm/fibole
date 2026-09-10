export interface Env {
  DB: D1Database;
  AI: Ai;
  /** AI Gateway id the daily generator routes its LLM calls through. */
  AI_GATEWAY_ID: string;
}
