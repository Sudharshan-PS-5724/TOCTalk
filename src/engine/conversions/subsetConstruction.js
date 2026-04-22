/**
 * ε-NFA → DFA via subset construction (SRS §10.3).
 *
 * Algorithm (Aho / Sipser):
 *   1. D0 = ε-closure({startNFA})
 *   2. Worklist = [D0]
 *   3. While worklist non-empty, take T:
 *        for each input symbol a ∈ Σ (no ε):
 *          U = ε-closure(move(T, a))
 *          if U is non-empty and unseen, enqueue it
 *          δ_DFA(T, a) = U   (or the DEAD state if U is empty, for completeness)
 *   4. Accept states of DFA = subsets that contain ≥1 NFA accept state.
 *
 * Correctness:
 *   • ε-closure is computed by fixed-point graph search over ε-edges.
 *   • Subsets are canonicalised (sorted id list → string key) so equivalent
 *     subsets in different encounter order map to the same DFA state.
 *   • With `complete: true` (default), a DEAD state is added so every
 *     (state, symbol) pair has exactly one transition — required by SRS §1.3.
 *
 * Output: {
 *   dfa: {
 *     start, accepts[], states[{id,label,subset,accepting}], alphabet[], delta,
 *   },
 *   steps: StepLog entries (one per δ computation),
 *   graph: final unified Graph,
 * }
 *
 * Every step carries a snapshot graph of the DFA built so far, so the UI
 * stepper can animate each δ(T,a) = U discovery.
 */

import { EPSILON, dfaToGraph } from '../graph/model.js'
import { StepLog } from '../derivation/stepLog.js'

const DEAD = '∅' // id of the dead/trap state when completing the DFA

/**
 * Compute ε-closure of a set of NFA state ids using fixed-point DFS.
 */
function epsilonClosure(states, epsAdj) {
  const closure = new Set(states)
  const stack = [...states]
  while (stack.length) {
    const u = stack.pop()
    for (const v of epsAdj.get(u) || []) {
      if (!closure.has(v)) {
        closure.add(v)
        stack.push(v)
      }
    }
  }
  return closure
}

/**
 * move(T, a): set of NFA states reachable from any state in T on input `a`
 * (without following ε). Input `a` MUST be a non-epsilon alphabet symbol.
 */
function move(T, a, symAdj) {
  const result = new Set()
  for (const u of T) {
    const next = symAdj.get(u)
    if (!next) continue
    const via = next.get(a)
    if (!via) continue
    for (const v of via) result.add(v)
  }
  return result
}

function canonKey(set) {
  return [...set].sort().join(',')
}

function formatSubset(set) {
  const ids = [...set].sort()
  return ids.length ? `{${ids.join(', ')}}` : '∅'
}

/**
 * Build a DFA state descriptor from a subset.
 */
function makeDFAState(id, subsetArr, nfaAcceptSet) {
  const accepting = subsetArr.some((s) => nfaAcceptSet.has(s))
  return {
    id,
    subset: subsetArr.slice(),
    subsetLabel: formatSubset(subsetArr),
    accepting,
  }
}

/**
 * Snapshot the partially-built DFA as a unified Graph for the StepLog.
 */
function snapshotDFAGraph(start, states, deltaEntries) {
  const accepts = states.filter((s) => s.accepting).map((s) => s.id)
  const delta = {}
  for (const s of states) delta[s.id] = {}
  for (const [from, sym, to] of deltaEntries) delta[from][sym] = to
  return dfaToGraph({
    start,
    accepts,
    states: states.map((s) => ({ id: s.id })),
    alphabet: [], // not needed for graph rendering
    delta,
  })
}

/**
 * Public API.
 *
 * @param {object} nfa  Output of regexASTtoEpsilonNFA (or any ε-NFA with the
 *                      same shape).
 * @param {object} [opts]
 * @param {boolean} [opts.complete=true]  Add DEAD state so every δ(q,a) exists.
 * @returns {{
 *   dfa: {
 *     start: string,
 *     accepts: string[],
 *     states: { id, subset, subsetLabel, accepting }[],
 *     alphabet: string[],
 *     delta: Record<string, Record<string, string>>,
 *   },
 *   steps: object[],
 *   graph: object,
 * }}
 */
