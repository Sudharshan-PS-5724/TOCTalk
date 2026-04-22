/**
 * CFG → Greibach Normal Form.
 *
 * Algorithm (standard textbook form, e.g. Hopcroft-Ullman Thm 6.11):
 *
 *   Prereq: grammar has no ε-productions (except possibly the start rule) and
 *   no unit productions. We run removeEpsilonProductions + removeUnitProductions
 *   first, then drop useless symbols.
 *
 *   Let V = {A1, A2, …, An} in a fixed order.
 *
 *   (a) For i = 1 … n:
 *         1. For j = 1 … i-1:
 *              For every production Ai → Aj γ, replace it by Ai → β γ for
 *              each Aj → β.  (All Aj productions, thanks to previous outer
 *              iterations, now start with a terminal or Ak for some k ≥ j.)
 *         2. Eliminate immediate left recursion on Ai:
 *              If Ai → Ai α1 | … | Ai αm | β1 | … | βp, introduce fresh Bi:
 *                 Ai  → β1 | … | βp | β1 Bi | … | βp Bi
 *                 Bi  → α1 | … | αm | α1 Bi | … | αm Bi
 *
 *   After (a), every Ai-production starts either with a terminal or with
 *   some Aj where j > i.
 *
 *   (b) Walk i = n … 1: substitute each remaining Aj prefix (j > i).
 *   (c) Substitute into every Bi similarly.
 *
 * Safety: productions count is capped at `maxProductions` (default 500).
 * If the cap is hit we throw a `CFGError` so the UI can surface a clear
 * "grammar too complex for GNF" message instead of freezing.
 */

import { CFGError } from '../errors.js'
import {
  cloneGrammar,
  dedupeProductions,
  formatGrammar,
  freshNonTerminal,
  makeGrammar,
} from './cfg.js'
import {
  removeEpsilonProductions,
  removeUnitProductions,
  removeUselessSymbols,
} from './cnf.js'
import { StepLog } from '../derivation/stepLog.js'

const MAX_PRODUCTIONS_DEFAULT = 500

function pushStep(log, operation, explanation, grammar, extras = {}) {
  log.push({
    operation,
    explanation,
    graph: { nodes: [], edges: [] },
    extras: {
      ...extras,
      grammar: formatGrammar(grammar),
      productions: grammar.productions.slice(),
      start: grammar.start,
    },
  })
}

function assertCap(grammar, cap) {
  if (grammar.productions.length > cap) {
    throw new CFGError(
      `GNF conversion produced more than ${cap} productions. The input grammar is likely too complex for an in-browser lab; simplify it or disable the cap.`,
      { productionCount: grammar.productions.length, cap },
    )
  }
}

