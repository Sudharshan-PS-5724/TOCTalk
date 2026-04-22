/**
 * StepLog — an append-only list of atomic derivation steps.
 * Every algorithm that transforms a structure MUST push a step with:
 *   - operation: short id (e.g. 'union', 'epsilon-closure')
 *   - explanation: plain-language reason (learning mode)
 *   - graph: the unified Graph snapshot AFTER the step
 *   - extras: optional machine-readable metadata (highlight ids, etc.)
 */

export class StepLog {
  constructor() {
    this.steps = []
  }

  push({ operation, explanation, graph, extras = {} }) {
    this.steps.push({
      index: this.steps.length,
      operation,
      explanation,
      graph,
      extras,
    })
  }

  last() {
    return this.steps[this.steps.length - 1] || null
  }

  toArray() {
    return this.steps.slice()
  }
}
