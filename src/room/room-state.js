export const ROOM_STATES = Object.freeze(["lobby", "playing", "finished"]);

const assertTime = (time) => { if (!Number.isFinite(time)) throw new TypeError("Timestamp must be finite"); };
const assertRoom = (room) => {
  if (!room || !ROOM_STATES.includes(room.state)) throw new TypeError("Invalid room");
  if (!Array.isArray(room.players)) throw new TypeError("Room players must be an array");
};

export function createRoom({ id, hostId, createdAt = 0, maxPlayers = 8 } = {}) {
  if (typeof id !== "string" || !id.trim() || typeof hostId !== "string" || !hostId.trim()) throw new TypeError("Room id and host id are required");
  assertTime(createdAt);
  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 32) {
    throw new RangeError("maxPlayers must be between 2 and 32");
  }
  return {
    id, state: "lobby", hostId, createdAt, maxPlayers, players: [],
    currentRound: null, roundsPlayed: 0, updatedAt: createdAt
  };
}

export function addPlayer(room, player, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.state !== "lobby") throw new Error("Players can only join a lobby");
  if (typeof player?.id !== "string" || !player.id.trim() || typeof player?.name !== "string" || !player.name.trim()) throw new TypeError("Player id and name are required");
  if (room.players.some(p => p.id === player.id)) throw new Error("Player already in room");
  if (room.players.length >= room.maxPlayers) throw new Error("Room is full");
  const nextPlayer = { id: player.id, name: player.name.trim(), joinedAt: now };
  return { ...room, players: [...room.players, nextPlayer], updatedAt: now };
}

export function removePlayer(room, playerId, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (typeof playerId !== "string" || !playerId.trim()) throw new TypeError("Player id required");
  if (!room.players.some(p => p.id === playerId)) throw new Error("Player not found");
  const players = room.players.filter(p => p.id !== playerId);
  const hostId = room.hostId === playerId ? (players[0]?.id ?? null) : room.hostId;
  return { ...room, players, hostId, state: players.length === 0 ? "finished" : room.state, updatedAt: now };
}

export function startRoom(room, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.state !== "lobby") throw new Error("Room cannot start from current state");
  if (room.players.length < 2) throw new Error("At least two players are required");
  return { ...room, state: "playing", updatedAt: now };
}

export function beginRound(room, round, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.state !== "playing") throw new Error("Room is not in play");
  if (typeof round?.id !== "string" || !round.id.trim() || typeof round?.challengeId !== "string" || !round.challengeId.trim()) throw new TypeError("Round id and challenge id are required");
  if (room.currentRound && room.currentRound.status !== "finished") throw new Error("Previous round is not finished");
  return {
    ...room,
    currentRound: { id: round.id, challengeId: round.challengeId, status: "active", startedAt: now, answers: [], revealedAt: null },
    updatedAt: now
  };
}

export function submitAnswer(room, { playerId, text, submittedAt } = {}) {
  assertRoom(room);
  assertTime(submittedAt);
  const current = room.currentRound;
  if (room.state !== "playing" || current?.status !== "active") throw new Error("No active round");
  if (typeof playerId !== "string" || !playerId.trim()) throw new TypeError("Player id is required");
  if (!room.players.some(p => p.id === playerId)) throw new Error("Player is not in this room");
  if (typeof text !== "string" || !text.trim()) throw new TypeError("Answer text is required");
  if (!Number.isFinite(submittedAt)) throw new TypeError("Answer timestamp is required");
  if (current.answers.some(a => a.playerId === playerId)) throw new Error("Player already answered");
  const answer = { playerId, text: text.trim(), submittedAt };
  return { ...room, currentRound: { ...current, answers: [...current.answers, answer] }, updatedAt: submittedAt };
}

export function revealRound(room, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.state !== "playing" || room.currentRound?.status !== "active") throw new Error("Round cannot be revealed");
  return { ...room, currentRound: { ...room.currentRound, status: "revealed", revealedAt: now }, updatedAt: now };
}

export function finishRound(room, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.currentRound?.status !== "revealed") throw new Error("Round must be revealed first");
  return { ...room, currentRound: { ...room.currentRound, status: "finished", finishedAt: now }, roundsPlayed: room.roundsPlayed + 1, updatedAt: now };
}

export function finishRoom(room, now = 0) {
  assertRoom(room);
  assertTime(now);
  if (room.state === "finished") return room;
  return { ...room, state: "finished", updatedAt: now };
}
