/**
 * DFA minimization via the table-filling (Myhill–Nerode) method.
 * Required by SRS §10.4 and matches Module 2 of the lab spec.
 *
 * Preconditions:
 *   • `dfa` is complete (every (state,symbol) has a defined δ). Our subset
 *     construction produces a complete DFA by default, so this holds in the
 *     regex pipeline. If not complete we complete it on the fly with a dead
 *     state to keep the algorithm sound.
 *
 * Algorithm (Hopcroft & Ullman, table-filling form):
 *   1. Remove unreachable states from δ (reached from start by BFS).
 *   2. Initial mark: for every unordered pair {p,q} where one is accepting
 *      and the other is not, mark DISTINGUISHABLE.
 *   3. Iterate: for every still-unmarked pair {p,q} and every symbol a ∈ Σ,
 *      if {δ(p,a), δ(q,a)} is already marked, mark {p,q} as well.
 *      Loop until no pair is newly marked (fixed point).
 *   4. Every pair that remains unmarked is an equivalence (indistinguishable).
 *      Merge equivalence classes via union-find; rename classes canonically.
 *   5. Build the minimized DFA: one representative per class, δ defined
 *      consistently (guaranteed by the equivalence).
 *
 * Output shape mirrors subset construction:
 *   { dfa, steps, graph, equivalenceClasses, tableFinal }
 *
 * Every iteration is logged as a StepLog entry so the stepper can animate.
 */

import { StepLog } from '../derivation/stepLog.js'
import { dfaToGraph } from '../graph/model.js'

/**
 * Minimize a complete DFA using the table-filling method.
 *
 * @param {object} dfa  { start, accepts[], states[{id,accepting?}], alphabet[], delta }
 * @returns {{
 *   dfa: object,                 // minimized DFA (same shape as input)
 *   steps: object[],             // StepLog snapshots
 *   graph: object,               // final unified Graph
 *   equivalenceClasses: string[][],
 *   tableFinal: Record<string, boolean>, // 'a|b' (a<b) → marked
 * }}
 */
