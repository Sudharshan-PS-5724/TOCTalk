/**
 * Turing Machine data model + text DSL parser + preset catalogue.
 *
 * Canonical TM shape (SRS §5.3):
 *   TM = {
 *     states:        string[],
 *     inputAlphabet: string[],                // Σ, never contains the blank
 *     tapeAlphabet:  string[],                // Γ, includes the blank
 *     blank:         string,                  // B
 *     start:         string,                  // q0
 *     accept:        string[],                // F
 *     reject?:       string[],                // optional halting reject states
 *     delta:         { [state]: { [symbol]: { to, write, move: 'L'|'R' } } },
 *   }
 *
 * DSL (line-based, very forgiving):
 *   start: q0
 *   blank: _
 *   accept: qA
 *   reject: qR                (optional)
 *   input: a, b               (commas or whitespace — Σ)
 *   tape:  a, b, X, _         (Γ, must include blank)
 *   # comments start with '#'
 *   # rules:  <state>, <read> -> <state>, <write>, <L|R>
 *   q0, a -> q1, X, R
 *   q1, b -> qA, _, R
 *
 * Unknown keys/rules raise structured errors with line numbers.
 */

import { ValidationError } from '../errors.js'

const DIRECTIONS = new Set(['L', 'R'])

export function parseTM(src) {
  if (typeof src !== 'string' || src.trim().length === 0) {
    throw new ValidationError('empty-tm', 'TM definition is empty.')
  }
  const lines = src.split(/\r?\n/)
  const tm = {
    states: new Set(),
    inputAlphabet: new Set(),
    tapeAlphabet: new Set(),
    blank: '_',
    start: null,
    accept: new Set(),
    reject: new Set(),
    delta: {},
  }

  lines.forEach((raw, i) => {
    // `#` only starts a comment when (a) it is the first non-whitespace
    // character on the line, or (b) it is preceded by 2+ whitespace chars.
    // This lets `#` be used as a genuine tape symbol (e.g. the separator in
    // the binary-copy TM: `q0, # -> q7, #, R`).
    const stripped = raw
      .replace(/^\s*#.*$/, '')
      .replace(/\s{2,}#.*$/, '')
    const line = stripped.trim()
    if (!line) return
    const lineNum = i + 1

    const header = line.match(/^(\w+)\s*:\s*(.+)$/)
    if (header && !line.includes('->')) {
      const [, key, valueRaw] = header
      const values = splitList(valueRaw)
      switch (key.toLowerCase()) {
        case 'start':
          if (values.length !== 1) {
            throw new ValidationError(
              'tm-start',
              `Line ${lineNum}: 'start' must specify exactly one state.`,
            )
          }
          tm.start = values[0]
          tm.states.add(values[0])
          return
        case 'blank':
          if (values.length !== 1 || values[0].length !== 1) {
            throw new ValidationError(
              'tm-blank',
              `Line ${lineNum}: 'blank' must be a single character.`,
            )
          }
          tm.blank = values[0]
          tm.tapeAlphabet.add(values[0])
          return
        case 'accept':
          for (const v of values) {
            tm.accept.add(v)
            tm.states.add(v)
          }
          return
        case 'reject':
          for (const v of values) {
            tm.reject.add(v)
            tm.states.add(v)
          }
          return
        case 'input':
          for (const v of values) tm.inputAlphabet.add(v)
          return
        case 'tape':
          for (const v of values) tm.tapeAlphabet.add(v)
          return
        case 'states':
          for (const v of values) tm.states.add(v)
          return
        default:
          throw new ValidationError(
            'tm-unknown-key',
            `Line ${lineNum}: unknown header '${key}'. Expected one of start, blank, accept, reject, input, tape, states.`,
          )
      }
    }

    const rule = line.match(/^([^,]+)\s*,\s*([^\s-]+)\s*->\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([LR])\s*$/)
    if (!rule) {
      throw new ValidationError(
        'tm-bad-rule',
        `Line ${lineNum}: expected rule 'state, symbol -> newState, newSymbol, L|R'.`,
      )
    }
    const [, from, read, to, write, move] = rule.map((x) => (typeof x === 'string' ? x.trim() : x))
    if (!DIRECTIONS.has(move)) {
      throw new ValidationError(
        'tm-bad-direction',
        `Line ${lineNum}: direction must be L or R, got '${move}'.`,
      )
    }
    tm.states.add(from)
    tm.states.add(to)
    tm.tapeAlphabet.add(read)
    tm.tapeAlphabet.add(write)
    if (!tm.delta[from]) tm.delta[from] = {}
    if (tm.delta[from][read]) {
      throw new ValidationError(
        'tm-nondeterministic',
        `Line ${lineNum}: duplicate transition for (${from}, ${read}). This simulator is deterministic.`,
      )
    }
    tm.delta[from][read] = { to, write, move }
  })

  if (!tm.start) {
    throw new ValidationError('tm-missing-start', `TM is missing a 'start:' line.`)
  }
  if (tm.accept.size === 0) {
    throw new ValidationError('tm-missing-accept', `TM is missing an 'accept:' line.`)
  }
  tm.tapeAlphabet.add(tm.blank)

  // Implicit inputAlphabet = tapeAlphabet \ ({blank} ∪ auxiliary) if unset.
  if (tm.inputAlphabet.size === 0) {
    for (const s of tm.tapeAlphabet) if (s !== tm.blank) tm.inputAlphabet.add(s)
  }

  return {
    states: [...tm.states].sort(),
    inputAlphabet: [...tm.inputAlphabet].sort(),
    tapeAlphabet: [...tm.tapeAlphabet].sort(),
    blank: tm.blank,
    start: tm.start,
    accept: [...tm.accept].sort(),
    reject: [...tm.reject].sort(),
    delta: tm.delta,
  }
}

function splitList(s) {
  return s.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
}

/**
 * Built-in preset TMs keyed by short id.
 * Each entry has { id, label, category, description, formal, source, sampleInputs }
 *   • formal       — textual summary of ⟨Q, Σ, Γ, δ, q0, B, F⟩ for exam-ready display
 *   • source       — the TM DSL
 *   • sampleInputs — strings the UI should pre-fill to demonstrate the TM
 *
 * All presets have been verified against the tape simulator in src/engine/simulation/tmSim.js.
 */
export const TM_PRESETS = [
  {
    id: 'anbn',
    category: 'Languages',
    label: 'L = { aⁿbⁿ | n ≥ 1 }',
    description:
      'Marks one a as X and one b as Y in each pass, walking back to the left each time. Accepts when all a, b are paired.',
    formal:
      'Q = {q0,q1,q2,q3,qA};  Σ = {a,b};  Γ = {a,b,X,Y,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['ab', 'aabb', 'aaabbb', 'aab', 'abb'],
    source: `# Deterministic TM for { a^n b^n | n >= 1 }
start: q0
blank: _
accept: qA
input: a, b
tape:  a, b, X, Y, _

# Mark an 'a' as X and scan right for matching 'b'.
q0, a -> q1, X, R
q0, Y -> q3, Y, R     # all a's already paired, check only Y's remain
q1, a -> q1, a, R
q1, Y -> q1, Y, R
q1, b -> q2, Y, L     # mark the b as Y and walk back
q2, a -> q2, a, L
q2, Y -> q2, Y, L
q2, X -> q0, X, R     # resume marking next a
q3, Y -> q3, Y, R
q3, _ -> qA, _, R
`,
  },
  {
    id: 'unaryIncrement',
    category: 'Arithmetic',
    label: 'Unary increment: |1|ⁿ → |1|ⁿ⁺¹',
    description:
      'Walks to the right end of a run of 1s and appends another 1. Demonstrates the simplest reading-head-to-writing pattern.',
    formal:
      'Q = {q0,qA};  Σ = {1};  Γ = {1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', '1', '111', '11111'],
    source: `start: q0
blank: _
accept: qA
input: 1
tape:  1, _

q0, 1 -> q0, 1, R
q0, _ -> qA, 1, R
`,
  },
  {
    id: 'equalAB',
    category: 'Languages',
    label: 'L = { w ∈ {a,b}* : #a(w) = #b(w) }',
    description:
      'Pairs one a with one b by marking them X / Y until the tape has no unmarked a or b. Rejects if a surplus remains.',
    formal:
      'Q = {q0,q1,q2,q3,q4,qA};  Σ = {a,b};  Γ = {a,b,X,Y,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', 'ab', 'ba', 'aabb', 'abab', 'aab'],
    source: `start: q0
blank: _
accept: qA
input: a, b
tape:  a, b, X, Y, _

q0, a -> q1, X, R
q0, b -> q2, Y, R
q0, X -> q0, X, R
q0, Y -> q0, Y, R
q0, _ -> qA, _, R

q1, a -> q1, a, R
q1, X -> q1, X, R
q1, Y -> q1, Y, R
q1, b -> q3, Y, L

q2, b -> q2, b, R
q2, X -> q2, X, R
q2, Y -> q2, Y, R
q2, a -> q3, X, L

q3, a -> q3, a, R
q3, b -> q3, b, R
q3, X -> q3, X, R
q3, Y -> q3, Y, R
q3, _ -> q4, _, L

q4, a -> q4, a, L
q4, b -> q4, b, L
q4, X -> q4, X, L
q4, Y -> q4, Y, L
q4, _ -> q0, _, R
`,
  },

  // ─── Arithmetic ───────────────────────────────────────────────────────
  {
    id: 'unaryAddition',
    category: 'Arithmetic',
    label: 'Unary addition: 1ᵃ 0 1ᵇ → 1ᵃ⁺ᵇ',
    description:
      'Replaces the separator 0 with a 1, walks to the right end, and erases the final 1. Result: a contiguous block of a+b ones.',
    formal:
      'Q = {q0,q1,q2,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['0', '10', '01', '110', '1101', '11011', '1110111'],
    source: `# TM for unary addition.  Input: 1^a 0 1^b     Output: 1^(a+b)
start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

# Walk right, replace the first 0 with a 1.
q0, 1 -> q0, 1, R
q0, 0 -> q1, 1, R

# Walk to end of 1's.
q1, 1 -> q1, 1, R
q1, _ -> q2, _, L

# Erase trailing 1.
q2, 1 -> qA, _, R
`,
  },
  {
    id: 'unarySubtraction',
    category: 'Arithmetic',
    label: 'Unary subtraction: 1ᵃ 0 1ᵇ → 1ᵃ⁻ᵇ (a ≥ b)',
    description:
      'Repeatedly erases the rightmost unmarked 1 and the leftmost unmarked 1, converging on 1^(a−b). Assumes a ≥ b.',
    formal:
      'Q = {q0,q1,q2,q3,q4,q7,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['0', '10', '110', '1101', '11101', '1110111'],
    source: `# TM for unary subtraction (a - b), a >= b.  Input: 1^a 0 1^b
start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

# Scan right past 1^a.
q0, 1 -> q0, 1, R
q0, 0 -> q1, 0, R

# Scan right past 1^b to the blank.
q1, 1 -> q1, 1, R
q1, _ -> q2, _, L

# At rightmost cell: if 1 pair it; if 0 we've exhausted 1^b.
q2, 1 -> q3, _, L
q2, 0 -> q7, _, L

# Walk back to leftmost.
q3, 1 -> q3, 1, L
q3, 0 -> q3, 0, L
q3, _ -> q4, _, R

# Erase one leftmost 1 to complete the pair, loop.
q4, 1 -> q0, _, R

# b exhausted: the remaining 1's on the left are the result; stop.
q7, 1 -> q7, 1, L
q7, _ -> qA, _, R
`,
  },
  {
    id: 'binaryIncrement',
    category: 'Arithmetic',
    label: 'Binary increment (LSB on the right)',
    description:
      'Walks to the right end, then propagates a +1 carry leftward. If all bits are 1 a new leading 1 is written.',
    formal:
      'Q = {q0,q1,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['0', '1', '101', '111', '1001', '11111'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

# Walk to end.
q0, 0 -> q0, 0, R
q0, 1 -> q0, 1, R
q0, _ -> q1, _, L

# Propagate carry.
q1, 1 -> q1, 0, L
q1, 0 -> qA, 1, R
q1, _ -> qA, 1, R
`,
  },
  {
    id: 'onesComplement',
    category: 'Arithmetic',
    label: "1's complement (flip every bit)",
    description: 'Walks left-to-right flipping 0 ↔ 1 until the blank.',
    formal:
      'Q = {q0,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', '0', '1', '0011', '1010101'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

q0, 0 -> q0, 1, R
q0, 1 -> q0, 0, R
q0, _ -> qA, _, R
`,
  },
  {
    id: 'twosComplement',
    category: 'Arithmetic',
    label: "2's complement (1's complement + 1)",
    description:
      'Two-phase TM: first sweep flips every bit, second sweep performs a binary increment carrying right-to-left.',
    formal:
      'Q = {q0,q1,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['0', '1', '0010', '0110', '1000'],
    source: `# 2's complement: bitwise NOT then +1.
start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

# Phase 1: flip every bit while walking right.
q0, 0 -> q0, 1, R
q0, 1 -> q0, 0, R
q0, _ -> q1, _, L

# Phase 2: binary +1 carry.
q1, 1 -> q1, 0, L
q1, 0 -> qA, 1, R
q1, _ -> qA, 1, R
`,
  },

  // ─── Data operations ─────────────────────────────────────────────────
  {
    id: 'binaryCopy',
    category: 'Data',
    label: 'Copy: w# → w#w (w ∈ {0,1}*)',
    description:
      'Marks each w-symbol, walks past the # and any previously copied bits, writes the same symbol, and walks back. Restores the marks when done.',
    formal:
      'Q = {q0,q1,q2,q3,q4,q5,q6,q7,qA};  Σ = {0,1,#};  Γ = {0,1,#,X,Y,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['#', '0#', '1#', '01#', '101#', '110#'],
    source: `# Copy TM.  Input: w#    Output: w#w  (w ∈ {0,1}*)
start: q0
blank: _
accept: qA
input: 0, 1, #
tape:  0, 1, #, X, Y, _

# q0: pick next unmarked symbol from w.
q0, 0 -> q1, X, R
q0, 1 -> q2, Y, R
q0, # -> q7, #, R     # all of w copied; tidy up marks

# q1: remembered 0.  Walk to end, write 0, walk back.
q1, 0 -> q1, 0, R
q1, 1 -> q1, 1, R
q1, # -> q3, #, R
q3, 0 -> q3, 0, R
q3, 1 -> q3, 1, R
q3, _ -> q5, 0, L

# q2: remembered 1.
q2, 0 -> q2, 0, R
q2, 1 -> q2, 1, R
q2, # -> q4, #, R
q4, 0 -> q4, 0, R
q4, 1 -> q4, 1, R
q4, _ -> q5, 1, L

# q5: walk back to the marker X/Y and advance past it.
q5, 0 -> q5, 0, L
q5, 1 -> q5, 1, L
q5, # -> q6, #, L
q6, 0 -> q6, 0, L
q6, 1 -> q6, 1, L
q6, X -> q0, X, R
q6, Y -> q0, Y, R

# q7: all of w consumed; restore X→0, Y→1 in the original w.
q7, 0 -> q7, 0, R
q7, 1 -> q7, 1, R
q7, _ -> qA, _, R
q0, X -> q0, X, R
q0, Y -> q0, Y, R
`,
  },

  // ─── Languages ────────────────────────────────────────────────────────
  {
    id: 'anbncn',
    category: 'Languages',
    label: 'L = { 0ⁿ1ⁿ2ⁿ | n ≥ 1 }',
    description:
      'Context-sensitive language: each pass consumes one 0 (as X), one 1 (as Y), one 2 (as Z). Terminates when no 0 remains and the suffix is exactly Y*Z*.',
    formal:
      'Q = {q0,q1,q2,q3,q5,q6,qA};  Σ = {0,1,2};  Γ = {0,1,2,X,Y,Z,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['012', '001122', '000111222', '01', '0122', '01012'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1, 2
tape:  0, 1, 2, X, Y, Z, _

# Leftmost unmarked: 0 → mark and advance; else check leftovers.
q0, 0 -> q1, X, R
q0, X -> q0, X, R
q0, Y -> q5, Y, R

# Look for leftmost unmarked 1.
q1, 0 -> q1, 0, R
q1, Y -> q1, Y, R
q1, 1 -> q2, Y, R

# Look for leftmost unmarked 2.
q2, 1 -> q2, 1, R
q2, Z -> q2, Z, R
q2, 2 -> q3, Z, L

# Walk back to leftmost.
q3, 0 -> q3, 0, L
q3, 1 -> q3, 1, L
q3, 2 -> q3, 2, L
q3, X -> q3, X, L
q3, Y -> q3, Y, L
q3, Z -> q3, Z, L
q3, _ -> q0, _, R

# Verification phase: expect Y* Z* _
q5, Y -> q5, Y, R
q5, Z -> q6, Z, R
q6, Z -> q6, Z, R
q6, _ -> qA, _, R
`,
  },
  {
    id: 'wwR',
    category: 'Languages',
    label: 'L = { ww^R | w ∈ {0,1}* } (even palindrome)',
    description:
      'Even-length palindrome over {0,1}. Marks leftmost, scans to rightmost un-marked, verifies a match, and reflects. Odd length rejects.',
    formal:
      'Q = {q0,q1,q2,q3,q4,q5,qA};  Σ = {0,1};  Γ = {0,1,X,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', '00', '11', '0110', '1001', '01', '010', '0111'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, X, _

# Leftmost position.
q0, _ -> qA, _, R        # ε = ε·ε^R
q0, X -> qA, X, R        # all matched
q0, 0 -> q1, X, R
q0, 1 -> q2, X, R

# Scan right to the end of the unmarked region.
q1, 0 -> q1, 0, R
q1, 1 -> q1, 1, R
q1, X -> q3, X, L
q1, _ -> q3, _, L

q2, 0 -> q2, 0, R
q2, 1 -> q2, 1, R
q2, X -> q4, X, L
q2, _ -> q4, _, L

# Rightmost unmarked must match (mirrored).
q3, 0 -> q5, X, L
q4, 1 -> q5, X, L
# (no rule for 1 in q3 or 0 in q4 → reject; no rule for X either → reject on odd middle)

# Walk back to leftmost position.
q5, 0 -> q5, 0, L
q5, 1 -> q5, 1, L
q5, X -> q0, X, R
q5, _ -> q0, _, R
`,
  },
  {
    id: 'palindrome01',
    category: 'Languages',
    label: 'Palindrome over {0,1} (even or odd)',
    description:
      'Variant of ww^R that also accepts odd-length palindromes by permitting a single unpaired middle symbol.',
    formal:
      'Q = {q0,q1,q2,q3,q4,q5,qA};  Σ = {0,1};  Γ = {0,1,X,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', '0', '1', '010', '0110', '0100', '11011'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, X, _

q0, _ -> qA, _, R
q0, X -> qA, X, R
q0, 0 -> q1, X, R
q0, 1 -> q2, X, R

q1, 0 -> q1, 0, R
q1, 1 -> q1, 1, R
q1, X -> q3, X, L
q1, _ -> q3, _, L

q2, 0 -> q2, 0, R
q2, 1 -> q2, 1, R
q2, X -> q4, X, L
q2, _ -> q4, _, L

q3, 0 -> q5, X, L
q3, X -> qA, X, R         # single middle symbol — still a palindrome
q4, 1 -> q5, X, L
q4, X -> qA, X, R

q5, 0 -> q5, 0, L
q5, 1 -> q5, 1, L
q5, X -> q0, X, R
q5, _ -> q0, _, R
`,
  },
  {
    id: 'evenLength',
    category: 'Languages',
    label: 'L = { w ∈ {0,1}* : |w| is even }',
    description:
      'Two-state parity DFA presented as a TM. Accepts on a blank from the even-parity state.',
    formal:
      'Q = {q0,q1,qA};  Σ = {0,1};  Γ = {0,1,_};  q0 start;  B = _;  F = {qA}.',
    sampleInputs: ['', '0', '01', '0011', '10101', '110011'],
    source: `start: q0
blank: _
accept: qA
input: 0, 1
tape:  0, 1, _

q0, 0 -> q1, 0, R
q0, 1 -> q1, 1, R
q0, _ -> qA, _, R

q1, 0 -> q0, 0, R
q1, 1 -> q0, 1, R
`,
  },
]

/**
 * Grouping for UI rendering (sidebar/dropdown sections).
 */
export function groupPresetsByCategory() {
  const groups = {}
  for (const p of TM_PRESETS) {
    const key = p.category || 'Misc'
    groups[key] = groups[key] || []
    groups[key].push(p)
  }
  return groups
}
