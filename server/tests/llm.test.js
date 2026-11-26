import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze, AnalysisError, MAX_ATTEMPTS } from "../src/services/llm.js";
import { makeAnalysis, scripted } from "./helpers.js";

const SOURCE = "Users must log in with email and password.";

test("returns grounded result on first try", async () => {
  const { generate, calls } = scripted([JSON.stringify(makeAnalysis())]);
  const result = await analyze(SOURCE, generate);
  assert.equal(result.features[0].name, "Login");
  assert.equal(calls.length, 1);
});

test("retries after invalid JSON and ungrounded output", async () => {
  const invented = JSON.stringify(makeAnalysis("Users can pay with cryptocurrency."));
  const good = JSON.stringify(makeAnalysis());
  const { generate, calls } = scripted(["not json at all", invented, good]);

  const result = await analyze(SOURCE, generate);

  assert.equal(result.features[0].sourceQuote, "Users must log in with email and password.");
  assert.equal(calls.length, 3);
  assert.match(calls[1], /not valid JSON/);
  assert.match(calls[2], /not copied verbatim/);
});

test("throws AnalysisError after max attempts", async () => {
  const invented = JSON.stringify(makeAnalysis("Nothing like this exists."));
  const { generate, calls } = scripted(Array(MAX_ATTEMPTS).fill(invented));

  await assert.rejects(() => analyze(SOURCE, generate), AnalysisError);
  assert.equal(calls.length, MAX_ATTEMPTS);
});

test("empty input is rejected without calling the model", async () => {
  const { generate, calls } = scripted([]);
  await assert.rejects(() => analyze("   ", generate));
  assert.equal(calls.length, 0);
});
