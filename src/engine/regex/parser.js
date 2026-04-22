/**
 * Strict regex parser — recursive descent, O(n).
 *
 * Grammar:
 *   Regex  := Union
 *   Union  := Concat ('|' Concat)*
 *   Concat := Star+
 *   Star   := Atom ('*')*
 *   Atom   := char | 'ε' | '(' Union ')'
 *
 * Precedence (highest → lowest): star > concat > union.
 *
 * Accepted symbols: a–z, A–Z, 0–9, and literal 'ε' (U+03B5).
 * Reserved: | * ( )
 *
 * Any deviation throws RegexSyntaxError with { position, reason }.
 */

import { RegexSyntaxError } from '../errors.js'

const ATOM_SYMBOL_RE = /^[A-Za-z0-9]$/

class Parser {
  constructor(src) {
    this.src = src
    this.pos = 0
  }

  peek() {
    return this.pos < this.src.length ? this.src[this.pos] : null
  }

  consume() {
    return this.src[this.pos++]
  }

  eof() {
    return this.pos >= this.src.length
  }

  parse() {
    if (this.src.length === 0) {
      throw new RegexSyntaxError(0, 'empty regex')
    }
    const ast = this.parseUnion()
    if (!this.eof()) {
      const ch = this.peek()
      throw new RegexSyntaxError(this.pos, `unexpected character '${ch}'`)
    }
    return ast
  }

  parseUnion() {
    let left = this.parseConcat()
    while (this.peek() === '|') {
      const opPos = this.pos
      this.consume()
      if (this.peek() === '|') {
        throw new RegexSyntaxError(this.pos, "'|' cannot follow another '|'")
      }
      if (this.eof() || this.peek() === ')') {
        throw new RegexSyntaxError(this.pos, "missing right-hand side of '|'")
      }
      const right = this.parseConcat()
      left = { type: 'union', left, right, pos: opPos }
    }
    return left
  }

  parseConcat() {
    let left = this.parseStar()
    while (!this.eof() && this.peek() !== '|' && this.peek() !== ')') {
      const right = this.parseStar()
      left = { type: 'concat', left, right, pos: right.pos }
    }
    return left
  }

  parseStar() {
    let atom = this.parseAtom()
    while (this.peek() === '*') {
      const pos = this.pos
      this.consume()
      atom = { type: 'star', child: atom, pos }
    }
    return atom
  }

  parseAtom() {
    const ch = this.peek()
    const pos = this.pos

    if (ch === null) {
      throw new RegexSyntaxError(pos, 'unexpected end of input')
    }
    if (ch === '(') {
      this.consume()
      if (this.peek() === ')') {
        throw new RegexSyntaxError(this.pos, 'empty group')
      }
      if (this.eof()) {
        throw new RegexSyntaxError(this.pos, "unmatched '('")
      }
      const inner = this.parseUnion()
      if (this.peek() !== ')') {
        throw new RegexSyntaxError(this.pos, "unmatched '('")
      }
      this.consume()
      return inner
    }
    if (ch === ')') throw new RegexSyntaxError(pos, "unmatched ')'")
    if (ch === '|') throw new RegexSyntaxError(pos, "'|' with missing left-hand side")
    if (ch === '*') throw new RegexSyntaxError(pos, "'*' with no operand")
    if (ch === 'ε') {
      this.consume()
      return { type: 'epsilon', pos }
    }
    if (ATOM_SYMBOL_RE.test(ch)) {
      this.consume()
      return { type: 'char', value: ch, pos }
    }
    if (/\s/.test(ch)) {
      throw new RegexSyntaxError(pos, 'whitespace is not allowed inside a regex')
    }
    throw new RegexSyntaxError(pos, `invalid character '${ch}'`)
  }
}

/**
 * Parse a regex string into an AST. Throws RegexSyntaxError on any invalid input.
 * @param {string} src
 * @returns AST root node
 */
export function parseRegex(src) {
  if (typeof src !== 'string') {
    throw new RegexSyntaxError(0, 'regex must be a string')
  }
  return new Parser(src).parse()
}