export function subsetConstruction(nfa, opts = {}) {
  const complete = opts.complete !== false
  const alphabet = (nfa.alphabet || [])
    .filter((s) => s !== EPSILON)
    .slice()
    .sort()

  // Adjacency maps: epsAdj[u] = [v, …], symAdj[u][a] = Set(v)
  const epsAdj = new Map()
  const symAdj = new Map()
  for (const s of nfa.states) {
    epsAdj.set(s.id, [])
    symAdj.set(s.id, new Map())
  }
  for (const t of nfa.transitions) {
    if (t.symbol === EPSILON) {
      epsAdj.get(t.from).push(t.to)
    } else {
      const row = symAdj.get(t.from)
      if (!row.has(t.symbol)) row.set(t.symbol, new Set())
      row.get(t.symbol).add(t.to)
    }
  }

  const nfaAcceptSet = new Set(nfa.accepts || [])
  const log = new StepLog()

  // ── Step 1: seed with ε-closure of the NFA start ──────────────────────
  const initSubset = epsilonClosure(new Set([nfa.start]), epsAdj)
  const states = [] // DFA state list (in discovery order)
  const byKey = new Map() // canonKey → dfaId
  const delta = [] // [from, sym, to] triples — source of truth

  const initId = 'D0'
  const initState = makeDFAState(
    initId,
    [...initSubset],
    nfaAcceptSet,
  )
  states.push(initState)
  byKey.set(canonKey(initSubset), initId)
  const startId = initId

  log.push({
    operation: 'init',
    explanation: `Start from ε-closure of NFA start state '${nfa.start}': ${formatSubset(initSubset)}. This becomes DFA state ${initId}.`,
    graph: snapshotDFAGraph(startId, states, delta),
    extras: { highlightNodes: [initId] },
  })

  let deadAdded = false
  function ensureDead() {
    if (deadAdded) return DEAD
    const dead = {
      id: DEAD,
      subset: [],
      subsetLabel: '∅',
      accepting: false,
    }
    states.push(dead)
    byKey.set('', DEAD)
    // dead state loops on every symbol
    for (const a of alphabet) delta.push([DEAD, a, DEAD])
    deadAdded = true
    log.push({
      operation: 'add-dead',
      explanation: 'Added dead state ∅ so every (state, symbol) has exactly one transition, as required for a complete DFA.',
      graph: snapshotDFAGraph(startId, states, delta),
      extras: { highlightNodes: [DEAD] },
    })
    return DEAD
  }

  // ── Step 2: worklist loop ─────────────────────────────────────────────
  const worklist = [{ id: initId, subset: initSubset }]
  let counter = 1
  let safety = 0
  const MAX_SUBSETS = 1024

  while (worklist.length) {
    if (++safety > MAX_SUBSETS) {
      throw new Error(
        `Subset construction exceeded ${MAX_SUBSETS} DFA states — aborting to prevent explosion.`,
      )
    }
    const { id: fromId, subset: T } = worklist.shift()

    for (const a of alphabet) {
      const moved = move(T, a, symAdj)
      const U = epsilonClosure(moved, epsAdj)
      const key = canonKey(U)

      if (U.size === 0) {
        if (complete) {
          const deadId = ensureDead()
          delta.push([fromId, a, deadId])
          log.push({
            operation: 'delta-dead',
            explanation: `δ(${fromId}, '${a}') = ∅ → route to dead state.`,
            graph: snapshotDFAGraph(startId, states, delta),
            extras: { highlightNodes: [fromId, deadId] },
          })
        }
        continue
      }

      let toId = byKey.get(key)
      if (!toId) {
        toId = `D${counter++}`
        const newState = makeDFAState(toId, [...U], nfaAcceptSet)
        states.push(newState)
        byKey.set(key, toId)
        worklist.push({ id: toId, subset: U })
        log.push({
          operation: 'new-subset',
          explanation: `From ${fromId} on '${a}': move = ${formatSubset(moved)}, ε-closure = ${formatSubset(U)}. New DFA state ${toId} = ${newState.subsetLabel}${newState.accepting ? ' (accepting — contains an NFA accept)' : ''}.`,
          graph: snapshotDFAGraph(startId, states, delta.concat([[fromId, a, toId]])),
          extras: { highlightNodes: [fromId, toId] },
        })
      }
      delta.push([fromId, a, toId])
      log.push({
        operation: 'delta',
        explanation: `δ(${fromId}, '${a}') = ${toId} (= ${formatSubset(U)}).`,
        graph: snapshotDFAGraph(startId, states, delta),
        extras: { highlightNodes: [fromId, toId] },
      })
    }
  }

  // Build final delta map keyed by state & symbol
  const deltaMap = {}
  for (const s of states) deltaMap[s.id] = {}
  for (const [from, sym, to] of delta) {
    deltaMap[from][sym] = to
  }

  const dfa = {
    start: startId,
    accepts: states.filter((s) => s.accepting).map((s) => s.id),
    states: states.map((s) => ({
      id: s.id,
      subset: s.subset,
      subsetLabel: s.subsetLabel,
      accepting: s.accepting,
    })),
    alphabet,
    delta: deltaMap,
  }

  log.push({
    operation: 'finalize',
    explanation: `Subset construction complete: ${states.length} DFA state${states.length === 1 ? '' : 's'}, ${dfa.accepts.length} accepting. Every state has one transition per symbol in Σ = {${alphabet.join(', ')}}${complete ? ', including routes to the dead state ∅ where needed' : ''}.`,
    graph: dfaToGraph(dfa),
  })

  return {
    dfa,
    steps: log.toArray(),
    graph: dfaToGraph(dfa),
  }
}
