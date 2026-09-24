import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { backupFileName, buildBackup, parseBackup } from "./backup.ts";

describe("backup file", () => {
  it("names files by local date", () => {
    assert.equal(backupFileName(new Date(2026, 8, 4)), "sober-buddy-backup-2026-09-04.json");
  });

  it("round-trips data fields and drops functions and chat", () => {
    const file = buildBackup(
      {
        displayName: "Sam",
        journal: [{ id: "1", at: "x", body: "hi" }],
        chat: [{ id: "c" }],
        savePlan: () => {},
      },
      6,
      new Date("2026-01-01T00:00:00Z"),
    );
    assert.equal(file.app, "sober-buddy");
    assert.equal(file.version, 6);
    assert.equal("chat" in file.data, false);
    assert.equal("savePlan" in file.data, false);
    const parsed = parseBackup(JSON.stringify(file), 6);
    assert.ok(parsed.ok);
    if (parsed.ok) {
      assert.equal(parsed.data.displayName, "Sam");
      assert.equal(parsed.version, 6);
    }
  });

  it("rejects garbage, other apps, and newer versions", () => {
    assert.equal(parseBackup("not json", 6).ok, false);
    assert.equal(parseBackup("[]", 6).ok, false);
    assert.equal(parseBackup(JSON.stringify({ app: "other", version: 1, data: {} }), 6).ok, false);
    assert.equal(
      parseBackup(JSON.stringify({ app: "sober-buddy", version: 9, data: { displayName: "a" } }), 6)
        .ok,
      false,
    );
    assert.equal(parseBackup(JSON.stringify({ app: "sober-buddy", version: 5, data: {} }), 6).ok, false);
  });

  it("accepts older versions and drops wrongly-typed fields", () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: "sober-buddy",
        version: 4,
        data: { displayName: "Ana", journal: "oops", checkins: [{ id: "a" }, 3, null] },
      }),
      6,
    );
    assert.ok(parsed.ok);
    if (parsed.ok) {
      assert.equal(parsed.version, 4);
      assert.equal("journal" in parsed.data, false);
      assert.deepEqual(parsed.data.checkins, [{ id: "a" }]);
    }
  });
});
