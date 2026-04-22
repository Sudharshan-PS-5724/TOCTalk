/**
 * CFG data model + shared utilities used by every grammar transformation.
 *
 * Canonical grammar shape (immutable by convention; transforms return a NEW
 * grammar so step logs can keep snapshots):
 *
 *   Grammar = {
 *     start:         string,                     // start non-terminal
 *     nonTerminals:  Set<string>,
 *     terminals:     Set<string>,
 *     productions:   Production[],
 *   }
 *   Production = { lhs: string, rhs: string[] }  // rhs = [] means ε
 *
 * Symbol convention (matches SRS §1.2):
 *   • Non-terminals: single uppercase letter A–Z (optionally + digit, e.g. A1)
 *   • Terminals:     single lowercase letter a–z or digit 0–9
 *   • ε is represented as an empty rhs array, NEVER as the string 'ε' inside rhs
 */

export const NT_RE = /^[A-Z][0-9]?$/
export const T_RE = /^[a-z0-9]$/

export function isNonTerminal(s) {
  return typeof s === 'string' && NT_RE.test(s)
}

export function isTerminal(s) {
  return typeof s === 'string' && T_RE.test(s)
}

export function makeGrammar({ start, productions, nonTerminals, terminals }) {
  return {
    start,
    nonTerminals: nonTerminals instanceof Set ? new Set(nonTerminals) : new Set(nonTerminals || []),
    terminals: terminals instanceof Set ? new Set(terminals) : new Set(terminals || []),
    productions: productions.map((p) => ({ lhs: p.lhs, rhs: p.rhs.slice() })),
  }
}

/** Deep clone. Transforms should never mutate their input. */
export function cloneGrammar(g) {
  return {
    start: g.start,
    nonTerminals: new Set(g.nonTerminals),
    terminals: new Set(g.terminals),
    productions: g.productions.map((p) => ({ lhs: p.lhs, rhs: p.rhs.slice() })),
  }
}

/** Generate a non-terminal name not already used. Tries A', A'', A1, A2 … */
export function freshNonTerminal(nts, base = 'A') {
  const primes = [`${base}'`, `${base}''`, `${base}'''`]
  for (const name of primes) if (!nts.has(name)) return name
  for (let i = 1; i < 999; i++) {
    const name = `${base}${i}`
    if (!nts.has(name)) return name
  }
  // Fallback — unlikely in practice.
  return `${base}_${nts.size}`
}

/**
 * Canonical string form of an rhs, treating [] as 'ε'.
 * Used for deduplication and pretty-printing.
 */
export function rhsKey(rhs) {
  return rhs.length === 0 ? 'ε' : rhs.join('·')
}

/** Deduplicate productions by (lhs, rhs) while preserving order. */
export function dedupeProductions(prods) {
  const seen = new Set()
  const out = []
  for (const p of prods) {
    const k = `${p.lhs}→${rhsKey(p.rhs)}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push({ lhs: p.lhs, rhs: p.rhs.slice() })
  }
  return out
}

// ─── Closure computations shared by CNF / GNF / regular-grammar checks ───

/** nullable = { A : A ⇒* ε }. Computed by fixed-point over productions. */
export function computeNullable(grammar) {
  const nullable = new Set()
  for (const p of grammar.productions) {
    if (p.rhs.length === 0) nullable.add(p.lhs)
  }
  let changed = true
  while (changed) {
    changed = false
    for (const p of grammar.productions) {
      if (nullable.has(p.lhs)) continue
      if (p.rhs.every((s) => grammar.nonTerminals.has(s) && nullable.has(s))) {
        nullable.add(p.lhs)
        changed = true
      }
    }
  }
  return nullable
}

/** generating = { A : A ⇒* w for some w ∈ Σ* }. */
export function computeGenerating(grammar) {
  const gen = new Set()
  let changed = true
  while (changed) {
    changed = false
    for (const p of grammar.productions) {
      if (gen.has(p.lhs)) continue
      if (
        p.rhs.every(
          (s) => grammar.terminals.has(s) || gen.has(s),
        )
      ) {
        gen.add(p.lhs)
        changed = true
      }
    }
  }
  return gen
}

/** reachable = { A : S ⇒* α A β for some α,β }. */
export function computeReachable(grammar) {
  const reach = new Set([grammar.start])
  let changed = true
  while (changed) {
    changed = false
    for (const p of grammar.productions) {
      if (!reach.has(p.lhs)) continue
      for (const s of p.rhs) {
        if (grammar.nonTerminals.has(s) && !reach.has(s)) {
          reach.add(s)
          changed = true
        }
      }
    }
  }
  return reach
}

/** Pretty-print a grammar as multi-line "S -> aA | ε" form. */
export function formatGrammar(g) {
  const byLhs = new Map()
  for (const p of g.productions) {
    if (!byLhs.has(p.lhs)) byLhs.set(p.lhs, [])
    byLhs.get(p.lhs).push(p.rhs.length === 0 ? 'ε' : p.rhs.join(''))
  }
  const ordered = []
  if (byLhs.has(g.start)) ordered.push(g.start)
  for (const nt of byLhs.keys()) if (nt !== g.start) ordered.push(nt)
  return ordered
    .map((lhs) => `${lhs} -> ${[...new Set(byLhs.get(lhs))].join(' | ')}`)
    .join('\n')
}
