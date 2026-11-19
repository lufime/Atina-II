# Room Online — action, synchronization and connection contract (draft)

Transport-agnostic contract. No live backend or realtime provider is connected.

## Authority and actions

Only trusted backend code changes canonical room state, accepts answers, enforces deadlines, reveals challenge solutions, or calculates score. Clients send action envelopes with `roomId`, unique `actionId`, `expectedRevision`, action type, payload, and separately supplied auth context. The backend validates identity, membership, state, deadline, payload, and idempotency. Duplicate action IDs are recognized before revision conflict checks, allowing retries after the state advances.

## Canonical snapshots

Accepted mutations return canonical revision, room state, players/host, current round metadata, public answers, and server timestamp. Clients ignore older revisions and refresh on conflicts instead of optimistic overwrites.

## Reconnect and public sync

- `src/room/reconnect.js`: revision comparison and allowlist projection of public room snapshots.
- Current client revision receives `unchanged`; older/different revision receives a `snapshot`.
- Private challenge fields, session/auth values, and unknown internals are not copied into public snapshots.
- Backend must repeat authorization and projection; pure helpers are not access control.

## Connection lifecycle

`src/room/connection-state.js` models connected, disconnected, reconnecting, and closed states. It tracks the last synchronized revision, retry attempt, rejects stale sync responses, resets attempts after successful synchronization, applies a retry cap, and provides bounded exponential retry delays. Actual retry timers, transport, and UI remain implementation responsibilities.

## Private challenge data

The solution must remain private until the explicit reveal transition. Current core does not yet define private challenge persistence.

## Persistence and realtime

Auth, persistence, realtime subscriptions, atomic RPC/Edge Functions, and database integration remain pending. Supabase project `atina-development` is production: do not run experiments, destructive changes, schema updates, permission changes, or deploys against it without explicit review.
