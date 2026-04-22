/**
 * CFG → Chomsky Normal Form, in the exact 5-step order the lab spec requires:
 *
 *   Step 1: Remove ε-productions            (DEL)
 *   Step 2: Remove unit productions         (UNIT)
 *   Step 3: Remove useless symbols          (non-generating, then non-reachable)
 *   Step 4: Convert to binary productions   (BIN)
 *   Step 5: Replace terminals in long RHS   (TERM)
 *
 * Final form of every production: A → BC   or   A → a   (or S' → ε if ε ∈ L).
 *
 * Each step returns a NEW grammar snapshot and logs an entry into StepLog so
 * the UI can display the intermediate grammar after every transformation.
 */

import {
  cloneGrammar,
  computeGenerating,
  computeNullable,
  computeReachable,
  dedupeProductions,
  formatGrammar,
  freshNonTerminal,
  makeGrammar,
  rhsKey,
} from './cfg.js'
import { StepLog } from '../derivation/stepLog.js'

function pushStep(log, operation, explanation, grammar, extras = {}) {
  log.push({
    operation,
    explanation,
    // The unified Graph contract expects {nodes,edges}. CFG snapshots carry
    // the grammar text instead — the UI's stepper uses `extras.grammar` if
    // present, so we provide an empty graph and the real content in extras.
    graph: { nodes: [], edges: [] },
    extras: {
      ...extras,
      grammar: formatGrammar(grammar),
      productions: grammar.productions.slice(),
      start: grammar.start,
    },
  })
}

// ── Step 1: remove ε-productions ──────────────────────────────────────────

/**
 * For every production A → α that contains any nullable non-terminal, add
 * each "variant" rhs where an arbitrary subset of the nullable occurrences
 * is deleted. Finally, drop all A → ε productions — but if the original
 * start was nullable, introduce a fresh start S' with S' → S | ε so ε ∈ L
 * is preserved (canonical CNF treatment).
 */
export function removeEpsilonProductions(grammar) {
  const nullable = computeNullable(grammar)
  const newProds = []

  for (const p of grammar.productions) {
    if (p.rhs.length === 0) continue // skip original ε productions
    const variants = expandNullableCombinations(p.rhs, nullable, grammar)
    for (const v of variants) {
      if (v.length === 0) continue // a newly produced ε is dropped here
      newProds.push({ lhs: p.lhs, rhs: v })
    }
  }

  const deduped = dedupeProductions(newProds)
  let start = grammar.start
  const nts = new Set(grammar.nonTerminals)

  if (nullable.has(grammar.start)) {
    // Guarantee start symbol does NOT appear on any RHS; otherwise introduce
    // a fresh start wrapper S'.
    const startOnRHS = deduped.some((p) => p.rhs.includes(grammar.start))
    if (startOnRHS) {
      const newStart = freshNonTerminal(nts, grammar.start)
      nts.add(newStart)
      deduped.unshift(
        { lhs: newStart, rhs: [grammar.start] },
        { lhs: newStart, rhs: [] },
      )
      start = newStart
    } else {
      deduped.unshift({ lhs: start, rhs: [] })
    }
  }

  return makeGrammar({
    start,
    nonTerminals: nts,
    terminals: grammar.terminals,
    productions: deduped,
  })
}

function expandNullableCombinations(rhs, nullable, grammar) {
  // Indices of nullable symbols in rhs (non-terminals only, as per convention).
  const nullablePositions = []
  for (let i = 0; i < rhs.length; i++) {
    if (grammar.nonTerminals.has(rhs[i]) && nullable.has(rhs[i])) {
      nullablePositions.push(i)
    }
  }
  const n = nullablePositions.length
  if (n === 0) return [rhs.slice()]

  const variants = new Map() // rhsKey → rhs[]
  const total = 1 << n
  for (let mask = 0; mask < total; mask++) {
    const drop = new Set()
    for (let b = 0; b < n; b++) {
      if (mask & (1 << b)) drop.add(nullablePositions[b])
    }
    const variant = []
    for (let i = 0; i < rhs.length; i++) {
      if (!drop.has(i)) variant.push(rhs[i])
    }
    variants.set(rhsKey(variant), variant)
  }
  return [...variants.values()]
}

