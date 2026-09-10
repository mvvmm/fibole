// Single structured LLM call per round: given a main entity's and a donor
// entity's Wikipedia extracts, derive 3 true facts + 1 fib. This replaces
// Claude's reasoning in .claude/skills/generate-questions.md's Step 5 with
// DeepSeek V4 Flash on Workers AI, routed through an AI Gateway.
//
// Keep SYSTEM_PROMPT in sync with that skill's Step 5 — they encode the same
// rules, but there's no way to share code between markdown prose executed by
// Claude and a TypeScript string executed by DeepSeek.

import type { AiClient } from "./clients";

const MODEL_ID = "@cf/deepseek-ai/deepseek-v4-flash-0731";

export interface FactGenerationInput {
  entityType: string;
  mainName: string;
  mainExtract: string;
  donorName: string;
  donorExtract: string;
}

export interface FactGenerationResult {
  facts: [string, string, string, string];
  fibIndex: number;
  fibTrueSubject: string;
}

export class AiGatewaySpendLimitError extends Error {
  constructor() {
    super(
      "AI Gateway spend limit exceeded (429) — not retrying, a budget stop won't clear on retry",
    );
    this.name = "AiGatewaySpendLimitError";
  }
}

/**
 * The model determined the fetched extract doesn't actually match the
 * expected entity type (e.g. Wikipedia's category search returned a document
 * or list instead of a person). Unlike a validation failure, retrying with
 * the same entity/extract won't help — the caller should pick a different
 * entity instead.
 */
export class EntityRejectedError extends Error {
  constructor(reason: string) {
    super(`model rejected the entity as a poor match for its expected type: ${reason}`);
    this.name = "EntityRejectedError";
  }
}

const SYSTEM_PROMPT = `You write rounds for a daily fact-spotting trivia game. Using ONLY the two Wikipedia extracts provided in the user message — never your own knowledge — produce 3 true facts about the main entity and 1 fib, then call submit_round exactly once with your final answer. Do not output any other text.

If the main entity's Wikipedia extract clearly does NOT describe a subject matching the stated entity type (for example, category search pulled in a document, list, event, or other mismatched page rather than an actual instance of that type), do not force facts from it — call reject_entity with a brief reason instead of submit_round.

THREE TRUE FACTS about the main entity. Each must:
- Be 1-2 sentences, grounded only in the main entity's extract.
- Be specific and verifiable — a concrete number, named event, named person, specific year, or singular achievement. Never a vague thematic description that could plausibly apply to many entities (e.g. "known for their powerful voice").
- Cover a DIFFERENT characteristic than the other facts and the fib — don't write two facts about the same thing (e.g. two about band membership, two about Olympic results).
- NEVER name the main entity, use an obvious synonym, or use a parent classification so specific it identifies it (e.g. for "Blue Whale" don't write "baleen whale"; for "Peyton Manning" don't write "Indianapolis Colts quarterback"). Refer to it only as "this {entityType}" or a non-identifying descriptor.

ONE FIB, drawn only from the donor entity's extract, presented as if it could describe a generic entity of the same type. It must:
- Meet the same specificity bar as the true facts — a fact that could be true of many entities is useless as a fib.
- Cover a characteristic not already covered by any of the 3 true facts.
- NOT directly contradict a true fact (e.g. a different medal count for the same event is guessable by elimination).
- Not name the donor entity, and follow the same no-naming rule for the main entity.

SELF-CHECK before finalizing — read all 4 statements together:
(a) Is each one specific enough it couldn't describe a dozen other entities? If not, make it more concrete.
(b) Does any pair cover the same characteristic? If so, revise one.
(c) Does any statement name or strongly imply the main entity? If so, rewrite it.

Examples:
- Bad (vague, could describe dozens): "This artist's works have incorporated socially conscious and sexual themes, generating both controversy and critical acclaim."
- Good (specific, checkable): "This artist has won 16 Grammy Awards and 12 Brit Awards."
- Bad (two facts, same characteristic — band membership): "Since 2022, the band has consisted of just two of its original members." / [fib] "This band consisted of four members: a vocalist/guitarist, a drummer, a bassist, and a second guitarist who also played keyboards."
- Bad (fib contradicts a true fact): true fact "This athlete won two gold medals and a silver at the 1932 Summer Olympics." / fib "This athlete won four gold medals at the 1932 Summer Olympics." — same event, contradicts the medal count.

Finally, arrange all 4 statements in random shuffled order (don't always put the fib last) and call submit_round with: facts (the 4 statements in that shuffled order), fib_index (0-based position of the fib), and fib_true_subject (the donor entity's display name).`;

