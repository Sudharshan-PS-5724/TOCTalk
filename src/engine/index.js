// Public entry point for the computation engine.
// Pages/components should import from here, never reach into subpaths.

export {
  ToCError,
  RegexSyntaxError,
  CFGError,
  ValidationError,
  NotImplementedError,
  ExecutionLimitError,
} from './errors.js'

export { parseRegex } from './regex/parser.js'
export { printAST, astToTree } from './regex/ast.js'

export { regexASTtoEpsilonNFA } from './automata/thompson.js'
export { subsetConstruction } from './conversions/subsetConstruction.js'
export { minimizeDFA } from './conversions/minimize.js'
export { simulateDFA } from './simulation/dfaSim.js'

// Grammar (CFG Chilling)
export { parseCFG } from './grammar/cfgParser.js'
export {
  formatGrammar,
  isNonTerminal,
  isTerminal,
  computeNullable,
  computeGenerating,
  computeReachable,
} from './grammar/cfg.js'
export {
  toCNF,
  validateCNF,
  removeEpsilonProductions,
  removeUnitProductions,
  removeUselessSymbols,
  binarizeProductions,
  replaceTerminalsInLongProductions,
} from './grammar/cnf.js'
export { toGNF } from './grammar/gnf.js'
export { classifyGrammar, rightLinearToNFA, LINEARITY } from './grammar/regular.js'
export { cfgToPDA, formatPDARules } from './grammar/cfgToPDA.js'
export { simulatePDA } from './simulation/pdaSim.js'

// TM
export { parseTM, TM_PRESETS, groupPresetsByCategory } from './tm/tm.js'
export { simulateTM } from './simulation/tmSim.js'

// Theory catalogs (Decidability, Complexity, Proofs)
export {
  DECIDABILITY_CATALOG,
  REDUCTION_EDGES,
  reductionChainTo,
  riceClassify,
} from './theory/decidability.js'
export {
  COMPLEXITY_CATALOG,
  COMPLEXITY_REDUCTIONS,
  complexityGraph,
  reductionPathBetween,
} from './theory/complexity.js'
export { PROOF_TEMPLATES, instantiateProof } from './theory/proofs.js'

export { EPSILON, nfaToGraph, dfaToGraph, mergeParallelEdges } from './graph/model.js'
export { StepLog } from './derivation/stepLog.js'

import { parseRegex } from './regex/parser.js'
import { regexASTtoEpsilonNFA } from './automata/thompson.js'
import { subsetConstruction } from './conversions/subsetConstruction.js'
import { minimizeDFA } from './conversions/minimize.js'

/**
 * Convenience: full pipeline Regex string → (AST, ε-NFA + steps).
 * Any RegexSyntaxError is allowed to propagate for the UI to render.
 */
export function regexToEpsilonNFA(src) {
  const ast = parseRegex(src)
  const nfa = regexASTtoEpsilonNFA(ast)
  return { ast, nfa }
}

/**
 * Full pipeline: Regex string → ε-NFA → DFA → minimal DFA, each with steps.
 * This is the "provably correct" replacement for the legacy hardcoded
 * Regex→DFA demo on the Automata page.
 */
export function regexToMinimalDFA(src, opts = {}) {
  const ast = parseRegex(src)
  const nfa = regexASTtoEpsilonNFA(ast)
  const sub = subsetConstruction(nfa, opts.subset)
  const min = minimizeDFA(sub.dfa)
  return {
    ast,
    nfa,
    subset: sub, // { dfa, steps, graph }
    minimal: min, // { dfa, steps, graph, equivalenceClasses, tableFinal }
  }
}
