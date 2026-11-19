import { assertExpectedRevision, nextRevision, actionKey } from "./revision.js";
/** Pure reducer for validated, authenticated room action envelopes.
 * Caller must validate identity, permissions, deadlines and idempotency server-side.
 */
export function applyRoomAction(snapshot, envelope, context = {}) {
  if (!snapshot || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0) throw new TypeError("Valid room snapshot required");
  if (!envelope || typeof envelope.actionId !== "string" || !envelope.actionId.trim()) throw new TypeError("actionId required");
  if (!envelope.type || typeof envelope.type !== "string") throw new TypeError("Action type required");
  if (typeof context.playerId !== "string" || !context.playerId.trim()) throw new TypeError("Authenticated player identity required");
  if (envelope.playerId && context.playerId !== envelope.playerId) throw new Error("Authenticated identity mismatch");
  const key = actionKey(context.playerId, envelope.actionId);
  const knownKeys = context.processedActionKeys ?? [];
  // Check deduplication before revision conflict: retries may arrive after state advanced.
  if (knownKeys.includes(key)) return { snapshot, duplicate: true, actionKey: key };
  assertExpectedRevision(snapshot.revision, envelope.expectedRevision);
  const allowed = context.allowedActionTypes ?? [];
  if (!allowed.includes(envelope.type)) throw new Error("Action type is not allowed");
  if (typeof context.reducer !== "function") throw new Error("Trusted action reducer required");
  const changed = context.reducer(snapshot, envelope);
  if (!changed || changed === snapshot) throw new Error("Action did not produce a state change");
  return {
    snapshot: { ...changed, revision: nextRevision(snapshot.revision) },
    duplicate: false,
    actionKey: key
  };
}
