/**
 * CFG → single-state PDA (empty-stack acceptance).
 *
 * Canonical construction (Hopcroft/Ullman §6):
 *   P = ({q}, Σ, Γ, δ, q, Z0, ∅)   where Z0 = start symbol S of the CFG
 *   Γ = V ∪ Σ
 *
 *   For every production A → α:
 *       δ(q, ε, A) ∋ (q, α)         // replace NT by its RHS (pushed onto stack)
 *   For every terminal a ∈ Σ:
 *       δ(q, a, a) = { (q, ε) }     // match terminal, pop
 *
 * Acceptance: input fully consumed AND stack empty.
 *
 * The returned PDA shape is:
 *   {
 *     states: ['q'],
 *     inputAlphabet: string[],          // Σ
 *     stackAlphabet: string[],          // Γ
 *     start: 'q',
 *     initialStack: 'S',
 *     acceptMode: 'empty-stack',
 *     transitions: Array<{
 *       from: 'q', to: 'q',
 *       input: string | 'ε',            // input symbol consumed ('ε' for ε-move)
 *       pop:   string,                  // stack-top symbol to pop
 *       push:  string[],                // sequence of symbols pushed (top-of-stack LAST)
 *       source: 'expand' | 'match',     // provenance (expand from production, match terminal)
 *       production?: { lhs, rhs },      // when source === 'expand'
 *     }>
 *   }
 *
 * IMPORTANT push-order convention (matches canonical derivations):
 *   For production A → X1 X2 X3, we pop A and push [X1, X2, X3] such that
 *   X1 ends up ON TOP of the stack. In our representation the LAST element
 *   of `push` is the eventual top-of-stack, so push = [X3, X2, X1].
 *   The simulator honors this convention.
 */

export function cfgToPDA(grammar) {
  const transitions = []

  for (const p of grammar.productions) {
    // Push reversed so that the first rhs symbol ends up on top of the stack.
    const pushSeq = p.rhs.slice().reverse()
    transitions.push({
      from: 'q',
      to: 'q',
      input: 'ε',
      pop: p.lhs,
      push: pushSeq,
      source: 'expand',
      production: { lhs: p.lhs, rhs: p.rhs.slice() },
    })
  }

  for (const a of grammar.terminals) {
    transitions.push({
      from: 'q',
      to: 'q',
      input: a,
      pop: a,
      push: [],
      source: 'match',
    })
  }

  return {
    states: ['q'],
    inputAlphabet: [...grammar.terminals].sort(),
    stackAlphabet: [...new Set([...grammar.nonTerminals, ...grammar.terminals])].sort(),
    start: 'q',
    initialStack: grammar.start,
    acceptMode: 'empty-stack',
    transitions,
  }
}

/** Human-readable δ rules, one per line. Useful for the UI. */
export function formatPDARules(pda) {
  const lines = []
  for (const t of pda.transitions) {
    const pushStr = t.push.length === 0 ? 'ε' : t.push.slice().reverse().join('')
    const inStr = t.input === 'ε' ? 'ε' : `'${t.input}'`
    lines.push(
      `δ(${t.from}, ${inStr}, ${t.pop}) → (${t.to}, ${pushStr})${
        t.source === 'expand' && t.production
          ? `    // ${t.production.lhs} → ${t.production.rhs.length ? t.production.rhs.join('') : 'ε'}`
          : t.source === 'match'
            ? '    // match'
            : ''
      }`,
    )
  }
  return lines.join('\n')
}