const SUBMIT_ROUND_TOOL = {
  type: "function",
  function: {
    name: "submit_round",
    description: "Submit the 4 shuffled statements (3 true facts + 1 fib) for a trivia round.",
    parameters: {
      type: "object",
      properties: {
        facts: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4,
          description:
            "Exactly 4 statements in final shuffled order: 3 true facts about the main entity, 1 fib sourced only from the donor entity.",
        },
        fib_index: {
          type: "integer",
          minimum: 0,
          maximum: 3,
          description: "0-based index of the fib within `facts`.",
        },
        fib_true_subject: {
          type: "string",
          description: "The donor entity's display name.",
        },
      },
      required: ["facts", "fib_index", "fib_true_subject"],
    },
  },
} as const;

const REJECT_ENTITY_TOOL = {
  type: "function",
  function: {
    name: "reject_entity",
    description:
      "Call this INSTEAD of submit_round if the main entity's Wikipedia extract clearly does not describe an instance of the stated entity type — signals the caller to pick a different entity rather than forcing facts from mismatched content.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Briefly, why the extract doesn't match the expected entity type.",
        },
      },
      required: ["reason"],
    },
  },
} as const;

function buildUserPrompt(input: FactGenerationInput): string {
  return [
    `Entity type: ${input.entityType}`,
    `Main entity name (for your reference only — never write it, or an obvious synonym, into any fact): ${input.mainName}`,
    `Main entity Wikipedia extract:\n${input.mainExtract}`,
    ``,
    `Donor entity name (source for the fib only — never name it either): ${input.donorName}`,
    `Donor entity Wikipedia extract:\n${input.donorExtract}`,
  ].join("\n");
}

// ─── Response parsing ─────────────────────────────────────────────────────────
// Confirmed empirically (2026-09): deepseek-v4-flash-0731's tool-call response
// is OpenAI chat-completions-shaped: choices[0].message.tool_calls[0].function
// .{name,arguments}, with `arguments` as a JSON string. The other shapes below
// are kept as fallbacks in case a future model/endpoint variant differs.

interface ToolInvocation {
  name: string;
  args: unknown;
}

function extractToolCall(response: unknown): ToolInvocation | null {
  const r = response as Record<string, unknown> | null | undefined;

  const choices = r?.choices as unknown[] | undefined;
  const choice = (Array.isArray(choices) ? choices[0] : undefined) as
    | { message?: { tool_calls?: unknown[] } }
    | undefined;
  const chatToolCalls = choice?.message?.tool_calls;

  const toolCalls = (chatToolCalls ??
    r?.tool_calls ??
    (r?.response as Record<string, unknown> | undefined)?.tool_calls) as unknown[] | undefined;
  const call = Array.isArray(toolCalls)
    ? (toolCalls[0] as Record<string, unknown> | undefined)
    : undefined;
  if (!call) return null;

  const fn = call.function as Record<string, unknown> | undefined;
  // Absent a function name (a fallback shape without one), assume submit_round —
  // it was the only tool before reject_entity existed.
  const name = ((fn?.name ?? call.name) as string | undefined) ?? "submit_round";
  const rawArgs = fn?.arguments ?? call.arguments;
  if (rawArgs == null) return null;

  if (typeof rawArgs === "string") {
    try {
      return { name, args: JSON.parse(rawArgs) };
    } catch {
      return null;
    }
  }
  return { name, args: rawArgs };
}

/** The parsed `submit_round` arguments, or null if no submit_round call was made. */
export function parseToolCall(response: unknown): unknown {
  const call = extractToolCall(response);
  return call?.name === "submit_round" ? call.args : null;
}

