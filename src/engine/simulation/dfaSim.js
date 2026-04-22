/**
 * DFA step-by-step simulator (SRS §5.1).
 *
 * Guarantees:
 *   • Every symbol must belong to Σ; otherwise ValidationError with the
 *     offending index / symbol so the UI can underline the bad char.
 *   • δ must be total on the DFA's alphabet. If a state is missing a
 *     transition, ValidationError (the DFA isn't a proper DFA).
 *   • Bounded by maxSteps (default 1000) → ExecutionLimitError.
 *
 * Output contract (for the stepper UI):
 *   trace[i] = {
 *     index, stateBefore, symbol, stateAfter,
 *     consumed, remaining, accepted  // accepted is only meaningful on last row
 *   }
 */

import { ValidationError, ExecutionLimitError } from '../errors.js'

export function simulateDFA(dfa, input, opts = {}) {
  const maxSteps = opts.maxSteps ?? 1000
  const alphabet = new Set(dfa.alphabet || [])
  const accepts = new Set(dfa.accepts || [])
  const delta = dfa.delta || {}

  const symbols = Array.from(input)
  for (let i = 0; i < symbols.length; i++) {
    if (!alphabet.has(symbols[i])) {
      throw new ValidationError(
        'symbol-not-in-alphabet',
        `Input symbol '${symbols[i]}' at position ${i} is not in Σ = {${[...alphabet].join(', ')}}.`,
        { position: i, symbol: symbols[i] },
      )
    }
  }

  const trace = []
  let state = dfa.start
  let consumed = ''
  for (let i = 0; i < symbols.length; i++) {
    if (i >= maxSteps) throw new ExecutionLimitError(maxSteps)
    const sym = symbols[i]
    const next = delta[state]?.[sym]
    if (!next) {
      throw new ValidationError(
        'missing-transition',
        `DFA is not total: δ(${state}, '${sym}') is undefined.`,
        { state, symbol: sym },
      )
    }
    trace.push({
      index: i,
      stateBefore: state,
      symbol: sym,
      stateAfter: next,
      consumed,
      remaining: symbols.slice(i + 1).join(''),
    })
    consumed += sym
    state = next
  }

  return {
    accepted: accepts.has(state),
    finalState: state,
    trace,
  }
}
