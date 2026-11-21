import test from "node:test";
import assert from "node:assert/strict";
import { createRoundClock, isRoundExpired, remainingRoundMs, canSubmitBeforeDeadline } from "../src/room/round-clock.js";

test("round clock uses explicit start time and duration", () => {
  const clock = createRoundClock({ startedAt: 1000, durationMs: 15000 });
  assert.equal(clock.deadlineAt, 16000);
  assert.equal(remainingRoundMs(clock, 4000), 12000);
});

test("remaining time clamps to zero and deadline is inclusive", () => {
  const clock = createRoundClock({ startedAt: 50, durationMs: 10 });
  assert.equal(remainingRoundMs(clock, 100), 0);
  assert.equal(isRoundExpired(clock, 59), false);
  assert.equal(isRoundExpired(clock, 60), true);
});

test("answer timing is checked against the deadline", () => {
  const clock = createRoundClock({ startedAt: 0, durationMs: 100 });
  assert.equal(canSubmitBeforeDeadline(clock, 99), true);
  assert.equal(canSubmitBeforeDeadline(clock, 100), false);
});

test("clock input validation", () => {
  assert.throws(() => createRoundClock({ startedAt: -1, durationMs: 10 }), TypeError);
  assert.throws(() => createRoundClock({ startedAt: 1, durationMs: 0 }), RangeError);
  assert.throws(() => remainingRoundMs(null, 5), TypeError);
});