// ── Step 2: remove unit productions ───────────────────────────────────────

/**
 * Compute unit-reachability U(A) = { B : A ⇒* B via chain of unit productions }.
 * Then for every A and every B ∈ U(A), for every non-unit production B → α,
 * add A → α. Finally remove every unit production.
 */
export function removeUnitProductions(grammar) {
  const nts = [...grammar.nonTerminals]
  const unitReach = new Map()
  for (const A of nts) unitReach.set(A, new Set([A]))

  let changed = true
  while (changed) {
    changed = false
    for (const p of grammar.productions) {
      if (!isUnit(p, grammar)) continue
      const A = p.lhs
      const B = p.rhs[0]
      for (const C of unitReach.get(B) || []) {
        if (!unitReach.get(A).has(C)) {
          unitReach.get(A).add(C)
          changed = true
        }
      }
    }
  }

  const newProds = []
  for (const A of nts) {
    for (const B of unitReach.get(A)) {
      for (const p of grammar.productions) {
        if (p.lhs !== B) continue
        if (isUnit(p, grammar)) continue
        newProds.push({ lhs: A, rhs: p.rhs.slice() })
      }
    }
  }

  return makeGrammar({
    start: grammar.start,
    nonTerminals: grammar.nonTerminals,
    terminals: grammar.terminals,
    productions: dedupeProductions(newProds),
  })
}

function isUnit(p, grammar) {
  return p.rhs.length === 1 && grammar.nonTerminals.has(p.rhs[0])
}

// ── Step 3: remove useless symbols ────────────────────────────────────────

/**
 * Order matters: drop non-generating symbols first (symbols that cannot
 * derive any terminal string), then drop unreachable symbols.
 */
export function removeUselessSymbols(grammar) {
  const generating = computeGenerating(grammar)

  const afterGen = grammar.productions.filter(
    (p) =>
      generating.has(p.lhs) &&
      p.rhs.every((s) => grammar.terminals.has(s) || generating.has(s)),
  )

  const intermediate = makeGrammar({
    start: grammar.start,
    nonTerminals: new Set([...grammar.nonTerminals].filter((nt) => generating.has(nt))),
    terminals: grammar.terminals,
    productions: afterGen,
  })

  const reachable = computeReachable(intermediate)
  const final = intermediate.productions.filter((p) => reachable.has(p.lhs))
  const terms = new Set()
  for (const p of final) for (const s of p.rhs) if (intermediate.terminals.has(s)) terms.add(s)

  return makeGrammar({
    start: intermediate.start,
    nonTerminals: new Set([...intermediate.nonTerminals].filter((nt) => reachable.has(nt))),
    terminals: terms,
    productions: final,
  })
}

// ── Step 4: binarize ──────────────────────────────────────────────────────

export function binarizeProductions(grammar) {
  const g = cloneGrammar(grammar)
  const out = []
  for (const p of g.productions) {
    if (p.rhs.length <= 2) {
      out.push(p)
      continue
    }
    // A → X1 X2 … Xk  (k ≥ 3)
    let currentLhs = p.lhs
    const xs = p.rhs.slice()
    while (xs.length > 2) {
      const first = xs.shift()
      const helper = freshNonTerminal(g.nonTerminals, p.lhs)
      g.nonTerminals.add(helper)
      out.push({ lhs: currentLhs, rhs: [first, helper] })
      currentLhs = helper
    }
    out.push({ lhs: currentLhs, rhs: xs })
  }
  return makeGrammar({
    start: g.start,
    nonTerminals: g.nonTerminals,
    terminals: g.terminals,
    productions: dedupeProductions(out),
  })
}

// ── Step 5: terminal replacement in long productions ──────────────────────