export function minimizeDFA(dfa) {
  const log = new StepLog()
  const alphabet = (dfa.alphabet || []).slice().sort()
  const acceptSet = new Set(dfa.accepts || [])
  const deltaIn = dfa.delta

  // ── Step 1: reachability from start ──────────────────────────────────
  const reachable = new Set()
  const q = [dfa.start]
  reachable.add(dfa.start)
  while (q.length) {
    const u = q.shift()
    for (const a of alphabet) {
      const v = deltaIn[u]?.[a]
      if (v && !reachable.has(v)) {
        reachable.add(v)
        q.push(v)
      }
    }
  }

  const states = dfa.states
    .filter((s) => reachable.has(s.id))
    .map((s) => ({ id: s.id, accepting: !!(s.accepting || acceptSet.has(s.id)) }))

  if (states.length < dfa.states.length) {
    const removed = dfa.states
      .filter((s) => !reachable.has(s.id))
      .map((s) => s.id)
    log.push({
      operation: 'remove-unreachable',
      explanation: `Removed ${removed.length} unreachable state${removed.length === 1 ? '' : 's'}: ${removed.join(', ')}. Unreachable states cannot affect the language and are safe to drop.`,
      graph: dfaToGraph({
        start: dfa.start,
        accepts: states.filter((s) => s.accepting).map((s) => s.id),
        states: states.map((s) => ({ id: s.id })),
        alphabet,
        delta: filteredDelta(deltaIn, states, alphabet),
      }),
    })
  }

  const ids = states.map((s) => s.id)
  const delta = filteredDelta(deltaIn, states, alphabet)

  // ── Step 2: table-filling init ───────────────────────────────────────
  const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)
  const marked = new Map() // pairKey → boolean
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      marked.set(pairKey(ids[i], ids[j]), false)
    }
  }

  let initialMarks = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i]
      const b = ids[j]
      const aAccept = acceptSet.has(a) || states.find((s) => s.id === a)?.accepting
      const bAccept = acceptSet.has(b) || states.find((s) => s.id === b)?.accepting
      if (!!aAccept !== !!bAccept) {
        marked.set(pairKey(a, b), true)
        initialMarks++
      }
    }
  }

  log.push({
    operation: 'table-init',
    explanation: `Initial marking: mark every pair (p,q) where exactly one of p,q is an accepting state. ${initialMarks} pair${initialMarks === 1 ? '' : 's'} marked distinguishable.`,
    graph: dfaToGraph({
      start: dfa.start,
      accepts: states.filter((s) => s.accepting).map((s) => s.id),
      states: states.map((s) => ({ id: s.id })),
      alphabet,
      delta,
    }),
    extras: { table: Object.fromEntries(marked) },
  })

  // ── Step 3: fixed-point propagation ──────────────────────────────────
  let iter = 0
  let changed = true
  while (changed) {
    iter++
    changed = false
    let newlyMarked = 0
    const justification = []
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i]
        const b = ids[j]
        const k = pairKey(a, b)
        if (marked.get(k)) continue
        for (const sym of alphabet) {
          const pa = delta[a]?.[sym]
          const pb = delta[b]?.[sym]
          if (!pa || !pb || pa === pb) continue
          const pk = pairKey(pa, pb)
          if (marked.get(pk)) {
            marked.set(k, true)
            newlyMarked++
            changed = true
            justification.push({ pair: [a, b], symbol: sym, witness: [pa, pb] })
            break
          }
        }
      }
    }
    log.push({
      operation: `iteration-${iter}`,
      explanation:
        newlyMarked === 0
          ? `Iteration ${iter}: no new pairs marked. Fixed point reached.`
          : `Iteration ${iter}: marked ${newlyMarked} additional pair${newlyMarked === 1 ? '' : 's'}. Example: {${justification[0].pair.join(', ')}} distinguished by '${justification[0].symbol}' (reaches already-marked {${justification[0].witness.join(', ')}}).`,
      graph: dfaToGraph({
        start: dfa.start,
        accepts: states.filter((s) => s.accepting).map((s) => s.id),
        states: states.map((s) => ({ id: s.id })),
        alphabet,
        delta,
      }),
      extras: { table: Object.fromEntries(marked) },
    })
  }

  // ── Step 4: equivalence classes via union-find over UNMARKED pairs ───
  const parent = new Map()
  for (const id of ids) parent.set(id, id)
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)))
      x = parent.get(x)
    }
    return x
  }
  const union = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i]
      const b = ids[j]
      if (!marked.get(pairKey(a, b))) union(a, b)
    }
  }
  const classesMap = new Map() // root → members[]
  for (const id of ids) {
    const r = find(id)
    if (!classesMap.has(r)) classesMap.set(r, [])
    classesMap.get(r).push(id)
  }
  const classes = [...classesMap.values()].map((arr) => arr.slice().sort())

  // ── Step 5: build the minimized DFA ─────────────────────────────────
  // Canonical id per class = class index in order of first appearance of start class.
  const startRoot = find(dfa.start)
  // Put start's class first.
  classes.sort((a, b) => {
    const aHasStart = a.includes(dfa.start) ? 0 : 1
    const bHasStart = b.includes(dfa.start) ? 0 : 1
    return aHasStart - bHasStart
  })
  const rootToId = new Map()
  const minStates = []
  classes.forEach((members, idx) => {
    const canonical = members[0]
    const id = `M${idx}`
    rootToId.set(find(canonical), id)
    const accepting = members.some(
      (m) => acceptSet.has(m) || states.find((s) => s.id === m)?.accepting,
    )
    minStates.push({
      id,
      subset: members,
      subsetLabel: `{${members.join(', ')}}`,
      accepting,
    })
  })

  const minDelta = {}
  for (const s of minStates) minDelta[s.id] = {}
  for (const cls of classes) {
    const repr = cls[0]
    const srcId = rootToId.get(find(repr))
    for (const sym of alphabet) {
      const tgt = delta[repr]?.[sym]
      if (!tgt) continue
      const tgtId = rootToId.get(find(tgt))
      minDelta[srcId][sym] = tgtId
    }
  }

  const minDFA = {
    start: rootToId.get(startRoot),
    accepts: minStates.filter((s) => s.accepting).map((s) => s.id),
    states: minStates,
    alphabet,
    delta: minDelta,
  }

  log.push({
    operation: 'finalize',
    explanation: `Equivalence classes merged: ${classes.length} class${classes.length === 1 ? '' : 'es'} from ${ids.length} reachable state${ids.length === 1 ? '' : 's'}. Each class becomes one state in the minimal DFA. Every class's internal δ agrees by construction, so the minimized δ is well-defined.`,
    graph: dfaToGraph(minDFA),
  })

  return {
    dfa: minDFA,
    steps: log.toArray(),
    graph: dfaToGraph(minDFA),
    equivalenceClasses: classes,
    tableFinal: Object.fromEntries(marked),
  }
}

function filteredDelta(delta, states, alphabet) {
  const ids = new Set(states.map((s) => s.id))
  const out = {}
  for (const s of states) {
    out[s.id] = {}
    for (const a of alphabet) {
      const v = delta[s.id]?.[a]
      if (v && ids.has(v)) out[s.id][a] = v
    }
  }
  return out
}
