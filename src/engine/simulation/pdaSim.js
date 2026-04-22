/**
 * PDA simulator — bounded non-deterministic BFS search for an accepting
 * configuration. Intended for the single-state PDAs we produce from
 * cfgToPDA.js but works for any PDA that uses the shared transition shape.
 *
 * Configuration: (state, inputIndex, stack as array with TOP = last element)
 *
 * Search strategy:
 *   • Frontier BFS with a visited set keyed on (state, inputIndex, stackKey)
 *     to avoid re-exploring identical configurations.
 *   • Parent map lets us reconstruct the accepting sequence of moves.
 *   • Bounded by `maxSteps` (default 2000) and `maxStack` (default 200).
 *
 * Acceptance modes supported: 'empty-stack' (preferred for CFG-derived PDAs)
 * and 'final-state' (set of accepting states).
 *
 * Return shape is the "trace" expected by the stepper UI:
 *   {
 *     accepted: boolean,
 *     reason:   'accepted' | 'rejected' | 'limit' | 'dead-end',
 *     trace:    StackStep[],          // accepting path (or longest prefix explored)
 *   }
 *   StackStep = {
 *     step, state, remaining, stack, move?: { input, pop, push, source, production? }
 *   }
 *
 * The first entry is the initial configuration (no `move`); each subsequent
 * entry is the configuration AFTER applying its `move`.
 *
 * Defensive programming (see §5 of the product spec):
 *   • All configurations normalize `stack` to a real array before use.
 *   • Transitions are validated (`pop` present, `push` coerced to an array)
 *     before being applied; malformed entries are silently skipped rather
 *     than crashing the simulator.
 *   • `buildResult` always receives `inputSymbols` and tolerates `endKey=null`
 *     (falls back to the initial configuration so the trace is never empty).
 */

import { ExecutionLimitError, ValidationError } from '../errors.js'

export function simulatePDA(pda, input, opts = {}) {
  const maxSteps = opts.maxSteps ?? 2000
  const maxStack = opts.maxStack ?? 200

  if (!pda || typeof pda !== 'object') {
    throw new ValidationError('pda-missing', 'simulatePDA: `pda` is required.')
  }
  if (!Array.isArray(pda.transitions)) {
    throw new ValidationError('pda-malformed', 'simulatePDA: `pda.transitions` must be an array.')
  }

  // Validate input belongs to Σ.
  const inputSymbols = Array.from(input ?? '')
  const inputAlpha = new Set(pda.inputAlphabet || [])
  for (let i = 0; i < inputSymbols.length; i++) {
    if (!inputAlpha.has(inputSymbols[i])) {
      throw new ValidationError(
        'symbol-not-in-alphabet',
        `Input symbol '${inputSymbols[i]}' at position ${i} is not in Σ = {${[...inputAlpha].join(', ')}}.`,
        { position: i, symbol: inputSymbols[i] },
      )
    }
  }

  const initStack = pda.initialStack !== undefined && pda.initialStack !== null ? [pda.initialStack] : []
  const initConfig = {
    state: pda.start,
    idx: 0,
    stack: initStack, // top = last element
  }
  const initKey = keyOf(initConfig)
  const parent = new Map() // key → { prevKey, move, config }
  parent.set(initKey, { prevKey: null, move: null, config: initConfig })

  const frontier = [initKey]
  let explored = 0
  let acceptKey = null

  while (frontier.length) {
    if (explored++ > maxSteps) {
      return buildResult({
        parent,
        initKey,
        endKey: deepestExplored(parent) || initKey,
        accepted: false,
        reason: 'limit',
        inputSymbols,
        error: new ExecutionLimitError(maxSteps),
      })
    }
    const key = frontier.shift()
    const node = parent.get(key)
    if (!node) continue // shouldn't happen, but defensive
    const { config } = node

    // Check acceptance
    if (isAccepting(pda, config, inputSymbols)) {
      acceptKey = key
      break
    }

    // Expand successors
    for (const t of applicableTransitions(pda, config, inputSymbols)) {
      const nextConfig = applyTransition(config, t)
      if (!nextConfig) continue // skip malformed transitions
      if (nextConfig.stack.length > maxStack) continue
      const nextKey = keyOf(nextConfig)
      if (parent.has(nextKey)) continue
      parent.set(nextKey, { prevKey: key, move: t, config: nextConfig })
      frontier.push(nextKey)
    }
  }

  if (acceptKey !== null) {
    return buildResult({
      parent,
      initKey,
      endKey: acceptKey,
      accepted: true,
      reason: 'accepted',
      inputSymbols,
    })
  }

  return buildResult({
    parent,
    initKey,
    endKey: deepestExplored(parent) || initKey,
    accepted: false,
    reason: 'dead-end',
    inputSymbols,
  })
}