/** The parsed `reject_entity` arguments, or null if no rejection was made. */
export function parseRejection(response: unknown): { reason: string } | null {
  const call = extractToolCall(response);
  if (call?.name !== "reject_entity") return null;
  const args = call.args as Record<string, unknown> | null;
  const reason = typeof args?.reason === "string" ? args.reason : "no reason given";
  return { reason };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

const MIN_FACT_LENGTH = 20;
const MAX_FACT_LENGTH = 500;

export function validateFactsResult(candidate: unknown, mainName: string): ValidationResult {
  if (!candidate || typeof candidate !== "object") {
    return { ok: false, reason: "no structured response was returned" };
  }
  const { facts, fib_index, fib_true_subject } = candidate as Record<string, unknown>;

  if (!Array.isArray(facts) || facts.length !== 4) {
    return { ok: false, reason: "facts must be an array of exactly 4 strings" };
  }
  if (
    !facts.every(
      (f) =>
        typeof f === "string" &&
        f.trim().length >= MIN_FACT_LENGTH &&
        f.trim().length <= MAX_FACT_LENGTH,
    )
  ) {
    return { ok: false, reason: "each fact must be a non-empty, reasonably sized sentence" };
  }
  if (
    typeof fib_index !== "number" ||
    !Number.isInteger(fib_index) ||
    fib_index < 0 ||
    fib_index > 3
  ) {
    return { ok: false, reason: "fib_index must be an integer between 0 and 3" };
  }
  if (typeof fib_true_subject !== "string" || fib_true_subject.trim().length === 0) {
    return { ok: false, reason: "fib_true_subject must be a non-empty string" };
  }
  const nameLower = mainName.trim().toLowerCase();
  if (nameLower.length > 0 && facts.some((f) => (f as string).toLowerCase().includes(nameLower))) {
    return { ok: false, reason: `a fact named the main entity ("${mainName}")` };
  }
  return { ok: true };
}

// ─── env.AI.run() call + retry ───────────────────────────────────────────────

function isSpendLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429");
}

async function callModel(
  ai: AiClient,
  input: FactGenerationInput,
  retryReason?: string,
): Promise<unknown> {
  const messages: { role: string; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(input) },
  ];
  if (retryReason) {
    messages.push({
      role: "user",
      content: `Your previous attempt violated a rule: ${retryReason}. Call submit_round again with a corrected answer, avoiding this mistake (or reject_entity if you now believe the extract doesn't actually match the entity type).`,
    });
  }

  let response: unknown;
  try {
    response = await ai.run(MODEL_ID, { messages, tools: [SUBMIT_ROUND_TOOL, REJECT_ENTITY_TOOL] });
  } catch (err) {
    if (isSpendLimitError(err)) throw new AiGatewaySpendLimitError();
    throw err;
  }

  return response;
}

/**
 * One structured LLM call, with a single amended-prompt retry on validation
 * failure. A rejection (entity doesn't match the expected type) throws
 * immediately without retrying in place — the caller should select a
 * different entity instead, not re-ask about the same mismatched content.
 */
export async function generateFacts(
  ai: AiClient,
  input: FactGenerationInput,
): Promise<FactGenerationResult> {
  const first = await callModel(ai, input);
  const firstRejection = parseRejection(first);
  if (firstRejection) throw new EntityRejectedError(firstRejection.reason);

  const firstArgs = parseToolCall(first);
  const firstCheck = validateFactsResult(firstArgs, input.mainName);
  if (firstCheck.ok) return toResult(firstArgs as Record<string, unknown>);

  const second = await callModel(ai, input, firstCheck.reason);
  const secondRejection = parseRejection(second);
  if (secondRejection) throw new EntityRejectedError(secondRejection.reason);

  const secondArgs = parseToolCall(second);
  const secondCheck = validateFactsResult(secondArgs, input.mainName);
  if (secondCheck.ok) return toResult(secondArgs as Record<string, unknown>);

  throw new Error(`fact generation failed validation after retry: ${secondCheck.reason}`);
}

function toResult(candidate: Record<string, unknown>): FactGenerationResult {
  return {
    facts: candidate.facts as [string, string, string, string],
    fibIndex: candidate.fib_index as number,
    fibTrueSubject: candidate.fib_true_subject as string,
  };
}
