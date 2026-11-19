const PUBLIC_EVENT_TYPES = new Set([
  "room.updated", "player.joined", "player.left", "round.started",
  "answer.submitted", "round.revealed", "round.finished", "room.finished"
]);
const PUBLIC_PAYLOAD_KEYS = new Set([
  "roomId", "roomState", "hostId", "playerId", "playerName", "playerCount",
  "maxPlayers", "roundId", "challengeId", "roundStatus", "answerCount",
  "submittedAt", "startedAt", "finishedAt", "winnerId", "scores"
]);

/** Validate an ordered, public event. Private challenge/solution/auth data is excluded. */
export function validateRoomEvent(event) {
  if (!event || typeof event !== "object") return { valid: false, errors: ["Event must be an object"] };
  const errors = [];
  if (typeof event.roomId !== "string" || !event.roomId.trim()) errors.push("roomId required");
  if (!Number.isSafeInteger(event.revision) || event.revision < 1) errors.push("revision must be a positive safe integer");
  if (!PUBLIC_EVENT_TYPES.has(event.type)) errors.push("Unsupported public event type");
  if (!Number.isFinite(event.serverTime)) errors.push("serverTime must be finite");
  if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) errors.push("payload must be an object");
  else {
    for (const key of Object.keys(event.payload)) {
      if (!PUBLIC_PAYLOAD_KEYS.has(key)) errors.push(`Forbidden or unknown public payload key: ${key}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/** Applies events only in strict revision order; callers resync on a gap. */
export function applyRoomEvent(lastRevision, event) {
  if (!Number.isSafeInteger(lastRevision) || lastRevision < 0) throw new TypeError("lastRevision must be a non-negative safe integer");
  const validation = validateRoomEvent(event);
  if (!validation.valid) return { status: "invalid", errors: validation.errors, revision: lastRevision };
  if (event.revision <= lastRevision) return { status: "duplicate", revision: lastRevision };
  const expectedRevision = lastRevision + 1;
  if (event.revision !== expectedRevision) return { status: "gap", revision: lastRevision, expectedRevision, receivedRevision: event.revision };
  return { status: "applied", revision: event.revision, event };
}
