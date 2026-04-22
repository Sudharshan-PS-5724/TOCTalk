/**
 * Regular-grammar detection + right-linear CFG → NFA construction.
 *
 * A CFG is regular iff one of the following holds for EVERY production:
 *   Right-linear:  A → ε   |   A → a   |   A → aB       (terminal-leading, NT rightmost)
 *   Left-linear:   A → ε   |   A → a   |   A → Ba       (terminal-trailing, NT leftmost)
 *
 * A grammar that MIXES right- and left-linear productions is NOT regular.
 *
 * For right-linear grammars we build an NFA directly:
 *   • One NFA state per non-terminal, plus one final state q_F.
 *   • Production A → aB  →  δ(q_A, a) = { q_B, … }
 *   • Production A → a   →  δ(q_A, a) = { q_F, … }
 *   • Production A → ε   →  q_A is accepting.
 *   • q_S is the start state.
 *
 * Callers feed the resulting NFA into the existing subset construction +
 * DFA minimization pipeline to produce a minimal DFA for the language.
 */

import { EPSILON } from '../graph/model.js'

export const LINEARITY = Object.freeze({
  NONE: 'none',
  RIGHT: 'right',
  LEFT: 'left',
  MIXED: 'mixed',
})

/**
 * Classify a grammar as right-linear, left-linear, mixed, or non-regular.
 * @returns {{
 *   kind: 'right' | 'left' | 'mixed' | 'non-regular',
 *   offending: Array<{ production: {lhs,rhs}, reason: string }>,
 *   regular: boolean,
 * }}
 */
export function classifyGrammar(grammar) {
  const offending = []
  let hasRight = false
  let hasLeft = false

  for (const p of grammar.productions) {
    const r = p.rhs
    const isEpsilon = r.length === 0
    const nts = r.filter((s) => grammar.nonTerminals.has(s))

    if (isEpsilon) continue

    if (nts.length === 0) {
      // pure terminals — needs to be a single terminal for regularity
      if (!(r.length === 1 && grammar.terminals.has(r[0]))) {
        offending.push({
          production: p,
          reason: `RHS has ${r.length} terminals; regular productions allow only a single terminal or terminal + single non-terminal.`,
        })
      }
      continue
    }

    if (nts.length > 1) {
      offending.push({
        production: p,
        reason: `RHS contains ${nts.length} non-terminals; regular grammars allow at most one.`,
      })
      continue
    }

    // Exactly one NT on the RHS. Determine its position.
    const ntIdx = r.findIndex((s) => grammar.nonTerminals.has(s))
    const prefix = r.slice(0, ntIdx)
    const suffix = r.slice(ntIdx + 1)

    // Right-linear: NT is at the tail, prefix is a single terminal (or empty)
    //   forms: A → aB    (prefix=[a], suffix=[])
    //          A → B     (prefix=[],  suffix=[])  ← this is a unit; treat as right-linear
    // Left-linear: NT is at the head, suffix is a single terminal (or empty)
    //   forms: A → Ba    (prefix=[],  suffix=[a])
    //          A → B     (also matches; we already counted this as right-linear above)
    const looksRight =
      suffix.length === 0 &&
      (prefix.length === 0 || (prefix.length === 1 && grammar.terminals.has(prefix[0])))
    const looksLeft =
      prefix.length === 0 &&
      (suffix.length === 0 || (suffix.length === 1 && grammar.terminals.has(suffix[0])))

    if (!looksRight && !looksLeft) {
      offending.push({
        production: p,
        reason: `RHS '${r.join('')}' is neither right-linear (aB, a, ε) nor left-linear (Ba, a, ε).`,
      })
      continue
    }
    // A → B (pure NT, no terminal) is both right- and left-linear.
    if (looksRight && !looksLeft) hasRight = true
    if (looksLeft && !looksRight) hasLeft = true
  }

  if (offending.length > 0) {
    return { kind: 'non-regular', offending, regular: false }
  }
  if (hasRight && hasLeft) {
    return { kind: 'mixed', offending: [], regular: false }
  }
  if (hasLeft && !hasRight) return { kind: 'left', offending: [], regular: true }
  return { kind: 'right', offending: [], regular: true }
}

/**
 * Convert a right-linear grammar directly to an NFA in the exact shape
 * our existing subset-construction expects:
 *   { start, accepts[], states[{id}], transitions[{from,to,symbol}], alphabet[] }
 *
 * Caller must have already classified the grammar as right-linear.
 */
export function rightLinearToNFA(grammar) {
  const FINAL = 'qF'
  const stateOf = (nt) => `q${nt}`
  const states = [...grammar.nonTerminals].map((nt) => ({ id: stateOf(nt) }))
  states.push({ id: FINAL })

  const accepts = new Set([FINAL])
  const transitions = []

  for (const p of grammar.productions) {
    const src = stateOf(p.lhs)
    const r = p.rhs

    if (r.length === 0) {
      // A → ε  ⇒ q_A is accepting
      accepts.add(src)
      continue
    }
    if (r.length === 1 && grammar.terminals.has(r[0])) {
      // A → a  ⇒  δ(q_A, a) = q_F
      transitions.push({ from: src, to: FINAL, symbol: r[0] })
      continue
    }
    if (r.length === 1 && grammar.nonTerminals.has(r[0])) {
      // A → B  (pure unit, handled as ε-transition for NFA semantics)
      transitions.push({ from: src, to: stateOf(r[0]), symbol: EPSILON })
      continue
    }
    if (r.length === 2 && grammar.terminals.has(r[0]) && grammar.nonTerminals.has(r[1])) {
      // A → aB
      transitions.push({ from: src, to: stateOf(r[1]), symbol: r[0] })
      continue
    }
    // Unreachable if classifyGrammar reported 'right-linear' — defensive.
    throw new Error(
      `rightLinearToNFA: production ${p.lhs}→${r.join('')} is not right-linear.`,
    )
  }

  const alphabet = [...grammar.terminals].sort()
  return {
    start: stateOf(grammar.start),
    accepts: [...accepts],
    states,
    transitions,
    alphabet,
  }
}
