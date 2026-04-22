/**
 * Complexity Analyzer — curated catalog of canonical decision problems with
 * their complexity class (P, NP, NP-Complete, NP-Hard) and the polynomial-time
 * reductions that connect them.  Powers Section 2 of the spec.
 *
 * Shape:
 *   CATALOG entry = {
 *     id, name, definition, decision_or_optimization,
 *     class,                  // 'P' | 'NP' | 'NPC' | 'NPH'
 *     best_time_known,        // short big-O string
 *     reduction_from?,        // id of problem reduced TO this one
 *     reason,                 // why it lies in that class
 *     notes?,
 *   }
 *
 *   COMPLEXITY_REDUCTIONS: { from, to, mapping, idea }
 *     (polynomial-time many-one reduction from → to, so hardness flows forward)
 */

export const COMPLEXITY_CLASS = Object.freeze({
  P: 'P',
  NP: 'NP',
  NPC: 'NP-Complete',
  NPH: 'NP-Hard',
})

export const COMPLEXITY_CATALOG = [
  // ── In P ─────────────────────────────────────────────────────────────
  {
    id: '2SAT',
    name: '2-SAT',
    definition: 'Given a CNF where every clause has ≤ 2 literals, is it satisfiable?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.P,
    best_time_known: 'O(n + m)',
    reason:
      'Implication graph + Kosaraju\'s SCC algorithm: satisfiable iff no variable x is in the same SCC as ¬x.',
  },
  {
    id: 'PATH',
    name: 'PATH (s→t reachability)',
    definition: 'Given a directed graph G and vertices s, t, is there a path from s to t?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.P,
    best_time_known: 'O(n + m)',
    reason: 'BFS / DFS from s in linear time.',
  },
  {
    id: 'MATCHING',
    name: 'Maximum bipartite matching',
    definition: 'Given a bipartite graph G, find a matching of maximum size.',
    decision_or_optimization: 'optimization',
    class: COMPLEXITY_CLASS.P,
    best_time_known: 'O(E · √V)',
    reason: 'Hopcroft–Karp; also reducible to max-flow.',
  },

  // ── NP-Complete (the classic chain) ─────────────────────────────────
  {
    id: 'CIRCUIT_SAT',
    name: 'CIRCUIT-SAT',
    definition: 'Given a boolean circuit C, is there an input that makes C output 1?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'No known sub-exponential algorithm.',
    reason:
      'Cook–Levin: every NP problem reduces to CIRCUIT-SAT by simulating the NP verifier as a circuit.',
    notes: 'Root of almost every NPC reduction.',
  },
  {
    id: 'SAT',
    name: 'SAT',
    definition: 'Given a boolean formula φ in CNF, is there an assignment that satisfies φ?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: '2ⁿ (brute force); modern SAT solvers handle 10⁶+ vars in practice.',
    reduction_from: 'CIRCUIT_SAT',
    reason: 'Cook–Levin theorem: first problem proved NP-Complete.',
  },
  {
    id: '3SAT',
    name: '3-SAT',
    definition: 'SAT restricted to CNF formulas where every clause has exactly 3 literals.',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(1.307ⁿ) — PPSZ algorithm',
    reduction_from: 'SAT',
    reason: 'Split every long clause (x₁∨…∨xₖ) into 3-clauses using fresh variables.',
  },
  {
    id: 'CLIQUE',
    name: 'CLIQUE',
    definition: 'Given G and k, does G contain a clique of size ≥ k?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(n^(k/3)) via matrix multiplication for fixed k',
    reduction_from: '3SAT',
    reason: 'Classical reduction: clause-vertices with edges between compatible literals.',
  },
  {
    id: 'IS',
    name: 'INDEPENDENT-SET',
    definition: 'Given G and k, does G have an independent set of size ≥ k?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'Same as CLIQUE (complement)',
    reduction_from: 'CLIQUE',
    reason: 'Independent set in G ↔ clique in the complement G̅.',
  },
  {
    id: 'VC',
    name: 'VERTEX-COVER',
    definition: 'Given G and k, is there a set of ≤ k vertices covering every edge?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(1.2738ᵏ + kn)',
    reduction_from: 'IS',
    reason: 'S is a vertex cover iff V \\ S is an independent set.',
  },
  {
    id: 'HAM_CYCLE',
    name: 'HAMILTONIAN-CYCLE',
    definition: 'Given G, does G contain a cycle visiting every vertex exactly once?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(2ⁿ · n²) — Bellman/Held-Karp',
    reduction_from: 'VC',
    reason: 'Karp\'s 21: gadget reduction from vertex cover.',
  },
  {
    id: 'TSP',
    name: 'TSP (decision)',
    definition: 'Given a weighted complete graph and budget B, is there a Hamiltonian cycle of cost ≤ B?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(2ⁿ · n²)',
    reduction_from: 'HAM_CYCLE',
    reason: 'Weight 1 on existing edges, 2 elsewhere; Hamiltonian cycle exists iff cost ≤ n.',
  },
  {
    id: 'SUBSET_SUM',
    name: 'SUBSET-SUM',
    definition: 'Given multiset S of integers and target t, is there a subset summing to t?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(n · t) pseudo-polynomial',
    reduction_from: '3SAT',
    reason: 'Digit-encoding reduction: each variable and clause contributes a fixed-width integer.',
    notes: 'Weakly NP-Complete: pseudo-polynomial DP exists.',
  },
  {
    id: 'PARTITION',
    name: 'PARTITION',
    definition: 'Can the multiset S be split into two subsets of equal sum?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(n · Σ) pseudo-polynomial',
    reduction_from: 'SUBSET_SUM',
    reason: 'Append a balancing element so the target becomes Σ/2.',
  },
  {
    id: 'KNAPSACK',
    name: '0/1 KNAPSACK (decision)',
    definition: 'Given items (wᵢ, vᵢ), capacity W, value goal V: does some subset achieve ≥ V with weight ≤ W?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(n · W) pseudo-polynomial',
    reduction_from: 'SUBSET_SUM',
    reason: 'Set wᵢ = vᵢ and V = W = t — exactly the SUBSET-SUM instance.',
  },
  {
    id: 'COLOR3',
    name: '3-COLORING',
    definition: 'Given G, can the vertices be 3-colored so adjacent vertices differ?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPC,
    best_time_known: 'O(1.329ⁿ) — Björklund–Husfeldt',
    reduction_from: '3SAT',
    reason: 'Classical gadget reduction: truth gadget + clause gadget.',
  },

  // ── NP-Hard but not known in NP ─────────────────────────────────────
  {
    id: 'TSP_OPT',
    name: 'TSP (optimization)',
    definition: 'Given a weighted complete graph, find a Hamiltonian cycle of minimum cost.',
    decision_or_optimization: 'optimization',
    class: COMPLEXITY_CLASS.NPH,
    best_time_known: 'O(2ⁿ · n²)',
    reduction_from: 'TSP',
    reason: 'Optimization version; not a yes/no problem, so not in NP directly, but at least as hard.',
  },
  {
    id: 'HALTING',
    name: 'HALTING (as a "complexity" datum)',
    definition: 'Given ⟨M, w⟩, does M halt on w?',
    decision_or_optimization: 'decision',
    class: COMPLEXITY_CLASS.NPH,
    best_time_known: 'Undecidable (no finite time).',
    reason:
      'Trivially NP-Hard: every NP problem reduces to it (since NP ⊂ decidable). But HALTING is not in NP (not even decidable).',
    notes: 'Included to illustrate that NP-Hard ⊋ NP-Complete: NPC = NPH ∩ NP.',
  },
]

