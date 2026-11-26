import { test } from "node:test";
import assert from "node:assert/strict";
import { extractText } from "../src/services/ingest.js";

test("txt is decoded", async () => {
  const text = await extractText("brief.txt", Buffer.from("Hello client", "utf8"));
  assert.equal(text, "Hello client");
});

test("unsupported type is rejected with status 400", async () => {
  await assert.rejects(() => extractText("brief.exe", Buffer.from("x")), (error) => error.status === 400);
});

test("empty file is rejected with status 400", async () => {
  await assert.rejects(() => extractText("brief.txt", Buffer.from("   ")), (error) => error.status === 400);
});

test("malformed PDF is rejected with a helpful message", async () => {
  await assert.rejects(
    () => extractText("brief.pdf", Buffer.from("%PDF-1.4\n%%EOF")),
    (error) => error.status === 400 && /Could not read this PDF/.test(error.message)
  );
});
