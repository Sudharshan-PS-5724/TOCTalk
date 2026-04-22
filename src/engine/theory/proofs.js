/**
 * Proof Lab — structured proof templates (§3 of the spec).
 *
 * Each PROOF_TEMPLATE is a small DSL:
 *   {
 *     id, title, kind, statement,
 *     params: [ { id, label, default, help } ],
 *     build({ params }) => {
 *       strategy:   string,
 *       steps:      ProofStep[],
 *       conclusion: string,
 *     }
 *   }
 *
 *   ProofStep = { label: string, detail: string, annotation?: string }
 *
 * The builder is a PURE function of `params`, so the UI can re-run it on any
 * input and always get a deterministic, educational proof.
 */

const POWER = (sym, n) => {
  if (n === 0) return 'ε'
  if (n === 1) return sym
  return `${sym}^${n}`
}

function tryNumber(raw, fallback) {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export const PROOF_TEMPLATES = [
  // 1. Pumping Lemma — Regular
  {
    id: 'pl_regular',
    title: 'Pumping Lemma (Regular Languages)',
    kind: 'non-regularity',
    statement:
      'If L is regular, there exists p ≥ 1 such that every s ∈ L with |s| ≥ p can be written s = xyz with |xy| ≤ p, |y| ≥ 1, and xyⁱz ∈ L for all i ≥ 0.',
    params: [
      { id: 'language', label: 'Language L', default: '{ aⁿbⁿ : n ≥ 0 }', help: 'Descriptive definition.' },
      { id: 'witness', label: 'Chosen pumping string s', default: 'aᵖbᵖ', help: 'Use p as the pumping length.' },
      { id: 'split', label: 'Why the split fails', default: 'Because |xy| ≤ p, xy consists only of a\'s; so y = aᵏ with k ≥ 1.', help: '' },
      { id: 'pump', label: 'Pump direction', default: 'i = 2', help: 'Which i produces the contradiction.' },
    ],
    build({ params }) {
      return {
        strategy: 'Adversary game: the adversary fixes p; you pick s and i to force a contradiction.',
        steps: [
          { label: '1. Assume toward contradiction', detail: `Suppose L = ${params.language} is regular.` },
          {
            label: '2. Invoke the pumping lemma',
            detail:
              'By the pumping lemma there exists a pumping length p ≥ 1 with the properties stated above.',
          },
          {
            label: '3. Choose a witness string',
            detail: `Pick s = ${params.witness} ∈ L with |s| ≥ p.`,
          },
          {
            label: '4. Enumerate all legal splits',
            detail: `Any split s = xyz with |xy| ≤ p and |y| ≥ 1 satisfies: ${params.split}`,
          },
          {
            label: '5. Pump',
            detail: `Set ${params.pump}. Then xyⁱz has the wrong shape and is not in L.`,
          },
          { label: '6. Contradiction', detail: 'Violates xyⁱz ∈ L for all i ≥ 0.' },
        ],
        conclusion: `Hence L = ${params.language} is NOT regular.  ∎`,
      }
    },
  },

  // 2. Pumping Lemma — CFL
  {
    id: 'pl_cfl',
    title: 'Pumping Lemma (Context-Free Languages)',
    kind: 'non-CFL',
    statement:
      'If L is context-free, there exists p ≥ 1 such that every s ∈ L with |s| ≥ p splits s = uvxyz with |vxy| ≤ p, |vy| ≥ 1, and uvⁱxyⁱz ∈ L for all i ≥ 0.',
    params: [
      { id: 'language', label: 'Language L', default: '{ aⁿbⁿcⁿ : n ≥ 1 }', help: '' },
      { id: 'witness', label: 'Chosen pumping string s', default: 'aᵖbᵖcᵖ' },
      {
        id: 'cases',
        label: 'Case analysis on vxy',
        default:
          'Because |vxy| ≤ p, vxy straddles at most two of the three blocks a*, b*, c*. Pumping either (a) changes the #a or #b but not #c, or (b) changes #b or #c but not #a. In every case the three counts become unequal.',
      },
      { id: 'pump', label: 'Pump direction', default: 'i = 2' },
    ],
    build({ params }) {
      return {
        strategy: 'Same adversary structure as the regular pumping lemma, with the 5-part CFG split.',
        steps: [
          { label: '1. Assume', detail: `Suppose L = ${params.language} is context-free.` },
          { label: '2. Pumping length', detail: 'Let p be the CFL pumping length.' },
          { label: '3. Choose s', detail: `s = ${params.witness} ∈ L, |s| ≥ p.` },
          { label: '4. Case analysis', detail: params.cases },
          { label: '5. Pump', detail: `${params.pump}: uvⁱxyⁱz leaves one of the three counts unchanged while changing the others.` },
          { label: '6. Contradiction', detail: 'Resulting string is not of the required form.' },
        ],
        conclusion: `Therefore L = ${params.language} is NOT context-free.  ∎`,
      }
    },
  },

  // 3. Closure Properties
  {
    id: 'closure',
    title: 'Closure Properties',
    kind: 'closure',
    statement: 'Construct witnesses showing a class of languages is closed under a given operation.',
    params: [
      {
        id: 'class',
        label: 'Class',
        default: 'Regular',
        help: 'Regular | Context-Free | Decidable | RE',
      },
      {
        id: 'op',
        label: 'Operation',
        default: 'Union',
        help: 'Union, Intersection, Complement, Concatenation, Kleene star, …',
      },
    ],
    build({ params }) {
      const key = `${params.class}|${params.op}`.toLowerCase()
      const registry = {
        'regular|union':
          'Given DFAs A, B run the product construction with accept set F_A × Q_B ∪ Q_A × F_B.',
        'regular|intersection':
          'Product construction with accept set F_A × F_B.',
        'regular|complement':
          'Ensure the DFA is total, then swap F and Q \\ F.',
        'regular|concatenation':
          'Connect the accept states of A to the start of B via ε-transitions (NFA) then determinize.',
        'regular|kleene star':
          'Add a new start = accept state with ε to old start and ε from every old accept back to new start.',
        'context-free|union':
          'Merge CFGs G₁, G₂ with a fresh start symbol S → S₁ | S₂.',
        'context-free|concatenation':
          'Fresh start S → S₁ S₂.',
        'context-free|kleene star':
          'Fresh start S → S S₁ | ε.',
        'context-free|intersection':
          'NOT closed.  Counter-example: L₁ = { aⁿbⁿcᵐ } ∩ L₂ = { aᵐbⁿcⁿ } = { aⁿbⁿcⁿ }.',
        'context-free|complement':
          'NOT closed.  If it were, intersection would also be closed (via De Morgan), contradiction.',
        'decidable|union':
          'On input x, run the decider for L₁ on x; if accept halt-accept.  Otherwise run the decider for L₂.',
        'decidable|intersection':
          'Run deciders sequentially; accept iff both accept.',
        'decidable|complement':
          'Swap accept and reject states of the decider.',
        're|union':
          'Dovetail the two enumerators (interleave steps).',
        're|intersection':
          'Run both semideciders in parallel; accept iff both eventually accept.',
        're|complement':
          'NOT closed.  A_TM is RE but its complement is not RE (else A_TM would be decidable).',
      }
      const ans = registry[key]
      if (!ans) {
        return {
          strategy: 'No standard template for this (class, operation) pair.',
          steps: [
            {
              label: 'Pick a known closure table',
              detail:
                'Supported classes: Regular, Context-Free, Decidable, RE. Supported ops: Union, Intersection, Complement, Concatenation, Kleene star.',
            },
          ],
          conclusion: '—',
        }
      }
      return {
        strategy: `${params.class} languages under ${params.op}.`,
        steps: [
          { label: 'Construction', detail: ans },
          {
            label: 'Verification',
            detail:
              'Show L(M) matches the intended language by argument on strings: every w in L is accepted; every w accepted lies in L.',
          },
        ],
        conclusion: ans.startsWith('NOT')
          ? `${params.class} languages are NOT closed under ${params.op}.  ∎`
          : `Therefore ${params.class} languages are closed under ${params.op}.  ∎`,
      }
    },
  },

  // 4. Myhill–Nerode
  {
    id: 'myhill_nerode',
    title: 'Myhill–Nerode Theorem',
    kind: 'non-regularity',
    statement:
      'L is regular iff the number of equivalence classes of ≡_L is finite. Equivalently, L has an infinite set of pairwise L-distinguishable strings ⇒ L is not regular.',
    params: [
      { id: 'language', label: 'Language L', default: '{ aⁿbⁿ : n ≥ 0 }' },
      {
        id: 'family',
        label: 'Distinguishing family',
        default: '{ aᶦ : i ≥ 0 }',
      },
      {
        id: 'distinguisher',
        label: 'Distinguisher for aⁱ vs aʲ (i < j)',
        default: 'z = bⁱ:  aⁱz = aⁱbⁱ ∈ L   but   aʲz = aʲbⁱ ∉ L.',
      },
    ],
    build({ params }) {
      return {
        strategy:
          'Exhibit an infinite family of pairwise distinguishable strings.  Conclude by Myhill–Nerode that L has infinitely many equivalence classes, hence is not regular.',
        steps: [
          { label: '1. Family', detail: `Consider the infinite set F = ${params.family}.` },
          {
            label: '2. Distinguish any two members',
            detail: `For any two distinct strings x ≠ x\' in F, we exhibit a string z with xz ∈ L ⟺ x\'z ∉ L. ${params.distinguisher}`,
          },
          {
            label: '3. Equivalence classes',
            detail:
              'Every two members of F lie in different ≡_L equivalence classes, hence ≡_L has infinitely many classes.',
          },
        ],
        conclusion: `By Myhill–Nerode, L = ${params.language} is NOT regular.  ∎`,
      }
    },
  },

  // 5. Ambiguity
  {
    id: 'ambiguity',
    title: 'Ambiguity Proof',
    kind: 'ambiguity',
    statement:
      'A CFG G is ambiguous if some string w ∈ L(G) has ≥ 2 distinct leftmost derivations (equivalently, ≥ 2 distinct parse trees).',
    params: [
      { id: 'grammar', label: 'Grammar G', default: 'E → E + E | E * E | id', help: '' },
      { id: 'string', label: 'Witness w', default: 'id + id * id' },
      {
        id: 'deriv1',
        label: 'Derivation 1 (leftmost)',
        default: 'E ⇒ E + E ⇒ id + E ⇒ id + E * E ⇒ id + id * E ⇒ id + id * id',
      },
      {
        id: 'deriv2',
        label: 'Derivation 2 (leftmost)',
        default: 'E ⇒ E * E ⇒ E + E * E ⇒ id + E * E ⇒ id + id * E ⇒ id + id * id',
      },
    ],
    build({ params }) {
      return {
        strategy: 'Exhibit two distinct leftmost derivations of the same string.',
        steps: [
          { label: 'Witness', detail: `w = "${params.string}" in L(G) for G: ${params.grammar}.` },
          { label: 'Derivation 1', detail: params.deriv1 },
          { label: 'Derivation 2', detail: params.deriv2 },
          {
            label: 'Difference',
            detail:
              'The two derivations correspond to different parse trees (associativity choices), hence the grammar is ambiguous.',
          },
        ],
        conclusion: `Therefore G is ambiguous.  ∎`,
      }
    },
  },

  // 6. Equivalence (two automata / two regexes accept the same language)
  {
    id: 'equivalence',
    title: 'Equivalence Proof (Regular Languages)',
    kind: 'equivalence',
    statement: 'Two DFAs are equivalent iff they accept exactly the same language.',
    params: [
      { id: 'L1', label: 'Representation 1', default: 'M₁ = regex (a|b)*abb' },
      { id: 'L2', label: 'Representation 2', default: 'M₂ = minimal DFA for M₁' },
    ],
    build({ params }) {
      return {
        strategy:
          'Reduce both to a canonical form (minimal DFA).  Two regular languages coincide iff their minimal DFAs are isomorphic.',
        steps: [
          { label: '1. Convert both sides to DFAs', detail: `${params.L1} → DFA D₁;  ${params.L2} → DFA D₂ (use Thompson + subset + minimization).` },
          { label: '2. Minimize', detail: 'Run the partition-refinement minimizer on both.' },
          {
            label: '3. Compare',
            detail:
              'Two minimal DFAs over the same alphabet recognize the same language iff there is a state-to-state bijection preserving start, accept, and transitions.',
          },
          {
            label: '4. Alternate method',
            detail:
              'Equivalently, build the product DFA for the symmetric difference L(D₁) △ L(D₂) and test emptiness (E_DFA).',
          },
        ],
        conclusion:
          'If the isomorphism exists (or the symmetric difference is empty) the two representations are equivalent; otherwise produce a witness string from the non-empty symmetric difference.  ∎',
      }
    },
  },

  // 7. Reduction proof (undecidability / NP-hardness template)
  {
    id: 'reduction',
    title: 'Reduction Proof',
    kind: 'reduction',
    statement:
      'If A ≤_m B and A is undecidable (or NP-hard), then B is undecidable (or NP-hard).',
    params: [
      { id: 'A', label: 'Known-hard problem A', default: 'A_TM' },
      { id: 'B', label: 'Target problem B', default: 'HALT' },
      { id: 'mapping', label: 'Mapping f', default: '⟨M, w⟩ ↦ ⟨M, w⟩' },
      {
        id: 'forward',
        label: 'Correctness (⇒)',
        default: 'If M accepts w then M halts on w, so f(⟨M,w⟩) ∈ HALT.',
      },
      {
        id: 'backward',
        label: 'Correctness (⇐)',
        default:
          'If f(⟨M,w⟩) ∈ HALT then M halts on w; simulate once to observe accept/reject.',
      },
    ],
    build({ params }) {
      return {
        strategy: `Construct a computable reduction f : ${params.A} → ${params.B}, then argue correctness in both directions.`,
        steps: [
          { label: '1. Define f', detail: params.mapping },
          { label: '2. Computability', detail: 'f is total and computable in polynomial time (for complexity) or by a plain TM (for decidability).' },
          { label: '3. Correctness (⇒)', detail: params.forward },
          { label: '4. Correctness (⇐)', detail: params.backward },
          {
            label: '5. Conclusion',
            detail: `Since ${params.A} ≤_m ${params.B} and ${params.A} is hard, ${params.B} is hard as well.`,
          },
        ],
        conclusion: `Therefore ${params.B} is at least as hard as ${params.A}.  ∎`,
      }
    },
  },
]

/**
 * Instantiate a proof template with a param object.
 * Returns { template, rendered } or throws if the id is unknown.
 */
export function instantiateProof(id, params) {
  const tpl = PROOF_TEMPLATES.find((t) => t.id === id)
  if (!tpl) throw new Error(`Unknown proof template: ${id}`)
  const merged = { ...Object.fromEntries(tpl.params.map((p) => [p.id, p.default])), ...(params || {}) }
  return { template: tpl, rendered: tpl.build({ params: merged }), params: merged }
}

// Exports used by tests to sanity-check numeric parameters.
export const _internal = { POWER, tryNumber }
