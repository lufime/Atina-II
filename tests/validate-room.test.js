import test from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, startRoom, beginRound, submitAnswer } from "../src/room/room-state.js";
import { validateRoomSnapshot } from "../src/room/validate-room.js";

const validRoom = () => {
  let room = createRoom({ id: "r1", hostId: "p1", createdAt: 100 });
  room = addPlayer(room, { id: "p1", name: "Ana" }, 101);
  room = addPlayer(room, { id: "p2", name: "João" }, 102);
  room = startRoom(room, 110);
  room = beginRound(room, { id: "round1", challengeId: "c1" }, 120);
  room = submitAnswer(room, { playerId: "p1", text: "Resposta", submittedAt: 125 });
  return room;
};

test("accepts a valid canonical snapshot", () => {
  assert.deepEqual(validateRoomSnapshot(validRoom()), { valid: true, errors: [] });
});

test("detects duplicate players and invalid host", () => {
  const room = validRoom();
  const bad = { ...room, hostId: "missing", players: [...room.players, room.players[0]] };
  const result = validateRoomSnapshot(bad);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Duplicate player")));
  assert.ok(result.errors.includes("hostId must identify a room member"));
});

test("detects answers from outsiders, duplicate answers, and bad timestamps", () => {
  const room = validRoom();
  const bad = { ...room, currentRound: { ...room.currentRound, answers: [
    ...room.currentRound.answers,
    { playerId: "intruder", text: "x", submittedAt: NaN },
    { playerId: "p1", text: "duplicate", submittedAt: 130 }
  ] } };
  const result = validateRoomSnapshot(bad);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("not a room member")));
  assert.ok(result.errors.some(e => e.includes("Duplicate answer")));
  assert.ok(result.errors.some(e => e.includes("submittedAt")));
});

test("invalid room objects return structured errors", () => {
  assert.deepEqual(validateRoomSnapshot(null), { valid: false, errors: ["Room snapshot must be an object"] });
});
