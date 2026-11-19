const PUBLIC_PLAYER_FIELDS = ["id", "name", "joinedAt"];
const PUBLIC_ROOM_FIELDS = ["id", "roomId", "state", "hostId", "maxPlayers", "createdAt", "updatedAt", "roundsPlayed", "revision"];
const PUBLIC_ROUND_FIELDS = ["id", "challengeId", "status", "startedAt", "revealedAt", "finishedAt"];
const PUBLIC_ANSWER_FIELDS = ["playerId", "text", "submittedAt"];

function pick(source, fields) {
  const result = {};
  for (const field of fields) if (source?.[field] !== undefined) result[field] = source[field];
  return result;
}

/** Allowlist-only projection; private challenge fields and server internals are never copied. */
export function toPublicRoomSnapshot(room) {
  if (!room || typeof room !== "object" || !Number.isSafeInteger(room.revision) || room.revision < 0) {
    throw new TypeError("Canonical room with a non-negative revision required");
  }
  const publicRoom = pick(room, PUBLIC_ROOM_FIELDS);
  publicRoom.players = Array.isArray(room.players) ? room.players.map(player => pick(player, PUBLIC_PLAYER_FIELDS)) : [];
  if (room.currentRound && typeof room.currentRound === "object") {
    publicRoom.currentRound = pick(room.currentRound, PUBLIC_ROUND_FIELDS);
    publicRoom.currentRound.answers = Array.isArray(room.currentRound.answers)
      ? room.currentRound.answers.map(answer => pick(answer, PUBLIC_ANSWER_FIELDS))
      : [];
  } else publicRoom.currentRound = null;
  return publicRoom;
}

/** Revision-based sync: unchanged when the client is current, otherwise a public snapshot. */
export function getRoomSyncResponse(room, lastKnownRevision) {
  if (!Number.isSafeInteger(lastKnownRevision) || lastKnownRevision < 0) throw new TypeError("lastKnownRevision must be a non-negative integer");
  const snapshot = toPublicRoomSnapshot(room);
  if (lastKnownRevision === snapshot.revision) return { status: "unchanged", revision: snapshot.revision };
  return { status: "snapshot", revision: snapshot.revision, snapshot };
}
