/**
 * Thompson's construction — Regex AST → ε-NFA.
 *
 * Invariants (mathematical):
 *  • Every fragment produced by walk(node) has EXACTLY ONE start and
 *    EXACTLY ONE accept state.
 *  • The accept state of a fragment has no outgoing transitions.
 *  • The start state of a fragment has no incoming transitions from
 *    OUTSIDE the fragment.
 *  These invariants make union / concat / star compose correctly.
 *
 * Every step is logged into a StepLog with a snapshot graph, so the
 * UI can animate the construction incrementally.
 */

import { EPSILON, nfaToGraph } from '../graph/model.js'
import { StepLog } from '../derivation/stepLog.js'

class NFABuilder {
  constructor() {
    this.counter = 0
    this.states = new Map() // id -> { id, accepting:boolean }
    this.transitions = []   // { from, to, symbol }
    this.alphabet = new Set()
    this.start = null
    this.accepts = []
    this.log = new StepLog()
  }

  newState() {
    const id = `q${this.counter++}`
    this.states.set(id, { id, accepting: false })
    return id
  }

  addTransition(from, to, symbol) {
    this.transitions.push({ from, to, symbol })
    if (symbol !== EPSILON) this.alphabet.add(symbol)
  }

  snapshotNFA(start, accepts) {
    return {
      start,
      accepts: accepts.slice(),
      states: Array.from(this.states.values()).map((s) => ({ id: s.id })),
      transitions: this.transitions.map((t) => ({ ...t })),
      alphabet: Array.from(this.alphabet),
    }
  }

  logStep(operation, explanation, start, accepts, extras = {}) {
    const nfa = this.snapshotNFA(start, accepts)
    this.log.push({
      operation,
      explanation,
      graph: nfaToGraph(nfa),
      extras,
    })
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Base cases & combinators. Each returns { start, accept } for the fragment.
// ──────────────────────────────────────────────────────────────────────────

function buildChar(b, ch) {
  const start = b.newState()
  const accept = b.newState()
  b.addTransition(start, accept, ch)
  b.logStep(
    `base: '${ch}'`,
    `Create a two-state fragment for the symbol '${ch}': a new start state transitions to a new accept state on input '${ch}'.`,
    start,
    [accept],
  )
  return { start, accept }
}

function buildEpsilon(b) {
  const start = b.newState()
  const accept = b.newState()
  b.addTransition(start, accept, EPSILON)
  b.logStep(
    'base: ε',
    'Create a two-state fragment for ε: a new start state reaches a new accept state via an ε-transition (no input consumed).',
    start,
    [accept],
  )
  return { start, accept }
}

function buildUnion(b, A, B) {
  const start = b.newState()
  const accept = b.newState()
  b.addTransition(start, A.start, EPSILON)
  b.addTransition(start, B.start, EPSILON)
  b.addTransition(A.accept, accept, EPSILON)
  b.addTransition(B.accept, accept, EPSILON)
  b.logStep(
    'union',
    'Union A|B: add a new start that ε-branches into both fragments, and a new accept that both fragments ε-merge into. Either branch can be taken non-deterministically.',
    start,
    [accept],
    { highlightNodes: [start, accept] },
  )
  return { start, accept }
}

function buildConcat(b, A, B) {
  b.addTransition(A.accept, B.start, EPSILON)
  b.logStep(
    'concat',
    'Concatenation AB: link the accept state of A to the start state of B with an ε-transition, so A must finish before B begins.',
    A.start,
    [B.accept],
    { highlightEdges: [{ from: A.accept, to: B.start, symbol: EPSILON }] },
  )
  return { start: A.start, accept: B.accept }
}

function buildStar(b, A) {
  const start = b.newState()
  const accept = b.newState()
  b.addTransition(start, A.start, EPSILON)
  b.addTransition(start, accept, EPSILON) // zero iterations
  b.addTransition(A.accept, A.start, EPSILON) // loop back
  b.addTransition(A.accept, accept, EPSILON) // exit
  b.logStep(
    'star',
    "Kleene star A*: a new start can either skip A entirely (ε → new accept for zero repetitions) or enter A. After A completes, it can loop back to A's start for another iteration, or ε to the new accept to exit.",
    start,
    [accept],
    { highlightNodes: [start, accept] },
  )
  return { start, accept }
}

// ──────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────

/**
 * @param {object} ast  Root of regex AST (see engine/regex/ast.js)
 * @returns {{
 *   start:    string,
 *   accepts:  string[],
 *   states:   { id:string, accepting:boolean }[],
 *   transitions: { from:string, to:string, symbol:string }[],
 *   alphabet: string[],
 *   steps:    object[],
 *   graph:    object,
 * }}
 */
export function regexASTtoEpsilonNFA(ast) {
  const b = new NFABuilder()

  function walk(node) {
    switch (node.type) {
      case 'char':
        return buildChar(b, node.value)
      case 'epsilon':
        return buildEpsilon(b)
      case 'star':
        return buildStar(b, walk(node.child))
      case 'concat':
        return buildConcat(b, walk(node.left), walk(node.right))
      case 'union':
        return buildUnion(b, walk(node.left), walk(node.right))
      default:
        throw new Error(`Unknown AST node type: ${node.type}`)
    }
  }

  const frag = walk(ast)
  b.start = frag.start
  b.accepts = [frag.accept]
  b.states.get(frag.accept).accepting = true

  b.logStep(
    'finalize',
    `Finalize the ε-NFA: mark '${frag.start}' as the start state and '${frag.accept}' as the unique accepting state. By Thompson's invariant, the ε-NFA has exactly one start and one accept.`,
    frag.start,
    [frag.accept],
  )

  const finalGraph = nfaToGraph(b.snapshotNFA(b.start, b.accepts))
  return {
    start: b.start,
    accepts: b.accepts.slice(),
    states: Array.from(b.states.values()).map((s) => ({
      id: s.id,
      accepting: s.accepting,
    })),
    transitions: b.transitions.map((t) => ({ ...t })),
    alphabet: Array.from(b.alphabet).sort(),
    steps: b.log.toArray(),
    graph: finalGraph,
  }
}
