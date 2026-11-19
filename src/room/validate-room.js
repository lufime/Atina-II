/** Validate a room snapshot before persistence or after loading it. */
export function validateRoomSnapshot(room) {
  const errors = [];
  if (!room || typeof room !== "object") return { valid: false, errors: ["Room snapshot must be an object"] };
  if (typeof room.id !== "string" || !room.id.trim()) errors.push("Room id is required");
  if (!["lobby", "playing", "finished"].includes(room.state)) errors.push("Unknown room state");
  if (typeof room.hostId !== "string" && room.hostId !== null) errors.push("hostId must be a string or null");
  if (!Array.isArray(room.players)) errors.push("players must be an array");
  else {
    const ids = new Set();
    for (const [i, player] of room.players.entries()) {
      if (!player || typeof player.id !== "string" || !player.id.trim()) errors.push(`players[${i}].id is invalid`);
      else if (ids.has(player.id)) errors.push(`Duplicate player id: ${player.id}`);
      else ids.add(player.id);
      if (!player || typeof player.name !== "string" || !player.name.trim()) errors.push(`players[${i}].name is invalid`);
      if (!player || !Number.isFinite(player.joinedAt)) errors.push(`players[${i}].joinedAt is invalid`);
    }
    if (room.hostId !== null && !ids.has(room.hostId)) errors.push("hostId must identify a room member");
    if (Number.isInteger(room.maxPlayers) && room.players.length > room.maxPlayers) errors.push("Room exceeds maxPlayers");
  }
  if (!Number.isFinite(room.createdAt)) errors.push("createdAt must be finite");
  if (!Number.isFinite(room.updatedAt)) errors.push("updatedAt must be finite");
  if (!Number.isSafeInteger(room.roundsPlayed) || room.roundsPlayed < 0) errors.push("roundsPlayed must be a non-negative integer");
  if (room.currentRound !== null) {
    const r = room.currentRound;
    if (!r || typeof r !== "object") errors.push("currentRound must be an object or null");
    else {
      if (typeof r.id !== "string" || !r.id.trim()) errors.push("currentRound.id is invalid");
      if (typeof r.challengeId !== "string" || !r.challengeId.trim()) errors.push("currentRound.challengeId is invalid");
      if (!["active", "revealed", "finished"].includes(r.status)) errors.push("currentRound.status is invalid");
      if (!Number.isFinite(r.startedAt)) errors.push("currentRound.startedAt is invalid");
      if (!Array.isArray(r.answers)) errors.push("currentRound.answers must be an array");
      else {
        const answered = new Set();
        for (const [i, answer] of r.answers.entries()) {
          if (!answer || !ids.has(answer.playerId)) errors.push(`answers[${i}] player is not a room member`);
          if (answer && answered.has(answer.playerId)) errors.push(`Duplicate answer by player: ${answer.playerId}`);
          if (answer) answered.add(answer.playerId);
          if (!answer || typeof answer.text !== "string" || !answer.text.trim()) errors.push(`answers[${i}].text is invalid`);
          if (!answer || !Number.isFinite(answer.submittedAt)) errors.push(`answers[${i}].submittedAt is invalid`);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
