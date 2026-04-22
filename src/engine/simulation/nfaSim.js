import { NotImplementedError } from '../errors.js'

/**
 * NFA step-by-step simulator (SRS §5.1).
 * Tracks a *set* of currently active states; caller renders them all as
 * highlighted simultaneously (visualization §7 "NFA" rule).
 */
export function simulateNFA(/* nfa, input, opts */) {
  throw new NotImplementedError('NFA simulator')
}
