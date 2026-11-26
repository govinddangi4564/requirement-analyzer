import { test } from "node:test";
import assert from "node:assert/strict";
import { AnalysisSchema, FeatureSchema } from "../src/schemas/analysis.js";
import { makeAnalysis } from "./helpers.js";

test("priority spellings are normalized", () => {
  assert.equal(FeatureSchema.parse({ name: "a", priority: "must", sourceQuote: "q" }).priority, "Must");
  assert.equal(FeatureSchema.parse({ name: "a", priority: "wont", sourceQuote: "q" }).priority, "Won't");
});

test("unknown priority is rejected", () => {
  assert.equal(FeatureSchema.safeParse({ name: "a", priority: "Urgent", sourceQuote: "q" }).success, false);
});

test("prototype property names are not treated as priorities", () => {
  assert.equal(FeatureSchema.safeParse({ name: "a", priority: "constructor", sourceQuote: "q" }).success, false);
});

test("full analysis object validates", () => {
  assert.equal(AnalysisSchema.safeParse(makeAnalysis()).success, true);
});
