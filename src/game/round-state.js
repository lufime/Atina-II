/** Pure round-state helpers for ATINA II. No network, UI, or database access. */

export const ROUND_STATES = Object.freeze([
  'waiting',
  'ready',
  'active',
  'answering',
  'revealing',
  'finished',
]);


const ALLOWED_TRANSITIONS = Object.freeze({
  waiting: ['ready', 'finished'],
  ready: ['active', 'finished'],
  active: ['answering', 'revealing', 'finished'],
  answering: ['revealing', 'finished'],
  revealing: ['finished', 'ready'],
  finished: [],
});


export function canTransitionRound(from, to) {
  return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
}


export function transitionRound(round, nextState) {
  if (!round || !ROUND_STATES.includes(round.state)) {
    throw new TypeError('Estado de ronda inválido.');
  }
  if (!ROUND_STATES.includes(nextState)) {
    throw new TypeError('Estado de destino inválido.');
  }
  if (!canTransitionRound(round.state, nextState)) {
    throw new Error(`Transição inválida: ${round.state} → ${nextState}`);
  }
  return { ...round, state: nextState };
}

