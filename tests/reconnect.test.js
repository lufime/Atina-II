import test from "node:test";
import assert from "node:assert/strict";
import { getRoomSyncResponse, toPublicRoomSnapshot } from "../src/room/reconnect.js";

const room = {
  id: "room1", state: "playing", hostId: "p1", maxPlayers: 8, revision: 6,
  players: [{ id: "p1", name: "Ana", joinedAt: 10, authToken: "secret" }],
  currentRound: { id: "round1", challengeId: "c42", status: "active", startedAt: 11, solution: "hidden", internalNotes: "private", answers: [{ playerId: "p1", text: "answer", submittedAt: 12, extra: "private" }] },
  serverSecret: "do-not-send"
};

test("sync reports unchanged when client revision is current", () => {
  assert.deepEqual(getRoomSyncResponse(room, 6), { status: "unchanged", revision: 6 });
});

test("sync sends allowlisted public snapshot for stale client", () => {
  const response = getRoomSyncResponse(room, 3);
  assert.equal(response.status, "snapshot");
  assert.equal(response.snapshot.revision, 6);
  assert.equal(response.snapshot.players[0].authToken, undefined);
  assert.equal(response.snapshot.currentRound.solution, undefined);
  assert.equal(response.snapshot.currentRound.internalNotes, undefined);
  assert.equal(response.snapshot.currentRound.answers[0].extra, undefined);
  assert.equal(response.snapshot.serverSecret, undefined);
});

test("public projection does not mutate canonical snapshot", () => {
  const projected = toPublicRoomSnapshot(room);
  assert.equal(projected.currentRound.answers.length, 1);
  assert.equal(room.currentRound.solution, "hidden");
});

test("rejects malformed revision inputs", () => {
  assert.throws(() => getRoomSyncResponse(room, -1), /non-negative integer/);
  assert.throws(() => toPublicRoomSnapshot({ ...room, revision: NaN }), /revision required/);
});


test("public snapshot rejects invalid canonical room structure", () => {
  assert.throws(() => toPublicRoomSnapshot({ ...room, players: [{}] }), /Canonical player is invalid/);
  assert.throws(() => toPublicRoomSnapshot({ ...room, hostId: "missing" }), /host is invalid/);
  assert.throws(() => toPublicRoomSnapshot({ ...room, currentRound: { ...room.currentRound, answers: [{}] } }), /Canonical answer is invalid/);
});
