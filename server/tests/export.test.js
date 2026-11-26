import { test } from "node:test";
import assert from "node:assert/strict";
import { toMarkdown } from "../src/services/export.js";
import { makeAnalysis } from "./helpers.js";

test("markdown contains sections and features", () => {
  const markdown = toMarkdown(makeAnalysis(), "Bakery");
  assert.match(markdown, /^# Bakery/);
  assert.match(markdown, /## Objectives/);
  assert.match(markdown, /## Clarifications needed from client/);
  assert.match(markdown, /Login \(Must\)/);
});

test("empty sections are marked", () => {
  const analysis = makeAnalysis();
  analysis.milestones = [];
  assert.match(toMarkdown(analysis), /_None found_/);
});
