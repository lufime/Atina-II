import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUND_STATES, canTransitionRound, transitionRound } from '../src/game/round-state.js';

test('exposes the defined round states', () => {
  assert.deepEqual(ROUND_STATES, ['waiting', 'ready', 'active', 'answering', 'revealing', 'finished']);
});

test('accepts valid transitions', () => {
  assert.equal(canTransitionRound('waiting', 'ready'), true);
  assert.equal(canTransitionRound('active', 'answering'), true);
  assert.equal(canTransitionRound('answering', 'revealing'), true);
});

test('rejects invalid transitions', () => {
  assert.equal(canTransitionRound('waiting', 'revealing'), false);
  assert.equal(canTransitionRound('finished', 'active'), false);
  assert.equal(canTransitionRound('bogus', 'active'), false);
});

test('transition returns a new object and preserves other round data', () => {
  const round = { id: 'round-1', state: 'waiting', number: 1 };
  const next = transitionRound(round, 'ready');
  assert.deepEqual(next, { id: 'round-1', state: 'ready', number: 1 });
  assert.notEqual(next, round);
  assert.equal(round.state, 'waiting');
});

test('throws for unknown states and disallowed transitions', () => {
  assert.throws(() => transitionRound({ state: 'bad' }, 'active'), /Estado de ronda inválido/);
  assert.throws(() => transitionRound({ state: 'waiting' }, 'unknown'), /Estado de destino inválido/);
  assert.throws(() => transitionRound({ state: 'waiting' }, 'active'), /Transição inválida/);
});