/**
 * Polynomial-time reductions catalogued for the "reduction chain" visualizer.
 * Each entry is (from, to, mapping, idea) meaning from ≤_p to.
 * The hardness arrow points forward: NP-hardness of `from` implies of `to`.
 */
export const COMPLEXITY_REDUCTIONS = [
  {
    from: 'CIRCUIT_SAT',
    to: 'SAT',
    mapping: 'Tseytin transformation: each gate gets a fresh variable + equivalence clauses.',
    idea: 'Encodes circuit semantics as CNF in linear size.',
  },
  {
    from: 'SAT',
    to: '3SAT',
    mapping: '(x₁∨…∨xₖ) ↦ (x₁∨x₂∨y₁) ∧ (¬y₁∨x₃∨y₂) ∧ …',
    idea: 'Pad long clauses with fresh linking variables yᵢ.',
  },
  {
    from: '3SAT',
    to: 'CLIQUE',
    mapping: 'Vertex per literal per clause; edge between compatible literals in different clauses.',
    idea: 'k-clause formula is satisfiable iff the graph has a k-clique.',
  },
  {
    from: 'CLIQUE',
    to: 'IS',
    mapping: 'G has a k-clique iff G̅ has an independent set of size k.',
    idea: 'Take the complement graph.',
  },
  {
    from: 'IS',
    to: 'VC',
    mapping: 'S independent set ↔ V\\S vertex cover.',
    idea: 'Complement of IS within the vertex set.',
  },
  {
    from: 'VC',
    to: 'HAM_CYCLE',
    mapping: 'Karp\'s "cover gadgets" + selector vertices.',
    idea: 'Each gadget forces one of two traversals corresponding to the two endpoints of an edge.',
  },
  {
    from: 'HAM_CYCLE',
    to: 'TSP',
    mapping: 'Weight 1 on existing edges, 2 elsewhere; budget B = n.',
    idea: 'A Hamiltonian cycle has weight exactly n; any other cycle ≥ n + 1.',
  },
  {
    from: '3SAT',
    to: 'SUBSET_SUM',
    mapping: 'Variable- and clause-gadget integers in fixed-width base-10 encoding.',
    idea: 'Each column of the digit representation enforces one literal or one clause slot.',
  },
  {
    from: 'SUBSET_SUM',
    to: 'PARTITION',
    mapping: 'Append a balancing integer Σ + 1 − 2t and another 2·(Σ − t) + 1.',
    idea: 'Two equal-sum halves iff original has a subset summing to t.',
  },
  {
    from: 'SUBSET_SUM',
    to: 'KNAPSACK',
    mapping: 'wᵢ = vᵢ = sᵢ, W = V = t.',
    idea: 'Directly transfers the subset-sum instance.',
  },
  {
    from: '3SAT',
    to: 'COLOR3',
    mapping: 'Palette gadget with 3 reference colors + variable and clause gadgets.',
    idea: 'Satisfying assignment iff proper 3-coloring of the gadget graph.',
  },
  {
    from: 'TSP',
    to: 'TSP_OPT',
    mapping: 'Decision version is the search problem\'s threshold oracle.',
    idea: 'Optimization is at least as hard as decision.',
  },
]

