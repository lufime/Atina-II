import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyRoomEvent, validateRoomEvent } from "../src/room/event-stream.js";

const event = (revision, extra = {}) => ({
  roomId: "room-1", revision, type: "player.joined", serverTime: 1234,
  payload: { playerId: "p-1", playerName: "Ana", playerCount: 2 }, ...extra
});

describe("public room event stream", () => {
  it("applies exactly the next revision", () => {
    assert.equal(applyRoomEvent(4, event(5)).status, "applied");
  });
  it("ignores duplicate and stale revisions", () => {
    assert.equal(applyRoomEvent(5, event(5)).status, "duplicate");
    assert.equal(applyRoomEvent(5, event(4)).status, "duplicate");
  });
  it("signals a revision gap for resynchronization", () => {
    const result = applyRoomEvent(5, event(7));
    assert.equal(result.status, "gap");
    assert.equal(result.expectedRevision, 6);
  });
  it("rejects private or unknown payload fields", () => {
    const result = validateRoomEvent(event(1, { payload: { solution: "secret" } }));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes("Forbidden")));
  });
  it("rejects unsupported event types and malformed revisions", () => {
    assert.equal(validateRoomEvent(event(0, { type: "secret.revealed" })).valid, false);
    assert.equal(validateRoomEvent(event(-1)).valid, false);
  });
  it("does not accept array payloads", () => {
    assert.equal(validateRoomEvent(event(1, { payload: [] })).valid, false);
  });
  it("treats max-safe revision as duplicate without overflow", () => {
    assert.equal(applyRoomEvent(Number.MAX_SAFE_INTEGER, event(Number.MAX_SAFE_INTEGER)).status, "duplicate");
  });
});
