import test from "node:test";
import assert from "node:assert/strict";
import { createRoom, addPlayer, removePlayer, startRoom, beginRound, submitAnswer, revealRound, finishRound, finishRoom } from "../src/room/room-state.js";

const lobby = () => addPlayer(addPlayer(createRoom({ id: "r1", hostId: "p1", maxPlayers: 3 }), { id: "p1", name: "Ana" }, 1), { id: "p2", name: "João" }, 2);

test("room creation validates inputs and starts empty lobby", () => {
  const empty = createRoom({ id: "x", hostId: "p1" });
  assert.equal(empty.state, "lobby");
  assert.equal(addPlayer(empty, { id: "p1", name: "Ana" }, 1).players.length, 1);
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

test("rejects non-string player names instead of throwing on trim", () => {
  const room = createRoom({ id: "r", hostId: "p1" });
  assert.throws(() => addPlayer(room, { id: "p1", name: 42 }), TypeError);
  assert.throws(() => addPlayer(room, { id: 42, name: "Ana" }), TypeError);
  assert.throws(() => removePlayer(room, 42), TypeError);
});

test("answers require a finite timestamp and valid player id", () => {
  const active = beginRound(startRoom(lobby()), { id: "round-1", challengeId: "c1" });
  assert.throws(() => submitAnswer(active, { playerId: 42, text: "answer", submittedAt: 3 }), TypeError);
  assert.throws(() => submitAnswer(active, { playerId: "p1", text: "answer", submittedAt: NaN }), TypeError);
});

test("room transitions reject invalid timestamps",()=>{
 assert.throws(()=>createRoom({id:"r",hostId:"p",createdAt:Infinity}),TypeError);
 assert.throws(()=>addPlayer(createRoom({id:"r",hostId:"p"}),{id:"p",name:"Ana"},NaN),TypeError);
 assert.throws(()=>removePlayer(lobby(),"p1",Infinity),TypeError);
 assert.throws(()=>startRoom(lobby(),NaN),TypeError);
 assert.throws(()=>beginRound(startRoom(lobby()),{id:"round",challengeId:"c"},Infinity),TypeError);
 assert.throws(()=>revealRound(beginRound(startRoom(lobby()),{id:"round",challengeId:"c"}),NaN),TypeError);
});


test("room transitions reject inconsistent snapshots", () => {
  const valid = lobby();
  assert.throws(() => startRoom({ ...valid, hostId: "missing" }), /host must be a member/);
  assert.throws(() => startRoom({ ...valid, players: [valid.players[0], valid.players[0]] }), /Duplicate player/);
  assert.throws(() => startRoom({ ...valid, maxPlayers: 1 }), /Invalid room capacity/);
  assert.throws(() => startRoom({ ...valid, currentRound: { id: "x", challengeId: "c", status: "active", startedAt: 0, answers: [{ playerId: "", text: "a", submittedAt: 1 }] } }), /Invalid round answer/);
});

test("round snapshot rejects duplicate or non-member answers and missing finishedAt", () => {
  const active = beginRound(startRoom(lobby()), { id: "round-1", challengeId: "c1" });
  const answer = { playerId: "p1", text: "ok", submittedAt: 1 };
  assert.throws(() => revealRound({ ...active, currentRound: { ...active.currentRound, answers: [answer, answer] } }), /Invalid round answer/);
  assert.throws(() => revealRound({ ...active, currentRound: { ...active.currentRound, answers: [{ ...answer, playerId: "outside" }] } }), /Invalid round answer/);
  const invalidFinished = { ...active, currentRound: { ...active.currentRound, status: "finished", revealedAt: 2 } };
  assert.throws(() => beginRound(invalidFinished, { id: "next", challengeId: "c2" }), /Invalid round finish timestamp/);
});


test("player departure during active round removes stale answer and ends undersized room", () => {
  let r = beginRound(startRoom(lobby(), 5), { id: "round-1", challengeId: "c1" }, 6);
  r = submitAnswer(r, { playerId: "p1", text: "answer", submittedAt: 7 });
  r = removePlayer(r, "p1", 8);
  assert.equal(r.hostId, "p2");
  assert.equal(r.players.length, 1);
  assert.equal(r.state, "finished");
  assert.deepEqual(r.currentRound.answers, []);
});

test("leaving player answer is removed while room remains playable", () => {
  const r = beginRound(startRoom(lobby(), 5), { id: "round-1", challengeId: "c1" }, 6);
  const answered = submitAnswer(r, { playerId: "p1", text: "answer", submittedAt: 7 });
  const next = removePlayer(answered, "p2", 8);
  assert.equal(next.state, "playing");
  assert.equal(next.hostId, "p1");
  assert.deepEqual(next.currentRound.answers, [{ playerId: "p1", text: "answer", submittedAt: 7 }]);
});
