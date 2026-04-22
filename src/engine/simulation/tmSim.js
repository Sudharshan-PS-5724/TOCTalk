/**
 * Turing Machine step-by-step simulator (SRS §5.3).
 *
 * Contract:
 *   • Rejects any input symbol outside tm.inputAlphabet with a ValidationError
 *     that carries the offending position.
 *   • Halts with `accepted: true` as soon as the current state is in F.
 *   • Halts with `accepted: false` when in an explicit reject state, or when
 *     δ(state, tape[head]) is undefined (conventional "stuck" rejection).
 *   • Enforces maxSteps (default 1000) → ExecutionLimitError.
 *
 * Trace row (what the UI animates):
 *   {
 *     step,                   // 0-based step index
 *     state,                  // state AFTER this step (or initial state on row 0)
 *     head,                   // absolute head index
 *     cells: { idx, symbol }[], // sparse tape window (padded with blanks around content)
 *     move?: { from, read, to, write, direction },  // undefined on row 0
 *   }
 */

import { ExecutionLimitError, ValidationError } from '../errors.js'

export function simulateTM(tm, input, opts = {}) {
  const maxSteps = opts.maxSteps ?? 1000
  const inputSyms = Array.from(input)
  const inputAlpha = new Set(tm.inputAlphabet)
  for (let i = 0; i < inputSyms.length; i++) {
    if (!inputAlpha.has(inputSyms[i])) {
      throw new ValidationError(
        'symbol-not-in-alphabet',
        `Input symbol '${inputSyms[i]}' at position ${i} is not in Σ = {${[...inputAlpha].join(', ')}}.`,
        { position: i, symbol: inputSyms[i] },
      )
    }
  }

  // Tape as a sparse map: index -> symbol.
  const tape = new Map()
  for (let i = 0; i < inputSyms.length; i++) tape.set(i, inputSyms[i])
  let head = 0
  let state = tm.start

  const accept = new Set(tm.accept || [])
  const reject = new Set(tm.reject || [])
  const trace = [snapshot(state, head, tape, tm.blank, undefined)]

  if (accept.has(state)) {
    return { accepted: true, halted: true, reason: 'accept-immediate', trace, finalState: state }
  }

  for (let step = 1; step <= maxSteps; step++) {
    const read = tape.has(head) ? tape.get(head) : tm.blank
    const rule = tm.delta[state]?.[read]
    if (!rule) {
      return {
        accepted: false,
        halted: true,
        reason: 'no-transition',
        trace,
        finalState: state,
        stuckOn: { state, symbol: read, head },
      }
    }
    const move = {
      from: state,
      read,
      to: rule.to,
      write: rule.write,
      direction: rule.move,
    }
    tape.set(head, rule.write)
    state = rule.to
    head += rule.move === 'R' ? 1 : -1

    trace.push(snapshot(state, head, tape, tm.blank, move))

    if (accept.has(state)) {
      return { accepted: true, halted: true, reason: 'accept', trace, finalState: state }
    }
    if (reject.has(state)) {
      return { accepted: false, halted: true, reason: 'reject', trace, finalState: state }
    }
  }

  throw new ExecutionLimitError(maxSteps)
}

function snapshot(state, head, tape, blank, move) {
  const indices = [...tape.keys()]
  const min = indices.length ? Math.min(head, ...indices) : head
  const max = indices.length ? Math.max(head, ...indices) : head
  const cells = []
  // Pad one blank on each side so the tape "extends" visually.
  for (let i = min - 1; i <= max + 1; i++) {
    cells.push({ idx: i, symbol: tape.has(i) ? tape.get(i) : blank })
  }
  return { state, head, cells, ...(move ? { move } : {}) }
  // The row's position in the returned `trace` array IS the step number.
}
