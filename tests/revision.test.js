import test from "node:test";
import assert from "node:assert/strict";
import { assertExpectedRevision, nextRevision, actionKey } from "../src/room/revision.js";

test("revision guard allows matching revision and rejects stale snapshots", () => {
  assert.equal(assertExpectedRevision(4, 4), true);
  assert.throws(() => assertExpectedRevision(5, 4), error => error.code === "REVISION_CONFLICT" && error.actualRevision === 5 && error.expectedRevision === 4);
});

test("revision increments safely", () => {
  assert.equal(nextRevision(0), 1);
  assert.equal(nextRevision(12), 13);
  assert.throws(() => nextRevision(-1), TypeError);
  assert.throws(() => nextRevision(Number.MAX_SAFE_INTEGER), RangeError);
});

test("action keys scope client idempotency keys to participant", () => {
  assert.equal(actionKey("p1", "a1"), "p1:a1");
  assert.notEqual(actionKey("p1", "a1"), actionKey("p2", "a1"));
  assert.throws(() => actionKey("", "a1"), TypeError);
  assert.throws(() => actionKey("p1", " "), TypeError);
});
