export const CONNECTION_STATES = Object.freeze(["connected", "disconnected", "reconnecting", "closed"]);

export function createConnectionState({ playerId, lastRevision = 0, updatedAt = 0 } = {}) {
  if (typeof playerId !== "string" || !playerId.trim()) throw new TypeError("playerId required");
  if (!Number.isSafeInteger(lastRevision) || lastRevision < 0) throw new TypeError("lastRevision must be a non-negative integer");
  if (!Number.isFinite(updatedAt)) throw new TypeError("updatedAt must be finite");
  return { playerId, state: "connected", lastRevision, updatedAt, retryAttempt: 0 };
}

export function markDisconnected(connection, now) {
  assertConnection(connection);
  assertTime(now);
  if (connection.state === "closed") return connection;
  return { ...connection, state: "disconnected", updatedAt: now };
}

export function beginReconnect(connection, now) {
  assertConnection(connection);
  assertTime(now);
  if (connection.state === "closed") throw new Error("Closed connection cannot reconnect");
  return { ...connection, state: "reconnecting", retryAttempt: connection.retryAttempt + 1, updatedAt: now };
}

export function markConnected(connection, revision, now) {
  assertConnection(connection);
  assertRevision(revision);
  assertTime(now);
  if (connection.state === "closed") throw new Error("Closed connection cannot reconnect");
  if (revision < connection.lastRevision) throw new Error("Stale revision received during reconnect");
  return { ...connection, state: "connected", lastRevision: revision, retryAttempt: 0, updatedAt: now };
}

export function closeConnection(connection, now) {
  assertConnection(connection);
  assertTime(now);
  return { ...connection, state: "closed", updatedAt: now };
}

export function shouldRetryReconnect(connection, { maxAttempts = 8 } = {}) {
  assertConnection(connection);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 0) throw new RangeError("maxAttempts must be non-negative");
  return connection.state === "reconnecting" && connection.retryAttempt < maxAttempts;
}

export function reconnectDelayMs(attempt, { baseDelayMs = 500, maxDelayMs = 15000 } = {}) {
  if (!Number.isInteger(attempt) || attempt < 1) throw new RangeError("attempt must be a positive integer");
  if (!Number.isFinite(baseDelayMs) || baseDelayMs < 0 || !Number.isFinite(maxDelayMs) || maxDelayMs < 0) throw new RangeError("Delays must be non-negative");
  return Math.min(baseDelayMs * (2 ** (attempt - 1)), maxDelayMs);
}

function assertConnection(connection) {
  if (!connection || !CONNECTION_STATES.includes(connection.state) || typeof connection.playerId !== "string" || !Number.isSafeInteger(connection.retryAttempt) || connection.retryAttempt < 0 || !Number.isSafeInteger(connection.lastRevision) || connection.lastRevision < 0) throw new TypeError("Invalid connection state");
}
function assertRevision(revision) {
  if (!Number.isSafeInteger(revision) || revision < 0) throw new TypeError("revision must be a non-negative integer");
}
function assertTime(now) {
  if (!Number.isFinite(now)) throw new TypeError("timestamp must be finite");
}
