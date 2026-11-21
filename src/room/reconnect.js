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
  if (!Array.isArray(room.players)) throw new TypeError("Canonical room players must be an array");
  if (!Number.isInteger(room.maxPlayers) || room.maxPlayers < 2 || room.maxPlayers > 32 || room.players.length > room.maxPlayers) throw new TypeError("Canonical room capacity is invalid");
  const playerIds = new Set();
  for (const player of room.players) {
    if (!player || typeof player.id !== "string" || !player.id.trim() || typeof player.name !== "string" || !player.name.trim() || !Number.isFinite(player.joinedAt)) throw new TypeError("Canonical player is invalid");
    if (playerIds.has(player.id)) throw new Error("Canonical room contains duplicate players");
    playerIds.add(player.id);
  }
  if (room.hostId !== null && (typeof room.hostId !== "string" || !room.hostId.trim() || (room.players.length > 0 && room.state !== "lobby" && !playerIds.has(room.hostId)))) throw new TypeError("Canonical room host is invalid");
  const publicRoom = pick(room, PUBLIC_ROOM_FIELDS);
  publicRoom.players = room.players.map(player => pick(player, PUBLIC_PLAYER_FIELDS));
  if (room.currentRound && typeof room.currentRound === "object") {
    const current = room.currentRound;
    if (typeof current.id !== "string" || !current.id.trim() || typeof current.challengeId !== "string" || !current.challengeId.trim() || !["active", "revealed", "finished"].includes(current.status) || !Number.isFinite(current.startedAt) || !Array.isArray(current.answers)) throw new TypeError("Canonical round is invalid");
    const answered = new Set();
    for (const answer of current.answers) {
      if (!answer || typeof answer.playerId !== "string" || !playerIds.has(answer.playerId) || answered.has(answer.playerId) || typeof answer.text !== "string" || !answer.text.trim() || !Number.isFinite(answer.submittedAt)) throw new TypeError("Canonical answer is invalid");
      answered.add(answer.playerId);
    }
    publicRoom.currentRound = pick(current, PUBLIC_ROUND_FIELDS);
    publicRoom.currentRound.answers = current.answers.map(answer => pick(answer, PUBLIC_ANSWER_FIELDS));
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
