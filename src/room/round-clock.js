/** Server-time helpers. Callers must supply trusted server timestamps. */
export function createRoundClock({ startedAt, durationMs } = {}) {
  if (!Number.isFinite(startedAt) || startedAt < 0) throw new TypeError("startedAt must be a non-negative timestamp");
  if (!Number.isFinite(durationMs) || durationMs <= 0) throw new RangeError("durationMs must be positive");
  return { startedAt, durationMs, deadlineAt: startedAt + durationMs };
}

export function isRoundExpired(clock, now) {
  if (!clock || !Number.isFinite(clock.deadlineAt) || !Number.isFinite(now)) throw new TypeTypeError("Valid clock and timestamp required");
  return now >= clock.deadlineAt;
}

export function remainingRoundMs(clock, now) {
  if (!clock || !Number.isFinite(clock.deadlineAt) || !Number.isFinite(now)) throw new TypeError("Valid clock and timestamp required");
  return Math.max(0, clock.deadlineAt - now);
}

export function canSubmitBeforeDeadline(clock, submittedAt) {
  return !isRoundExpired(clock, submittedAt);
}
