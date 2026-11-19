# Online Room — action and synchronization contract (draft)

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
- `auth context`: session token supplied separately, never embedded in payload

The backend validates identity, membership, state, deadline, payload shape and request idempotency before applying an action.

## Canonical snapshot

Every accepted state mutation returns:
- `roomId`
- monotonically increasing `revision`
- `state`
- participant list and host id
- current round metadata and publicly visible answers only
- team/player score values, once scoring rules are specified
- server timestamp

Clients discard snapshots older than the revision already applied. Revision conflicts require refreshing canonical state; clients do not overwrite server state optimistically.

## Private challenge data

The canonical public room snapshot must never include the solution before the explicit reveal transition. Challenge payloads should be split into public and private fields on the server and selectively returned based on round state.

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