export function replaceTerminalsInLongProductions(grammar) {
  const g = cloneGrammar(grammar)
  const termToNT = new Map() // terminal → dedicated non-terminal name
  const out = []

  function ntFor(term) {
    if (termToNT.has(term)) return termToNT.get(term)
    const upper = term.toUpperCase()
    let base = /[A-Z]/.test(upper) ? upper : 'T'
    if (!g.nonTerminals.has(base)) {
      termToNT.set(term, base)
      g.nonTerminals.add(base)
      return base
    }
    const fresh = freshNonTerminal(g.nonTerminals, base)
    termToNT.set(term, fresh)
    g.nonTerminals.add(fresh)
    return fresh
  }

  for (const p of g.productions) {
    if (p.rhs.length < 2) {
      out.push(p)
      continue
    }
    const newRhs = p.rhs.map((s) => {
      if (g.terminals.has(s)) return ntFor(s)
      return s
    })
    out.push({ lhs: p.lhs, rhs: newRhs })
  }
  for (const [term, nt] of termToNT) {
    out.push({ lhs: nt, rhs: [term] })
  }

  return makeGrammar({
    start: g.start,
    nonTerminals: g.nonTerminals,
    terminals: g.terminals,
    productions: dedupeProductions(out),
  })
}

// ── Public API: full 5-step pipeline with step log ────────────────────────

/**
 * Run the 5-step CNF conversion, producing the final grammar plus a step
 * log suitable for the derivation stepper.
 */
export function toCNF(grammar) {
  const log = new StepLog()
  pushStep(log, 'input', 'Input grammar as provided.', grammar)

  const g1 = removeEpsilonProductions(grammar)
  pushStep(
    log,
    'step-1-remove-epsilon',
    'Remove ε-productions. For each production whose RHS contains nullable non-terminals, add every variant with those nullables optionally deleted. If the start symbol was nullable, introduce a fresh start S′ with S′ → S | ε so the empty string stays in L(G).',
    g1,
  )

  const g2 = removeUnitProductions(g1)
  pushStep(
    log,
    'step-2-remove-unit',
    "Remove unit productions. For every A and every B reachable from A via unit chains, copy each of B's non-unit productions to A. Then drop all unit rules.",
    g2,
  )

  const g3 = removeUselessSymbols(g2)
  pushStep(
    log,
    'step-3-remove-useless',
    'Remove useless symbols: first drop non-generating non-terminals (those that cannot derive any terminal string), then drop non-reachable ones (those not reachable from the start symbol).',
    g3,
  )

  const g4 = binarizeProductions(g3)
  pushStep(
    log,
    'step-4-binarize',
    'Binarize: every production A → X1 X2 … Xk with k ≥ 3 is split using fresh helper non-terminals so the final RHS is at most length 2.',
    g4,
  )

  const g5 = replaceTerminalsInLongProductions(g4)
  pushStep(
    log,
    'step-5-terminal-replace',
    "Replace terminals in length-2 productions. Each terminal 'a' appearing in a two-symbol RHS is replaced with a dedicated non-terminal T_a with the single rule T_a → a.",
    g5,
  )

  return {
    grammar: g5,
    steps: log.toArray(),
    intermediate: { step1: g1, step2: g2, step3: g3, step4: g4, step5: g5 },
  }
}

// ── Post-condition check: CNF form validation ─────────────────────────────

/** Returns [] if the grammar is in strict CNF, else an array of offending prods. */
export function validateCNF(g) {
  const offenders = []
  const startNullableAllowed =
    g.productions.some(
      (p) => p.lhs === g.start && p.rhs.length === 0,
    )
  for (const p of g.productions) {
    if (p.rhs.length === 0) {
      if (p.lhs === g.start && startNullableAllowed) continue
      offenders.push(p)
      continue
    }
    if (p.rhs.length === 1) {
      if (!g.terminals.has(p.rhs[0])) offenders.push(p)
      continue
    }
    if (p.rhs.length === 2) {
      if (!g.nonTerminals.has(p.rhs[0]) || !g.nonTerminals.has(p.rhs[1])) {
        offenders.push(p)
      }
      continue
    }
    offenders.push(p)
  }
  return offenders
}
