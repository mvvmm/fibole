import assert from "node:assert/strict";

const origin = process.argv[2];
assert(origin, "Usage: pnpm check:app <origin>");

async function get(path, options) {
  return fetch(new URL(path, origin), { signal: AbortSignal.timeout(15_000), ...options });
}

const home = await get("/");
assert.equal(home.status, 200);
const html = await home.text();
assert.match(html, /<title>Fibole/);

const assets = [...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css))"/g)].map((m) => m[1]);
assert(assets.length >= 2, "Expected built JavaScript and CSS assets");
for (const asset of assets) {
  const response = await get(asset);
  assert.equal(response.status, 200, `Asset failed: ${asset}`);
  assert.match(
    response.headers.get("content-type"),
    asset.endsWith(".css") ? /text\/css/ : /javascript/,
  );
  await response.body?.cancel();
}

const response = await get("/api/questions");
assert.equal(response.status, 200);
const questions = await response.json();
assert.match(questions.date, /^\d{4}-\d{2}-\d{2}$/);
assert.deepEqual(
  questions.rounds.map((r) => r.round_number),
  [1, 2, 3],
);
for (const round of questions.rounds) {
  assert.equal(round.facts.length, 4);
  assert(round.facts.every((fact) => typeof fact === "string" && fact.length > 0));
  assert(round.answer && round.topic && round.fib_true_subject);
  assert(Number.isInteger(round.fib_index) && round.fib_index >= 0 && round.fib_index <= 3);
}

const missing = await get("/api/not-found");
assert.equal(missing.status, 404);
assert.equal((await missing.json()).error, "Not found");
const options = await get("/api/questions", { method: "OPTIONS" });
assert.equal(options.status, 200);
assert.equal(options.headers.get("access-control-allow-origin"), "*");
const fallback = await get("/unrecognized-page");
assert.equal(fallback.status, 200);
assert.match(await fallback.text(), /<title>Fibole/);

console.log(
  JSON.stringify({
    origin,
    date: questions.date,
    rounds: questions.rounds.length,
    assets: assets.length,
    checks: "passed",
  }),
);
