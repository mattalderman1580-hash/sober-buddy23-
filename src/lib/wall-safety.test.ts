import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkWallPrivacy, containsEmail, containsPhone } from "./wall-safety.ts";

describe("wall privacy checks", () => {
  it("blocks phone numbers in common formats", () => {
    for (const text of [
      "call me 555-123-4567",
      "(555) 123-4567 anytime",
      "+1 555 123 4567",
      "text 5551234567",
      "555.1234 please",
    ]) {
      assert.equal(containsPhone(text), true, text);
      assert.ok(checkWallPrivacy(text).blocked.length > 0, text);
    }
  });

  it("does not flag short numbers or dates", () => {
    assert.equal(containsPhone("Day 30 today, praise God"), false);
    assert.equal(containsPhone("clean since 2025-03-14"), false);
    assert.equal(containsPhone("Psalm 34:17-18"), false);
  });

  it("blocks email addresses", () => {
    assert.equal(containsEmail("reach me at jo@example.com"), true);
    assert.ok(checkWallPrivacy("jo@example.com").blocked.length > 0);
  });

  it("warns (does not block) on street addresses and links", () => {
    const r = checkWallPrivacy("Meeting at 123 Main St tonight, see https://x.org");
    assert.equal(r.blocked.length, 0);
    assert.equal(r.warnings.length, 2);
  });

  it("passes an ordinary prayer request", () => {
    const r = checkWallPrivacy("Please pray for strength tonight. Day 12 and tired.");
    assert.deepEqual(r, { blocked: [], warnings: [] });
  });
});
