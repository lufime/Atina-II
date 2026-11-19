/** Validate an action against the canonical room state and authenticated user.
 * This is a pure preflight validator; server persistence must repeat checks atomically.
 */
export function validateRoomAction(room, action, authenticatedPlayerId, now) {
  const errors = [];
  if (!room || typeof room !== "object") return { valid: false, errors: ["Room snapshot required"] };
  if (!action || typeof action !== "object") return { valid: false, errors: ["Action required"] };
  if (typeof authenticatedPlayerId !== "string" || !authenticatedPlayerId.trim()) errors.push("Authenticated identity required");
  if (!Number.isFinite(now)) errors.push("Trusted server timestamp required");
  if (typeof action.actionId !== "string" || !action.actionId.trim()) errors.push("actionId required");
  if (!Number.isSafeInteger(room.revision) || room.revision < 0) errors.push("Room revision invalid");\n  if (!Array.isArray(room.players)) errors.push("Room players invalid");\n  if (!Number.isInteger(room.maxPlayers) || room.maxPlayers < 2 || room.maxPlayers > 32) errors.push("Room capacity invalid");\n  if (Array.isArray(room.players) && Number.isInteger(room.maxPlayers) && room.players.length > room.maxPlayers) errors.push("Room exceeds capacity");
  if (!Number.isSafeInteger(action.expectedRevision) || action.expectedRevision < 0) errors.push("expectedRevision invalid");
  if (Number.isSafeInteger(room.revision) && Number.isSafeInteger(action.expectedRevision) && action.expectedRevision !== room.revision) errors.push("Revision conflict");
  if (action.payload !== undefined && (!action.payload || typeof action.payload !== "object" || Array.isArray(action.payload))) errors.push("Action payload must be an object");
  const host = room.hostId === authenticatedPlayerId;
  const member = Array.isArray(room.players) && room.players.some(p => p?.id === authenticatedPlayerId);
  const type = action.type;
  switch (type) {
    case "room.join":
      if (room.state !== "lobby") errors.push("Join only allowed in lobby");
      if (member) errors.push("Already a room member");
      if (!action.payload || typeof action.payload.name !== "string" || !action.payload.name.trim()) errors.push("Display name required");
      if (Array.isArray(room.players) && Number.isInteger(room.maxPlayers) && room.players.length >= room.maxPlayers) errors.push("Room is full");
      break;
    case "room.leave":
      if (!member) errors.push("Only members can leave");
      if (room.state === "finished") errors.push("Room is finished");
      break;
    case "room.start":
      if (!host) errors.push("Only host can start room");
      if (room.state !== "lobby") errors.push("Room must be in lobby");
      if (!Array.isArray(room.players) || room.players.length < 2) errors.push("At least two members required");
      break;
    case "round.start":
      if (!host) errors.push("Only host can start a round");
      if (room.state !== "playing") errors.push("Room must be playing");
      if (room.currentRound && room.currentRound.status !== "finished") errors.push("Previous round must be finished");
      if (!action.payload || typeof action.payload.challengeId !== "string" || !action.payload.challengeId.trim()) errors.push("Challenge id required");
      break;
    case "answer.submit":
      if (!member) errors.push("Only members can answer");
      if (room.state !== "playing" || room.currentRound?.status !== "active") errors.push("No active round");
      if (room.currentRound?.answers?.some(a => a.playerId === authenticatedPlayerId)) errors.push("Already answered");
      if (typeof action.payload?.text !== "string" || !action.payload.text.trim()) errors.push("Answer text required");
      if (room.currentRound?.deadlineAt != null && now >= room.currentRound.deadlineAt) errors.push("Answer deadline passed");
      break;
    case "round.reveal":
      if (!host) errors.push("Only host can reveal");
      if (room.state !== "playing" || room.currentRound?.status !== "active") errors.push("Round cannot be revealed");
      break;
    case "round.finish":
      if (!host) errors.push("Only host can finish round");
      if (room.currentRound?.status !== "revealed") errors.push("Round must be revealed");
      break;
    case "room.finish":
      if (!host) errors.push("Only host can finish room");
      if (room.state === "finished") errors.push("Room already finished");
      break;
    default:
      errors.push("Unknown action type");
  }
  return { valid: errors.length === 0, errors };
}