export function toGNF(grammar, opts = {}) {
  const cap = opts.maxProductions ?? MAX_PRODUCTIONS_DEFAULT
  const log = new StepLog()
  pushStep(log, 'input', 'Input grammar.', grammar)

  // ── Preprocess: remove ε, unit, useless ──────────────────────────────
  let g = removeEpsilonProductions(grammar)
  pushStep(log, 'pre-remove-ε', 'Remove ε-productions (mirroring the CNF pipeline).', g)
  g = removeUnitProductions(g)
  pushStep(log, 'pre-remove-unit', 'Remove unit productions.', g)
  g = removeUselessSymbols(g)
  pushStep(log, 'pre-remove-useless', 'Drop non-generating and non-reachable symbols.', g)
  assertCap(g, cap)

  // Fixed order of non-terminals. Start symbol first for readable derivations.
  const order = [g.start, ...[...g.nonTerminals].filter((n) => n !== g.start)]
  const idxOf = new Map(order.map((nt, i) => [nt, i]))
  const helperFor = new Map() // Ai → Bi

  // ── (a.1) + (a.2) ─────────────────────────────────────────────────────
  for (let i = 0; i < order.length; i++) {
    const Ai = order[i]
    // (a.1) substitute Aj for j < i
    for (let j = 0; j < i; j++) {
      const Aj = order[j]
      const before = g.productions.length
      g = substituteLeadingNT(g, Ai, Aj)
      assertCap(g, cap)
      if (g.productions.length !== before) {
        pushStep(
          log,
          `sub-${Ai}-${Aj}`,
          `Substitute ${Aj}'s productions into every ${Ai} → ${Aj} γ so ${Ai}'s productions no longer start with ${Aj}.`,
          g,
        )
      }
    }
    // (a.2) eliminate immediate left recursion on Ai
    const hasImmediateLR = g.productions.some(
      (p) => p.lhs === Ai && p.rhs.length > 0 && p.rhs[0] === Ai,
    )
    if (hasImmediateLR) {
      g = eliminateImmediateLeftRecursion(g, Ai, helperFor)
      assertCap(g, cap)
      pushStep(
        log,
        `elim-LR-${Ai}`,
        `Eliminate immediate left recursion on ${Ai} by introducing a fresh helper non-terminal.`,
        g,
      )
    }
  }

  // After (a), every Ai-production starts with a terminal or Aj with j > i
  // (or a helper Bi, which we handle in pass (c)).
  // ── (b) Back-substitute from i = n down to 1 ─────────────────────────
  for (let i = order.length - 1; i >= 0; i--) {
    const Ai = order[i]
    // Repeatedly substitute until every Ai production starts with a terminal
    // (or a helper Bi that we will fix in pass c).
    let changed = true
    let rounds = 0
    while (changed && rounds++ < order.length + 4) {
      changed = false
      const current = g.productions.filter((p) => p.lhs === Ai)
      for (const p of current) {
        if (p.rhs.length === 0) continue
        const lead = p.rhs[0]
        if (g.terminals.has(lead)) continue
        if (helperFor.has(Ai) && lead === helperFor.get(Ai)) continue
        // lead is a non-terminal; substitute its productions
        const beforeCount = g.productions.length
        g = substituteSpecificProduction(g, p, lead)
        assertCap(g, cap)
        if (g.productions.length !== beforeCount) {
          changed = true
        }
      }
    }
    pushStep(
      log,
      `back-sub-${Ai}`,
      `Back-substitute leading non-terminals into ${Ai}'s productions so each starts with a terminal.`,
      g,
    )
  }

  // ── (c) Fix helper Bi productions so they start with terminals too ───
  for (const [Ai, Bi] of helperFor) {
    let changed = true
    let rounds = 0
    while (changed && rounds++ < order.length + 4) {
      changed = false
      const current = g.productions.filter((p) => p.lhs === Bi)
      for (const p of current) {
        if (p.rhs.length === 0) continue
        const lead = p.rhs[0]
        if (g.terminals.has(lead)) continue
        const before = g.productions.length
        g = substituteSpecificProduction(g, p, lead)
        assertCap(g, cap)
        if (g.productions.length !== before) changed = true
      }
    }
    pushStep(
      log,
      `fix-helper-${Bi}`,
      `Expand helper ${Bi} (from eliminating left recursion on ${Ai}) so every ${Bi} rule starts with a terminal.`,
      g,
    )
  }

  // Final cleanup: drop any lingering useless symbols.
  g = removeUselessSymbols(g)
  pushStep(log, 'finalize', 'Final GNF grammar. Every production starts with a terminal.', g)

  return {
    grammar: g,
    steps: log.toArray(),
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

function substituteLeadingNT(grammar, Ai, Aj) {
  const g = cloneGrammar(grammar)
  const AjProds = g.productions.filter((p) => p.lhs === Aj)
  const out = []
  for (const p of g.productions) {
    if (p.lhs !== Ai || p.rhs.length === 0 || p.rhs[0] !== Aj) {
      out.push(p)
      continue
    }
    const rest = p.rhs.slice(1)
    for (const q of AjProds) {
      out.push({ lhs: Ai, rhs: [...q.rhs, ...rest] })
    }
  }
  g.productions = dedupeProductions(out)
  return g
}

function substituteSpecificProduction(grammar, target, leadNT) {
  const g = cloneGrammar(grammar)
  const leadProds = g.productions.filter((p) => p.lhs === leadNT)
  const out = []
  for (const p of g.productions) {
    if (p !== target && !(p.lhs === target.lhs && sameRHS(p.rhs, target.rhs))) {
      out.push(p)
      continue
    }
    const rest = p.rhs.slice(1)
    for (const q of leadProds) {
      out.push({ lhs: p.lhs, rhs: [...q.rhs, ...rest] })
    }
  }
  g.productions = dedupeProductions(out)
  return g
}

function sameRHS(a, b) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function eliminateImmediateLeftRecursion(grammar, A, helperFor) {
  const g = cloneGrammar(grammar)
  const Aprods = g.productions.filter((p) => p.lhs === A)
  const recursive = [] // α from A → A α
  const base = [] // β from A → β (β not starting with A)
  for (const p of Aprods) {
    if (p.rhs.length > 0 && p.rhs[0] === A) {
      recursive.push(p.rhs.slice(1))
    } else {
      base.push(p.rhs.slice())
    }
  }
  if (recursive.length === 0) return g

  const B = freshNonTerminal(g.nonTerminals, A)
  g.nonTerminals.add(B)
  helperFor.set(A, B)

  const newProds = g.productions.filter((p) => p.lhs !== A)
  for (const beta of base) {
    newProds.push({ lhs: A, rhs: beta.slice() })
    newProds.push({ lhs: A, rhs: [...beta, B] })
  }
  for (const alpha of recursive) {
    newProds.push({ lhs: B, rhs: alpha.slice() })
    newProds.push({ lhs: B, rhs: [...alpha, B] })
  }
  g.productions = dedupeProductions(newProds)
  return makeGrammar({
    start: g.start,
    nonTerminals: g.nonTerminals,
    terminals: g.terminals,
    productions: g.productions,
  })
}
