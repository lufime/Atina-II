import test from "node:test";
import assert from "node:assert/strict";
import { applyRoomAction } from "../src/room/actions.js";

const snap = { roomId: "r1", revision: 3, state: "lobby", players: [] };
const env = { actionId: "a1", expectedRevision: 3, playerId: "p1", type: "room.join", payload: { name: "Ana" } };
const ctx = { playerId: "p1", allowedActionTypes: ["room.join"], reducer: (s, e) => ({ ...s, players: [...s.players, e.payload.name] }) };

test("action reducer advances revision on valid action", () => {
  const result = applyRoomAction(snap, env, ctx);
  assert.equal(result.snapshot.revision, 4);
  assert.deepEqual(result.snapshot.players, ["Ana"]);
  assert.equal(result.duplicate, false);
});

test("rejects stale revision and identity mismatch", () => {
  assert.throws(() => applyRoomAction(snap, { ...env, expectedRevision: 2 }, ctx), error => error.code === "REVISION_CONFLICT");
  assert.throws(() => applyRoomAction(snap, { ...env, playerId: "p2" }, ctx), /identity mismatch/);
});

test("known duplicate action returns unchanged snapshot", () => {
  const result = applyRoomAction(snap, env, { ...ctx, processedActionKeys: ["p1:a1"] });
  assert.equal(result.duplicate, true);
  assert.equal(result.snapshot, snap);
});

test("allowlist and trusted reducer are mandatory", () => {
  assert.throws(() => applyRoomAction(snap, env, { ...ctx, allowedActionTypes: [] }), /not allowed/);
  assert.throws(() => applyRoomAction(snap, env, { playerId: "p1", allowedActionTypes: ["room.join"] }), /reducer required/);
});
