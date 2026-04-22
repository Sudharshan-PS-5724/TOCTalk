/**
 * Strict CFG parser (SRS §1.2).
 *
 * Accepted syntax:
 *   • One production per line (blank lines + `# comment` lines skipped).
 *   • `LHS -> alt1 | alt2 | alt3`   (arrow may also be `→`)
 *   • LHS must be a non-terminal (uppercase letter, optionally with digit).
 *   • Alternatives separated by `|`.
 *   • Each alternative is a sequence of single-character symbols:
 *       - uppercase letter → non-terminal
 *       - lowercase letter or digit → terminal
 *       - the character 'ε' alone on an alt means the empty string
 *   • Internal whitespace inside an alt is ignored.
 *   • Empty RHS alternatives are rejected (use ε explicitly).
 *
 * Validation rejects (with precise line number + reason):
 *   • Missing arrow
 *   • Non-terminal on RHS that is never defined anywhere as an LHS
 *   • Undefined characters (e.g. '*', '+') that are neither NT nor T
 *   • ε mixed with other symbols in the same alternative
 */

import { CFGError } from '../errors.js'
import {
  isNonTerminal,
  isTerminal,
  makeGrammar,
} from './cfg.js'

const ARROW_RE = /->|→/

export function parseCFG(src) {
  if (typeof src !== 'string' || src.trim().length === 0) {
    throw new CFGError('Grammar input is empty.', { line: 0 })
  }
  const lines = src.split(/\r?\n/)
  const productions = []
  const nonTerminals = new Set()
  const terminals = new Set()
  let start = null

  lines.forEach((raw, i) => {
    const lineNum = i + 1
    const line = raw.replace(/#.*$/, '').trim()
    if (!line) return
    const arrowMatch = line.match(ARROW_RE)
    if (!arrowMatch) {
      throw new CFGError(
        `Line ${lineNum}: missing '->' arrow.`,
        { line: lineNum, raw },
      )
    }
    const [lhsRaw, rhsRaw] = line.split(ARROW_RE)
    const lhs = lhsRaw.trim()
    if (!isNonTerminal(lhs)) {
      throw new CFGError(
        `Line ${lineNum}: left-hand side '${lhs}' is not a valid non-terminal (expected single uppercase letter, optionally with one digit).`,
        { line: lineNum, lhs },
      )
    }
    nonTerminals.add(lhs)
    if (start === null) start = lhs

    const altStrings = rhsRaw.split('|')
    for (const altRaw of altStrings) {
      const alt = altRaw.replace(/\s+/g, '')
      if (alt.length === 0) {
        throw new CFGError(
          `Line ${lineNum}: empty alternative. Use 'ε' explicitly for the empty string.`,
          { line: lineNum, alt: altRaw },
        )
      }
      if (alt === 'ε') {
        productions.push({ lhs, rhs: [] })
        continue
      }
      const symbols = []
      for (let j = 0; j < alt.length; j++) {
        const ch = alt[j]
        if (ch === 'ε') {
          throw new CFGError(
            `Line ${lineNum}: 'ε' cannot be combined with other symbols in the same alternative.`,
            { line: lineNum, alt },
          )
        }
        // allow two-char NT like "A1"
        if (/[A-Z]/.test(ch) && j + 1 < alt.length && /[0-9]/.test(alt[j + 1])) {
          const nt = ch + alt[j + 1]
          if (!isNonTerminal(nt)) {
            throw new CFGError(
              `Line ${lineNum}: invalid non-terminal '${nt}'.`,
              { line: lineNum, symbol: nt },
            )
          }
          symbols.push(nt)
          nonTerminals.add(nt)
          j += 1
          continue
        }
        if (isNonTerminal(ch)) {
          symbols.push(ch)
          nonTerminals.add(ch)
          continue
        }
        if (isTerminal(ch)) {
          symbols.push(ch)
          terminals.add(ch)
          continue
        }
        throw new CFGError(
          `Line ${lineNum}: invalid symbol '${ch}'. Non-terminals must be uppercase (A–Z), terminals must be lowercase letters or digits, and ε is the only allowed special token.`,
          { line: lineNum, symbol: ch },
        )
      }
      productions.push({ lhs, rhs: symbols })
    }
  })

  if (!start) {
    throw new CFGError('No productions found in grammar.', { line: 0 })
  }

  // Every NT appearing in some RHS must be defined somewhere as an LHS.
  const definedLhs = new Set(productions.map((p) => p.lhs))
  for (const p of productions) {
    for (const s of p.rhs) {
      if (isNonTerminal(s) && !definedLhs.has(s)) {
        throw new CFGError(
          `Non-terminal '${s}' is used but never defined (no production with '${s}' on the left).`,
          { symbol: s, lhs: p.lhs },
        )
      }
    }
  }

  return makeGrammar({
    start,
    nonTerminals,
    terminals,
    productions,
  })
}
