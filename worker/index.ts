import type { Env } from "./types";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (url.pathname === "/api/questions" && request.method === "GET") {
      const date = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

      const { results } = await env.DB.prepare(
        "SELECT * FROM questions WHERE date = ? ORDER BY round_number",
      )
        .bind(date)
        .all();

      if (results.length === 0) {
        return json({ error: "No questions for this date" }, 404);
      }

      const rounds = results.map((q) => ({
        round_number: q.round_number,
        topic: q.topic,
        answer: q.answer,
        facts: JSON.parse(q.facts as string),
        fib_index: q.fib_index,
        fib_true_subject: q.fib_true_subject,
      }));

      return json({ date, rounds });
    }

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
