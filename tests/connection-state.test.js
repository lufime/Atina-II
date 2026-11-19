import test from "node:test";
import assert from "node:assert/strict";
import { createConnectionState, markDisconnected, beginReconnect, markConnected, closeConnection, shouldRetryReconnect, reconnectDelayMs } from "../src/room/connection-state.js";

test("connection lifecycle transitions and resets retries on successful sync", () => {
  let state = createConnectionState({ playerId: "p1", lastRevision: 4, updatedAt: 100 });
  state = markDisconnected(state, 110);
  assert.equal(state.state, "disconnected");
  state = beginReconnect(state, 120);
  assert.equal(state.state, "reconnecting");
  assert.equal(state.retryAttempt, 1);
  assert.ok(shouldRetryReconnect(state));
  state = markConnected(state, 6, 130);
  assert.equal(state.state, "connected");
  assert.equal(state.lastRevision, 6);
  assert.equal(state.retryAttempt, 0);
});

test("closed connection cannot be reopened and stale sync is rejected", () => {
  const closed = closeConnection(createConnectionState({ playerId: "p1" }), 10);
  assert.throws(() => beginReconnect(closed, 11), /Closed connection/);
  const reconnecting = beginReconnect(createConnectionState({ playerId: "p1", lastRevision: 5 }), 20);
  assert.throws(() => markConnected(reconnecting, 4, 21), /Stale revision/);
});

test("retry cap and exponential delay are bounded", () => {
  let state = createConnectionState({ playerId: "p1" });
  for (let i = 0; i < 3; i++) state = beginReconnect(state, i + 1);
  assert.equal(shouldRetryReconnect(state, { maxAttempts: 3 }), false);
  assert.equal(reconnectDelayMs(1), 500);
  assert.equal(reconnectDelayMs(5), 8000);
  assert.equal(reconnectDelayMs(8), 15000);
});

test("invalid states and values are rejected", () => {
  assert.throws(() => createConnectionState({ playerId: "" }), /playerId/);
  assert.throws(() => reconnectDelayMs(0), /positive integer/);
  assert.throws(() => markDisconnected({ state: "bad" }, 1), /Invalid connection state/);
});
