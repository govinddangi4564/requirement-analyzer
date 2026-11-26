import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/app.js";

// These tests only exercise paths that return before touching the database.
let server;
let base;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("unknown route returns JSON 404", async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: "Not found" });
});

test("invalid analysis id returns 404 without querying the database", async () => {
  const res = await fetch(`${base}/api/analyses/not-an-id`);
  assert.equal(res.status, 404);
});

test("creating an analysis with no text returns 400", async () => {
  const res = await fetch(`${base}/api/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "   " }),
  });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test("malformed JSON body returns 400", async () => {
  const res = await fetch(`${base}/api/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json",
  });
  assert.equal(res.status, 400);
});
