import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canTransition } from "./index.js";

describe("job state machine", () => {
  it("allows the happy path", () => {
    const path = [
      ["REQUESTED", "MATCHED"],
      ["MATCHED", "CONFIRMED"],
      ["CONFIRMED", "IN_PROGRESS"],
      ["IN_PROGRESS", "DONE_PENDING_CONFIRM"],
      ["DONE_PENDING_CONFIRM", "FOLLOW_UP_SENT"],
      ["FOLLOW_UP_SENT", "COMPLETED"],
    ] as const;
    for (const [from, to] of path) assert.equal(canTransition(from, to), true);
  });

  it("rejects skips and backwards moves", () => {
    assert.equal(canTransition("REQUESTED", "COMPLETED"), false);
    assert.equal(canTransition("MATCHED", "REQUESTED"), false);
    assert.equal(canTransition("COMPLETED", "CANCELLED"), false);
  });

  it("supports the rework loop", () => {
    assert.equal(canTransition("FOLLOW_UP_SENT", "REWORK_REQUESTED"), true);
    assert.equal(canTransition("REWORK_REQUESTED", "REMATCHED"), true);
    assert.equal(canTransition("REMATCHED", "CONFIRMED"), true);
  });
});
