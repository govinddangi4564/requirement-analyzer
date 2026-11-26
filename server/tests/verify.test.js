import { test } from "node:test";
import assert from "node:assert/strict";
import { findUngroundedFeatures } from "../src/services/verify.js";
import { makeAnalysis } from "./helpers.js";

const SOURCE = "Users must log in with email and password.\nAdmins can export reports.";

test("grounded quote passes", () => {
  assert.deepEqual(findUngroundedFeatures(makeAnalysis(), SOURCE), []);
});

test("quote matches across whitespace and case", () => {
  const analysis = makeAnalysis("users   MUST log\nin with email and password.");
  assert.deepEqual(findUngroundedFeatures(analysis, SOURCE), []);
});

test("invented quote is flagged", () => {
  const problems = findUngroundedFeatures(makeAnalysis("Users can pay with cryptocurrency."), SOURCE);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Login/);
});

test("empty quote is flagged", () => {
  const problems = findUngroundedFeatures(makeAnalysis("   "), SOURCE);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /empty/);
});
