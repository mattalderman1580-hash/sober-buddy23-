import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  daysSinceLastSlip,
  nextMilestone,
  pendingCelebration,
  reachedMilestones,
} from "./milestones.ts";

const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe("milestones", () => {
  it("reaches nothing on day zero and 24 hours on day one", () => {
    assert.deepEqual(reachedMilestones("2026-01-01", at("2026-01-01")), []);
    assert.deepEqual(
      reachedMilestones("2026-01-01", at("2026-01-02")).map((m) => m.key),
      ["d1"],
    );
  });

  it("walks day milestones then yearly anniversaries", () => {
    const keys = reachedMilestones("2023-01-01", at("2026-01-02")).map((m) => m.key);
    assert.deepEqual(keys, ["d1", "d7", "d30", "d60", "d90", "d180", "y1", "y2", "y3"]);
  });

  it("reports the next milestone with days away and progress", () => {
    const next = nextMilestone("2026-01-01", at("2026-01-20"));
    assert.equal(next?.key, "d30");
    assert.equal(next?.daysAway, 11);
    assert.ok(next && next.progress > 0 && next.progress < 1);
  });

  it("ignores invalid start dates", () => {
    assert.equal(nextMilestone("", at("2026-01-01")), null);
    assert.deepEqual(reachedMilestones("nope"), []);
  });

  it("celebrates only the most recent milestone and marks the rest seen", () => {
    const r = pendingCelebration("2025-01-01", [], at("2025-04-15"));
    assert.equal(r.celebrate?.key, "d90");
    assert.deepEqual(r.markSeen, ["d1", "d7", "d30", "d60", "d90"]);
  });

  it("does not celebrate again once the latest is seen", () => {
    const r = pendingCelebration("2025-01-01", ["d90"], at("2025-04-15"));
    assert.equal(r.celebrate, null);
    assert.deepEqual(r.markSeen, ["d1", "d7", "d30", "d60"]);
  });

  it("counts days since the last slip after the start date only", () => {
    const now = at("2026-03-10");
    assert.equal(daysSinceLastSlip("2026-01-01", [], now), null);
    assert.equal(
      daysSinceLastSlip("2026-01-01", [{ at: "2025-12-01T10:00:00" }], now),
      null,
    );
    assert.equal(
      daysSinceLastSlip(
        "2026-01-01",
        [{ at: "2026-03-01T22:00:00" }, { at: "2026-02-01T10:00:00" }],
        now,
      ),
      9,
    );
  });
});
