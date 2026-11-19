import test from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, removePlayer, startRoom, beginRound, submitAnswer, revealRound, finishRound, finishRoom } from "../src/room/room-state.js";

const lobby = () => addPlayer(addPlayer(createRoom({ id: "r1", hostId: "p1", maxPlayers: 3 }), { id: "p1", name: "Ana" }, 1), { id: "p2", name: "João" }, 2);

test("room creation validates inputs and starts empty lobby", () => {
  assert.equal(createRoom({ id: "x", hostId: "p1" }).state, "lobby");
  assert.throws(() => createRoom({ id: "x" }), TypeError);
  assert.throws(() => createRoom({ id: "x", hostId: "p1", maxPlayers: 1 }), RangeError);
});

test("players join with unique ids and room capacity is enforced", () => {
  const r = lobby();
  assert.equal(r.players.length, 2);
  assert.throws(() => addPlayer(r, { id: "p2", name: "Duplicate" }), /already/);
  const full = addPlayer(r, { id: "p3", name: "Rui" });
  assert.throws(() => addPlayer(full, { id: "p4", name: "Sara" }), /full/);
  assert.throws(() => addPlayer(r, { id: "p3", name: " " }), TypeError);
});

test("host leaving assigns next player and empty room closes", () => {
  const r = removePlayer(lobby(), "p1", 3);
  assert.equal(r.hostId, "p2");
  assert.equal(r.players.length, 1);
  const empty = removePlayer(removePlayer(lobby(), "p1"), "p2");
  assert.equal(empty.state, "finished");
  assert.equal(empty.hostId, null);
});

test("room requires two players to start", () => {
  assert.throws(() => startRoom(createRoom({ id: "r", hostId: "p" })), /two players/);
  assert.equal(startRoom(lobby(), 5).state, "playing");
});

test("round lifecycle stores player answers and reveals only by explicit state change", () => {
  let r = startRoom(lobby(), 5);
  r = beginRound(r, { id: "round-1", challengeId: "challenge-1" }, 6);
  assert.equal(r.currentRound.status, "active");
  r = submitAnswer(r, { playerId: "p1", text: "resposta", submittedAt: 7 });
  assert.equal(r.currentRound.answers.length, 1);
  assert.throws(() => submitAnswer(r, { playerId: "p1", text: "again", submittedAt: 8 }), /already answered/);
  assert.throws(() => submitAnswer(r, { playerId: "outsider", text: "no", submittedAt: 8 }), /not in this room/);
  r = revealRound(r, 9);
  assert.equal(r.currentRound.status, "revealed");
  r = finishRound(r, 10);
  assert.equal(r.currentRound.status, "finished");
  assert.equal(r.roundsPlayed, 1);
  assert.equal(beginRound(r, { id: "round-2", challengeId: "challenge-2" }, 11).currentRound.id, "round-2");
});

test("room can finish and is immutable by repeated finish", () => {
  const r = finishRoom(lobby(), 12);
  assert.equal(r.state, "finished");
  assert.equal(finishRoom(r, 13), r);
});
