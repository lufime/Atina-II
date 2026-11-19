# Room Online — action and synchronization contract (draft)

This is a transport-neutral contract for the next backend integration step. No live backend is connected.

## Authority

Only the trusted backend may create or change canonical room state, accept answers, evaluate deadlines, reveal challenge solutions, or calculate score. Clients send requests and render canonical state received from the backend.

## Action envelope

Each action should include:
- `roomId`: room identifier
- `actionId`: unique client-generated idempotency key
- `expectedRevision`: last canonical room revision observed by the client
- `type`: allowlisted action name
- `payload`: action-specific data
- auth context: session token supplied separately, never embedded in payload

The backend validates identity, membership, state, deadline, payload shape and request idempotency before applying an action. Duplicate action IDs are checked before revision conflict handling so retries remain idempotent after the room advances.

## Canonical snapshot

Every accepted state mutation returns `roomId`, monotonically increasing `revision`, state, participants/host, current-round metadata, public answers and server timestamp. Clients discard snapshots older than their current revision. Conflicts trigger canonical refresh; clients do not overwrite server state optimistically.

## Public synchronization and reconnect

`src/room/reconnect.js` provides transport-neutral revision synchronization:
- matching revision returns `unchanged`
- a stale revision receives a filtered `snapshot`
- snapshot fields are allowlisted, including player fields and round metadata/answers
- private challenge fields, auth/session values and arbitrary internal properties are not copied

This projection is not authorization or persistence. The backend must apply equivalent filtering and recheck membership before sending any room data.

## Private challenge data

The canonical public room snapshot must never include the solution before explicit reveal. Challenge data should be split into public and private server-side fields and selectively returned according to round state. The current core does not yet define the solution-storage schema.

## Candidate action types

- `room.join`
- `room.leave`
- `room.start`
- `round.start`
- `answer.submit`
- `round.reveal`
- `round.finish`
- `room.finish`

Actions are proposals, not direct client-side state changes. Server-side authorization and validation are required for every action.

## Transport and persistence

Supabase Auth, database persistence, realtime subscriptions and RPC/Edge Function design remain pending. The production project `atina-development` must not be used for experiments or destructive changes. No schema, permissions, records, or deployments have been changed.
