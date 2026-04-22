/**
 * Unified graph model.
 *
 *   Node = { id, isStart, isAccept, label? }   // label is what the renderer shows; defaults to id
 *   Edge = { id, source, target, label }       // label === 'ε' marks epsilon
 *   Graph = { nodes, edges }
 *
 * Algorithms produce Graphs; renderers consume Graphs.
 * Converters here keep the engine layer free of UI concerns.
 */

export const EPSILON = 'ε'

/**
 * Build a Graph from an NFA shape:
 *   nfa = {
 *     start:      stateId,
 *     accepts:    stateId[],
 *     states:     { id, label? }[],
 *     transitions:{ from, to, symbol }[]
 *   }
 */
export function nfaToGraph(nfa) {
  const accepts = new Set(nfa.accepts || [])
  const nodes = nfa.states.map((s) => ({
    id: s.id,
    isStart: s.id === nfa.start,
    isAccept: accepts.has(s.id),
    ...(s.label ? { label: s.label } : {}),
  }))
  const edges = nfa.transitions.map((t, i) => ({
    id: `e${i}`,
    source: t.from,
    target: t.to,
    label: t.symbol,
  }))
  return { nodes, edges }
}

/**
 * Build a Graph from a DFA shape (per-symbol deterministic δ).
 *   dfa = {
 *     start:     stateId,
 *     accepts:   stateId[],
 *     states:    { id, label? }[],
 *     alphabet:  string[],
 *     delta:     { [stateId]: { [symbol]: stateId } },
 *   }
 * Parallel edges between the same (source,target) pair are merged so the
 * diagram stays readable.
 */
export function dfaToGraph(dfa) {
  const accepts = new Set(dfa.accepts || [])
  const nodes = dfa.states.map((s) => ({
    id: s.id,
    isStart: s.id === dfa.start,
    isAccept: accepts.has(s.id),
    ...(s.label ? { label: s.label } : {}),
  }))
  const perPair = new Map()
  for (const s of dfa.states) {
    const row = dfa.delta[s.id] || {}
    for (const sym of Object.keys(row)) {
      const tgt = row[sym]
      const key = `${s.id}→${tgt}`
      if (!perPair.has(key)) perPair.set(key, { source: s.id, target: tgt, syms: [] })
      perPair.get(key).syms.push(sym)
    }
  }
  const edges = []
  let i = 0
  for (const { source, target, syms } of perPair.values()) {
    edges.push({
      id: `d${i++}`,
      source,
      target,
      label: syms.join(', '),
    })
  }
  return { nodes, edges }
}

/**
 * Merge parallel edges between the same (source,target) pair into a single
 * edge whose label is "a, b, ε". Useful for DFAs/NFAs with dense transitions.
 * ε is preserved in the merged label so ε-transitions remain visible.
 */
export function mergeParallelEdges(graph) {
  const byPair = new Map()
  for (const e of graph.edges) {
    const key = `${e.source}→${e.target}`
    if (!byPair.has(key)) byPair.set(key, [])
    byPair.get(key).push(e)
  }
  const merged = []
  let i = 0
  for (const [, edges] of byPair) {
    const labels = edges.map((e) => e.label)
    const hasEpsilon = labels.includes(EPSILON)
    const label = [...new Set(labels)].join(', ')
    merged.push({
      id: `m${i++}`,
      source: edges[0].source,
      target: edges[0].target,
      label,
      hasEpsilon,
    })
  }
  return { nodes: graph.nodes, edges: merged }
}
