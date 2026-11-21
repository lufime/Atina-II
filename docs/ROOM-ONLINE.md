# Online Room — initial domain contract

This document describes the first pure room-domain implementation. It deliberately has no database integration.

## Room lifecycle

- `lobby`: participants can join or leave.
- `playing`: participant list is fixed; rounds can be opened, answered, revealed and completed.
- `finished`: terminal room state.

## Rules

- Room and participant IDs are required; participant display names are required.
- Joining is only allowed in the lobby; participant IDs must be unique; capacity is bounded (2–32).
- A room requires at least two participants to start.
- The host transfers to the first remaining participant when they leave.
- Only members can submit answers and each member can submit once per round.
- A round's solution is not part of this domain object. Reveal is represented only by a state transition, so private solution data must be held separately by the trusted server.
- Time is passed into functions explicitly for deterministic testing. The trusted server timestamp—not a client clock—must decide whether an answer arrived before the deadline. The clock helper is pure and calculates a deadline, expiry and remaining time; it does not schedule timers or decide UI display.
- This layer does not calculate correctness or award points. Scoring and challenge validation belong to the trusted server layer and will be specified separately.

## Current API

`createRoom`, `addPlayer`, `removePlayer`, `startRoom`, `beginRound`, `submitAnswer`, `revealRound`, `finishRound`, `finishRoom`, `createRoundClock`, `isRoundExpired`, `remainingRoundMs`, `canSubmitBeforeDeadline`.

## Out of scope

Supabase, real-time transport, persistence, authentication, production data, and deployment. No production database changes were made.
