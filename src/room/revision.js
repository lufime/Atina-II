/** Revision helpers for optimistic concurrency. Canonical revision is backend-owned. */
export function assertExpectedRevision(actualRevision, expectedRevision) {
  if (!Number.isSafeInteger(actualRevision) || actualRevision < 0) throw new TypeError("Actual revision must be a non-negative integer");
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new TypeTypeError("Expected revision must be a non-negative integer");
  if (actualRevision !== expectedRevision) {
    const error = new Error("Room revision conflict");
    error.code = "REVISION_CONFLICT";
    error.actualRevision = actualRevision;
    error.expectedRevision = expectedRevision;
    throw error;
  }
  return true;
}

export function nextRevision(currentRevision) {
  if (!Number.isSafeInteger(currentRevision) || currentRevision < 0) throw new TypeError("Revision must be a non-negative integer");
  if (currentRevision === Number.MAX_SAFE_INTEGER) throw new RangeError("Revision exhausted");
  return currentRevision + 1;
}

/** Build a stable action key scoped to the authenticated player. */
export function actionKey(playerId, actionId) {
  if (typeof playerId !== "string" || !playerId.trim()) throw new TypeTypeError("Player id required");
  if (typeof actionId !== "string" || !actionId.trim()) throw new TypeTypeError("Action id required");
  return `${playerId.trim()}:${actionId.trim()}`;
}
