// Structured error classes. Pure JS; no React / DOM.

export class ToCError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ToCError'
    this.details = details
  }
}

/**
 * Thrown by the regex parser. Message format matches SRS §1.1:
 *   "Error at position <N>: <reason>"
 */
export class RegexSyntaxError extends ToCError {
  constructor(position, reason) {
    super(`Error at position ${position}: ${reason}`, { position, reason })
    this.name = 'RegexSyntaxError'
    this.position = position
    this.reason = reason
  }
}

export class CFGError extends ToCError {
  constructor(message, details = {}) {
    super(`CFG error: ${message}`, details)
    this.name = 'CFGError'
  }
}

export class ValidationError extends ToCError {
  constructor(code, message, details = {}) {
    super(message, { code, ...details })
    this.name = 'ValidationError'
    this.code = code
  }
}

export class NotImplementedError extends ToCError {
  constructor(feature) {
    super(`Not implemented yet: ${feature}`, { feature })
    this.name = 'NotImplementedError'
  }
}

export class ExecutionLimitError extends ToCError {
  constructor(maxSteps) {
    super(
      `Execution halted due to step limit (possible infinite loop). Limit = ${maxSteps}.`,
      { maxSteps },
    )
    this.name = 'ExecutionLimitError'
  }
}
