import { describe, it, expect, vi } from "vitest";
import {
  validateFactsResult,
  parseToolCall,
  parseRejection,
  generateFacts,
  EntityRejectedError,
  type FactGenerationInput,
} from "./factGeneration";
import type { Env } from "./types";

// ─── validateFactsResult ──────────────────────────────────────────────────────

const VALID = {
  facts: [
    "This artist has won 16 Grammy Awards and 12 Brit Awards.",
    "This artist headlined a stadium tour across 5 continents in a single year.",
    "This artist's debut album sold over 10 million copies worldwide.",
    "This artist co-wrote a number-one single with a producer from Sweden.",
  ],
  fib_index: 2,
  fib_true_subject: "Some Donor Artist",
};

describe("validateFactsResult", () => {
  it("accepts a well-formed result", () => {
    expect(validateFactsResult(VALID, "Main Artist")).toEqual({ ok: true });
  });

  it("rejects a non-object", () => {
    expect(validateFactsResult(null, "Main Artist").ok).toBe(false);
    expect(validateFactsResult("nope", "Main Artist").ok).toBe(false);
  });

  it("rejects facts arrays that aren't exactly length 4", () => {
    expect(
      validateFactsResult({ ...VALID, facts: VALID.facts.slice(0, 3) }, "Main Artist").ok,
    ).toBe(false);
  });

  it("rejects facts that are too short", () => {
    expect(
      validateFactsResult({ ...VALID, facts: ["short", ...VALID.facts.slice(1)] }, "Main Artist")
        .ok,
    ).toBe(false);
  });

  it("rejects a fib_index outside 0-3", () => {
    expect(validateFactsResult({ ...VALID, fib_index: 4 }, "Main Artist").ok).toBe(false);
    expect(validateFactsResult({ ...VALID, fib_index: -1 }, "Main Artist").ok).toBe(false);
  });

  it("rejects a non-integer fib_index", () => {
    expect(validateFactsResult({ ...VALID, fib_index: 1.5 }, "Main Artist").ok).toBe(false);
  });

  it("rejects an empty fib_true_subject", () => {
    expect(validateFactsResult({ ...VALID, fib_true_subject: "  " }, "Main Artist").ok).toBe(false);
  });

  it("rejects a fact that names the main entity", () => {
    const facts = [...VALID.facts];
    facts[0] = "Main Artist has won 16 Grammy Awards and 12 Brit Awards.";
    const result = validateFactsResult({ ...VALID, facts }, "Main Artist");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Main Artist");
  });

  it("is case-insensitive when checking for the main entity's name", () => {
    const facts = [...VALID.facts];
    facts[0] = "main artist has won 16 grammy awards.";
    expect(validateFactsResult({ ...VALID, facts }, "Main Artist").ok).toBe(false);
  });
});

// ─── parseToolCall ────────────────────────────────────────────────────────────

describe("parseToolCall", () => {
  it("parses the real deepseek-v4-flash shape: choices[0].message.tool_calls[0].function.arguments", () => {
    // Confirmed empirically against the live model (2026-09) via a local wrangler dev run.
    const response = {
      choices: [
        {
          finish_reason: "tool_calls",
          message: {
            role: "assistant",
            content: "",
            reasoning_content: "...",
            tool_calls: [
              {
                id: "call_abc",
                type: "function",
                function: { name: "submit_round", arguments: JSON.stringify(VALID) },
              },
            ],
          },
        },
      ],
      usage: { prompt_tokens: 4977, completion_tokens: 1989, total_tokens: 6966 },
    };
    expect(parseToolCall(response)).toEqual(VALID);
  });

  it("parses a pre-parsed arguments object under tool_calls[0].arguments (fallback shape)", () => {
    const response = { tool_calls: [{ arguments: VALID }] };
    expect(parseToolCall(response)).toEqual(VALID);
  });

  it("parses a JSON string under tool_calls[0].function.arguments (fallback shape)", () => {
    const response = { tool_calls: [{ function: { arguments: JSON.stringify(VALID) } }] };
    expect(parseToolCall(response)).toEqual(VALID);
  });

  it("parses a response nested under response.tool_calls (fallback shape)", () => {
    const response = { response: { tool_calls: [{ arguments: VALID }] } };
    expect(parseToolCall(response)).toEqual(VALID);
  });

  it("returns null when there are no tool calls", () => {
    expect(parseToolCall({})).toBeNull();
    expect(parseToolCall({ tool_calls: [] })).toBeNull();
  });

  it("returns null for malformed JSON in a string arguments field", () => {
    const response = { tool_calls: [{ function: { arguments: "{not json" } }] };
    expect(parseToolCall(response)).toBeNull();
  });

  it("returns null when the tool called was reject_entity, not submit_round", () => {
    const response = {
      choices: [
        { message: { tool_calls: [{ function: { name: "reject_entity", arguments: "{}" } }] } },
      ],
    };
    expect(parseToolCall(response)).toBeNull();
  });

  it("returns null for a null/undefined response", () => {
    expect(parseToolCall(null)).toBeNull();
    expect(parseToolCall(undefined)).toBeNull();
  });
});