// ─── helpers ──────────────────────────────────────────────────────────────

function keyOf(config) {
  const stack = Array.isArray(config?.stack) ? config.stack : []
  return `${config?.state ?? '?'}|${config?.idx ?? 0}|${stack.join(',')}`
}

function isAccepting(pda, config, inputSymbols) {
  const stack = Array.isArray(config.stack) ? config.stack : []
  if (config.idx !== inputSymbols.length) return false
  if (pda.acceptMode === 'empty-stack') return stack.length === 0
  if (pda.acceptMode === 'final-state') {
    const accepts = new Set(pda.acceptStates || [])
    return accepts.has(config.state)
  }
  return false
}

function applicableTransitions(pda, config, inputSymbols) {
  const out = []
  const stack = Array.isArray(config.stack) ? config.stack : []
  const top = stack.length > 0 ? stack[stack.length - 1] : undefined
  const current = inputSymbols[config.idx]

  for (const t of pda.transitions) {
    if (!t || typeof t !== 'object') continue
    if (t.from !== config.state) continue
    // Can't pop from an empty stack, or if top doesn't match.
    if (top === undefined) continue
    if (t.pop !== top) continue
    if (t.input === 'ε' || t.input === '' || t.input == null) {
      // ε-move: always applicable if stack top matches.
      out.push(t)
      continue
    }
    if (current === t.input) out.push(t)
  }
  return out
}

function applyTransition(config, t) {
  if (!t) return null
  const stack = Array.isArray(config.stack) ? config.stack.slice() : []
  if (stack.length === 0) return null // guarded by applicableTransitions, but defensive
  stack.pop()
  const push = Array.isArray(t.push) ? t.push : []
  for (const s of push) stack.push(s) // push already in stack order (top last)
  const isEpsilon = t.input === 'ε' || t.input === '' || t.input == null
  return {
    state: t.to,
    idx: config.idx + (isEpsilon ? 0 : 1),
    stack,
  }
}

function deepestExplored(parent) {
  let best = null
  let bestDepth = -1
  for (const [k] of parent) {
    const depth = measureDepth(parent, k)
    if (depth > bestDepth) {
      best = k
      bestDepth = depth
    }
  }
  return best
}

function measureDepth(parent, k) {
  let depth = 0
  let cur = k
  while (parent.get(cur)?.prevKey) {
    cur = parent.get(cur).prevKey
    depth++
  }
  return depth
}

function buildResult({ parent, initKey, endKey, accepted, reason, inputSymbols, error }) {
  const symbols = Array.isArray(inputSymbols) ? inputSymbols : []
  const path = []
  let cur = endKey || initKey || null
  let guard = 0
  while (cur && guard++ < 100000) {
    const node = parent.get(cur)
    if (!node) break
    path.push({ move: node.move, config: node.config })
    cur = node.prevKey
  }
  path.reverse()

  // Guarantee the trace always contains at least the initial configuration.
  if (path.length === 0 && initKey) {
    const init = parent.get(initKey)
    if (init) path.push({ move: null, config: init.config })
  }

  const trace = path.map((row, i) => {
    const cfg = row.config || {}
    const stack = Array.isArray(cfg.stack) ? cfg.stack.slice() : []
    const idx = typeof cfg.idx === 'number' ? cfg.idx : 0
    return {
      step: i,
      state: cfg.state ?? '?',
      idx,
      remaining: symbols.slice(idx).join(''),
      stack,
      move: row.move || undefined,
    }
  })

  return { accepted, reason, trace, ...(error ? { error } : {}) }
}
