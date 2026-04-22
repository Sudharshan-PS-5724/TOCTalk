/**
 * Decidability Lab — curated catalog of canonical decision problems together
 * with their classification (decidable / undecidable / semi-decidable), the
 * reduction edges that prove undecidability, and a Rice's-theorem predicate
 * classifier.
 *
 * The catalog is intentionally data-driven: it powers the Decidability Lab
 * UI (structured output, reduction chains, Rice's theorem) without attempting
 * to "solve" decidability algorithmically (which is itself undecidable).
 *
 * Shape:
 *   CATALOG entry = {
 *     id, name, definition, classification, language_class,
 *     reduction_from?,   // id of the problem used to prove undecidability
 *     proof,             // { strategy, steps: string[] }
 *     rice_applicable,   // boolean
 *     notes?,
 *   }
 *
 *   REDUCTION_EDGES: { from, to, mapping, explanation }  (from ≤_m to)
 */

export const DECIDABILITY = Object.freeze({
  DECIDABLE: 'decidable',
  SEMI_DECIDABLE: 'semi-decidable',
  UNDECIDABLE: 'undecidable',
  CO_SEMI: 'co-semi-decidable',
})

export const DECIDABILITY_CATALOG = [
  // ── DECIDABLE over regular / CF languages ───────────────────────────
  {
    id: 'A_DFA',
    name: 'A_DFA',
    definition: 'A_DFA = { ⟨D, w⟩ : D is a DFA that accepts w }.',
    classification: DECIDABILITY.DECIDABLE,
    language_class: 'regular',
    proof: {
      strategy: 'Direct simulation.',
      steps: [
        'Given ⟨D, w⟩, simulate D on w for exactly |w| steps.',
        'Every DFA step runs in O(1); total time O(|w|).',
        'Accept ⟨D, w⟩ iff the simulation ends in a final state.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'E_DFA',
    name: 'E_DFA',
    definition: 'E_DFA = { ⟨D⟩ : L(D) = ∅ }.',
    classification: DECIDABILITY.DECIDABLE,
    language_class: 'regular',
    proof: {
      strategy: 'Reachability on the DFA graph.',
      steps: [
        'Compute the set of states reachable from the start state via BFS/DFS.',
        'Accept iff no reachable state is a final state.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'EQ_DFA',
    name: 'EQ_DFA',
    definition: 'EQ_DFA = { ⟨D₁, D₂⟩ : L(D₁) = L(D₂) }.',
    classification: DECIDABILITY.DECIDABLE,
    language_class: 'regular',
    proof: {
      strategy: 'Symmetric difference + E_DFA.',
      steps: [
        'Build a DFA D for (L(D₁) \\ L(D₂)) ∪ (L(D₂) \\ L(D₁)) using the product construction.',
        'Invoke the decider for E_DFA on D.',
        'Accept ⟨D₁, D₂⟩ iff L(D) = ∅.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'A_CFG',
    name: 'A_CFG',
    definition: 'A_CFG = { ⟨G, w⟩ : G is a CFG and w ∈ L(G) }.',
    classification: DECIDABILITY.DECIDABLE,
    language_class: 'context-free',
    proof: {
      strategy: 'CYK algorithm on the CNF form of G.',
      steps: [
        'Convert G to Chomsky Normal Form.',
        'Run CYK: O(|w|³ · |G|).',
        'Accept iff the start symbol derives w.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'E_CFG',
    name: 'E_CFG',
    definition: 'E_CFG = { ⟨G⟩ : L(G) = ∅ }.',
    classification: DECIDABILITY.DECIDABLE,
    language_class: 'context-free',
    proof: {
      strategy: 'Generating-symbol marking.',
      steps: [
        'Mark every terminal as generating.',
        'Iteratively mark each non-terminal X such that X → α where every symbol of α is marked.',
        'Accept iff the start symbol is never marked.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'EQ_CFG',
    name: 'EQ_CFG',
    definition: 'EQ_CFG = { ⟨G₁, G₂⟩ : L(G₁) = L(G₂) }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'context-free',
    reduction_from: 'ALL_CFG',
    proof: {
      strategy: 'Reduce ALL_CFG ≤_m EQ_CFG (ALL_CFG is known undecidable).',
      steps: [
        'Given ⟨G⟩ for ALL_CFG, build G_Σ with L(G_Σ) = Σ*.',
        'Ask whether L(G) = L(G_Σ).',
        'Yes iff G generates every string.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'ALL_CFG',
    name: 'ALL_CFG',
    definition: 'ALL_CFG = { ⟨G⟩ : L(G) = Σ* }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'context-free',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Reduce A_TM ≤_m ALL_CFG via computation histories.',
      steps: [
        'Encode rejecting computation histories of a TM M on w as strings.',
        'Build a CFG G that generates exactly those strings which are NOT a valid accepting history.',
        'Then L(G) = Σ* iff no accepting history exists iff M does not accept w.',
      ],
    },
    rice_applicable: false,
  },

  // ── UNDECIDABLE TM problems ─────────────────────────────────────────
  {
    id: 'A_TM',
    name: 'A_TM (acceptance)',
    definition: 'A_TM = { ⟨M, w⟩ : M is a TM that accepts w }.',
    classification: DECIDABILITY.SEMI_DECIDABLE,
    language_class: 'recursively-enumerable',
    reduction_from: null,
    proof: {
      strategy: 'Diagonalization (Turing).',
      steps: [
        'Assume a decider H for A_TM exists.',
        'Construct D(⟨M⟩) that runs H(⟨M, ⟨M⟩⟩) and inverts its answer.',
        'Consider D(⟨D⟩): D accepts ⟨D⟩ iff D rejects ⟨D⟩ — contradiction.',
        'Therefore no such H exists; A_TM is undecidable but clearly Turing-recognizable by simulation.',
      ],
    },
    rice_applicable: true,
    notes:
      'A_TM is semi-decidable but not decidable. Its complement is NOT semi-decidable.',
  },
  {
    id: 'HALT',
    name: 'HALT (Halting Problem)',
    definition: 'HALT = { ⟨M, w⟩ : M halts on input w }.',
    classification: DECIDABILITY.SEMI_DECIDABLE,
    language_class: 'recursively-enumerable',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Reduce A_TM ≤_m HALT.',
      steps: [
        'Assume a decider R for HALT.',
        'Build S on ⟨M, w⟩: run R(⟨M, w⟩). If it says "does not halt", reject. Else simulate M on w and return its answer.',
        'S would decide A_TM — contradiction.',
        'Therefore HALT is undecidable (but semi-decidable via direct simulation).',
      ],
    },
    rice_applicable: false,
    notes: 'HALT is a syntactic property of the machine, not a property of its language; Rice does not apply.',
  },
  {
    id: 'E_TM',
    name: 'E_TM (emptiness)',
    definition: 'E_TM = { ⟨M⟩ : L(M) = ∅ }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'co-recursively-enumerable',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Reduce A_TM ≤_m complement of E_TM.',
      steps: [
        'Given ⟨M, w⟩, construct M_w: on any input x, ignore x and simulate M on w; accept if M accepts.',
        'Then L(M_w) ≠ ∅ iff M accepts w.',
        'A decider for E_TM would decide A_TM — contradiction.',
      ],
    },
    rice_applicable: true,
    notes: 'E_TM is co-RE: the complement is Turing-recognizable.',
  },
  {
    id: 'EQ_TM',
    name: 'EQ_TM (equivalence)',
    definition: 'EQ_TM = { ⟨M₁, M₂⟩ : L(M₁) = L(M₂) }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'neither-RE-nor-coRE',
    reduction_from: 'E_TM',
    proof: {
      strategy: 'Reduce E_TM ≤_m EQ_TM.',
      steps: [
        'Given ⟨M⟩, build M_∅ that always rejects.',
        'Ask whether L(M) = L(M_∅).',
        'Yes iff L(M) = ∅.',
      ],
    },
    rice_applicable: true,
    notes: 'EQ_TM is neither RE nor co-RE.',
  },
  {
    id: 'REGULAR_TM',
    name: 'REGULAR_TM',
    definition: 'REGULAR_TM = { ⟨M⟩ : L(M) is regular }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'neither-RE-nor-coRE',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Rice\'s theorem (semantic, non-trivial property).',
      steps: [
        '"L(M) is regular" depends only on L(M), hence is semantic.',
        'It is non-trivial: some RE languages are regular (∅) and some are not ({0ⁿ1ⁿ}).',
        'By Rice\'s theorem REGULAR_TM is undecidable.',
      ],
    },
    rice_applicable: true,
  },
  {
    id: 'PCP',
    name: 'Post Correspondence Problem',
    definition:
      'PCP = { collections of dominoes [tᵢ / bᵢ] over Σ : some finite sequence of dominoes has matching top-and-bottom strings }.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'recursively-enumerable',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Reduce A_TM ≤_m MPCP ≤_m PCP (computation-history encoding).',
      steps: [
        'Encode each TM configuration C as a string #C#.',
        'Build dominoes so that any matching sequence spells out an accepting computation history of M on w.',
        'A solution exists iff M accepts w.',
      ],
    },
    rice_applicable: false,
  },
  {
    id: 'MPCP',
    name: 'Modified PCP',
    definition:
      'MPCP = PCP with the extra constraint that the first domino used must be domino 1.',
    classification: DECIDABILITY.UNDECIDABLE,
    language_class: 'recursively-enumerable',
    reduction_from: 'A_TM',
    proof: {
      strategy: 'Intermediate step in the A_TM → PCP reduction.',
      steps: [
        'Direct reduction from A_TM using the TM computation-history encoding.',
        'MPCP then reduces to PCP by a padding trick on the first / last dominoes.',
      ],
    },
    rice_applicable: false,
  },
]

/**
 * All reduction edges in the catalog. Each edge says "a reduces to b"
 * (written a ≤_m b), meaning undecidability flows FROM `from` TO `to`.
 */
export const REDUCTION_EDGES = [
  {
    from: 'A_TM',
    to: 'HALT',
    mapping: '⟨M, w⟩ ↦ ⟨M, w⟩ (simulate once R says "halts")',
    explanation:
      'If HALT were decidable, combine its decider with direct simulation to decide A_TM.',
  },
  {
    from: 'A_TM',
    to: 'E_TM',
    mapping: '⟨M, w⟩ ↦ ⟨M_w⟩ where M_w on any input simulates M on w',
    explanation: 'L(M_w) ≠ ∅ iff M accepts w.',
  },
  {
    from: 'E_TM',
    to: 'EQ_TM',
    mapping: '⟨M⟩ ↦ ⟨M, M_∅⟩ where M_∅ always rejects',
    explanation: 'L(M) = L(M_∅) = ∅ iff M is empty.',
  },
  {
    from: 'A_TM',
    to: 'REGULAR_TM',
    mapping: 'Rice\'s theorem (semantic, non-trivial)',
    explanation: 'Regularity of L(M) is a semantic non-trivial property.',
  },
  {
    from: 'A_TM',
    to: 'ALL_CFG',
    mapping: '⟨M, w⟩ ↦ ⟨G_Mw⟩ encoding non-accepting histories',
    explanation: 'G_Mw generates every string iff M does not accept w.',
  },
  {
    from: 'ALL_CFG',
    to: 'EQ_CFG',
    mapping: '⟨G⟩ ↦ ⟨G, G_Σ⟩ where L(G_Σ) = Σ*',
    explanation: 'L(G) = L(G_Σ) iff G generates everything.',
  },
  {
    from: 'A_TM',
    to: 'MPCP',
    mapping: 'Computation-history domino encoding',
    explanation: 'A match exists iff M accepts w.',
  },
  {
    from: 'MPCP',
    to: 'PCP',
    mapping: 'Padding trick to remove the "first domino" restriction',
    explanation: 'Extends every domino with markers so matches must start with the intended domino.',
  },
]

/**
 * Compute the reduction chain that proves a given problem undecidable,
 * by walking `reduction_from` back to a "seed" problem (A_TM).
 */
export function reductionChainTo(problemId) {
  const chain = []
  const byId = new Map(DECIDABILITY_CATALOG.map((p) => [p.id, p]))
  let cur = byId.get(problemId)
  const seen = new Set()
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id)
    chain.push(cur)
    if (!cur.reduction_from) break
    cur = byId.get(cur.reduction_from)
  }
  // Reverse so the seed (A_TM / HALT) comes first.
  return chain.reverse()
}

// ─── Rice's theorem classifier ────────────────────────────────────────

/**
 * Determines whether a property of a TM's language is Rice-applicable
 * (i.e. undecidable automatically), based on caller-supplied metadata:
 *
 *   input = {
 *     description:  string            // human-readable property (e.g. "L(M) contains 'abba'")
 *     semantic:     boolean           // property depends ONLY on L(M)?
 *     trivial:      boolean           // true for every RE language OR for none?
 *   }
 *
 * Returns { applies, verdict, reason } where verdict ∈
 *   'undecidable-by-rice' | 'need-direct-proof' | 'trivially-decidable' |
 *   'syntactic-may-be-decidable'.
 */
export function riceClassify({ description, semantic, trivial } = {}) {
  if (semantic === undefined || trivial === undefined) {
    return {
      applies: false,
      verdict: 'need-direct-proof',
      reason: 'Rice\'s theorem needs to know whether the property is semantic AND non-trivial.',
    }
  }
  if (!semantic) {
    return {
      applies: false,
      verdict: 'syntactic-may-be-decidable',
      reason:
        'Property depends on the description of M rather than L(M) — Rice\'s theorem does not apply.  The problem may still be decidable (e.g. "M has ≤ 42 states").',
    }
  }
  if (trivial) {
    return {
      applies: false,
      verdict: 'trivially-decidable',
      reason: 'A trivial semantic property (always true or always false) is decidable by a constant TM.',
    }
  }
  return {
    applies: true,
    verdict: 'undecidable-by-rice',
    reason:
      'Semantic, non-trivial properties of RE languages are undecidable by Rice\'s theorem.',
    description: description || 'the chosen property',
  }
}