// ─── parseRejection ───────────────────────────────────────────────────────────

describe("parseRejection", () => {
  it("parses a reject_entity call with its reason", () => {
    const response = {
      choices: [
        {
          message: {
            tool_calls: [
              {
                function: {
                  name: "reject_entity",
                  arguments: JSON.stringify({ reason: "this is a document, not a person" }),
                },
              },
            ],
          },
        },
      ],
    };
    expect(parseRejection(response)).toEqual({ reason: "this is a document, not a person" });
  });

  it("returns null when the tool called was submit_round, not reject_entity", () => {
    const response = {
      choices: [
        {
          message: {
            tool_calls: [{ function: { name: "submit_round", arguments: JSON.stringify(VALID) } }],
          },
        },
      ],
    };
    expect(parseRejection(response)).toBeNull();
  });

  it("falls back to a generic reason when the reject_entity call has none", () => {
    const response = {
      choices: [
        { message: { tool_calls: [{ function: { name: "reject_entity", arguments: "{}" } }] } },
      ],
    };
    expect(parseRejection(response)).toEqual({ reason: "no reason given" });
  });

  it("returns null for no tool calls at all", () => {
    expect(parseRejection({})).toBeNull();
  });
});

// ─── generateFacts (env.AI.run mocked) ────────────────────────────────────────

function toolCallResponse(name: string, args: unknown) {
  return {
    choices: [
      { message: { tool_calls: [{ function: { name, arguments: JSON.stringify(args) } }] } },
    ],
  };
}

function fakeEnv(run: (...args: unknown[]) => unknown): Env {
  return {
    AI: { run } as unknown as Env["AI"],
    AI_GATEWAY_ID: "test-gateway",
    DB: {} as Env["DB"],
  };
}

const INPUT: FactGenerationInput = {
  entityType: "stand-up comedian",
  mainName: "Main Comedian",
  mainExtract: "Main entity extract text.",
  donorName: "Donor Comedian",
  donorExtract: "Donor entity extract text.",
};

describe("generateFacts", () => {
  it("returns the result on a first-try success, calling the model once", async () => {
    const run = vi.fn().mockResolvedValue(toolCallResponse("submit_round", VALID));
    const result = await generateFacts(fakeEnv(run), INPUT);
    expect(result).toEqual({
      facts: VALID.facts,
      fibIndex: VALID.fib_index,
      fibTrueSubject: VALID.fib_true_subject,
    });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("throws EntityRejectedError immediately on a first-attempt rejection, without a retry call", async () => {
    const run = vi
      .fn()
      .mockResolvedValue(toolCallResponse("reject_entity", { reason: "this is a document" }));
    await expect(generateFacts(fakeEnv(run), INPUT)).rejects.toThrow(EntityRejectedError);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("retries once on a validation failure, then succeeds", async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce(toolCallResponse("submit_round", { ...VALID, facts: ["too short"] }))
      .mockResolvedValueOnce(toolCallResponse("submit_round", VALID));
    const result = await generateFacts(fakeEnv(run), INPUT);
    expect(result.facts).toEqual(VALID.facts);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("throws EntityRejectedError if the retry attempt rejects", async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce(toolCallResponse("submit_round", { ...VALID, facts: ["too short"] }))
      .mockResolvedValueOnce(
        toolCallResponse("reject_entity", { reason: "mismatched on second look" }),
      );
    await expect(generateFacts(fakeEnv(run), INPUT)).rejects.toThrow(EntityRejectedError);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("throws a generic error if both attempts fail validation", async () => {
    const run = vi
      .fn()
      .mockResolvedValue(toolCallResponse("submit_round", { ...VALID, facts: ["too short"] }));
    await expect(generateFacts(fakeEnv(run), INPUT)).rejects.toThrow(
      /failed validation after retry/,
    );
    expect(run).toHaveBeenCalledTimes(2);
  });
});