/**
 * Build a Cytoscape-ready reduction graph:
 *   nodes: one per problem, typed by class
 *   edges: one per reduction, labelled with short mapping
 */
export function complexityGraph() {
  const nodes = COMPLEXITY_CATALOG.map((p) => ({
    id: p.id,
    label: p.name,
    isStart: false,
    isAccept: false,
    category: p.class,
  }))
  const edges = COMPLEXITY_REDUCTIONS.map((e, i) => ({
    id: `r_${i}`,
    source: e.from,
    target: e.to,
    label: e.mapping,
  }))
  return { nodes, edges }
}

/**
 * Reduction path from `srcId` → `tgtId` using BFS over COMPLEXITY_REDUCTIONS.
 * Returns the list of catalog entries on the path, or null if unreachable.
 */
export function reductionPathBetween(srcId, tgtId) {
  const adj = new Map()
  for (const e of COMPLEXITY_REDUCTIONS) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    adj.get(e.from).push(e)
  }
  const byId = new Map(COMPLEXITY_CATALOG.map((p) => [p.id, p]))
  const parent = new Map([[srcId, null]])
  const queue = [srcId]
  while (queue.length) {
    const cur = queue.shift()
    if (cur === tgtId) break
    for (const e of adj.get(cur) || []) {
      if (!parent.has(e.to)) {
        parent.set(e.to, { via: e, prev: cur })
        queue.push(e.to)
      }
    }
  }
  if (!parent.has(tgtId)) return null
  const path = []
  let cur = tgtId
  while (cur) {
    const edge = parent.get(cur)
    const node = byId.get(cur)
    path.push({ problem: node, via: edge?.via || null })
    cur = edge?.prev ?? null
  }
  return path.reverse()
}
