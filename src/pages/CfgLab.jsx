import React, { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, PlayCircle, XCircle } from 'lucide-react'
import {
  parseCFG,
  toCNF,
  validateCNF,
  toGNF,
  classifyGrammar,
  rightLinearToNFA,
  subsetConstruction,
  minimizeDFA,
  cfgToPDA,
  formatPDARules,
  simulatePDA,
  formatGrammar,
} from '../engine/index.js'
import GrammarStepper from '../viz/GrammarStepper.jsx'
import CytoscapeDiagram from '../viz/CytoscapeDiagram.jsx'

const PRESETS = [
  { id: 'anbn', label: 'S → aSb | ε', src: 'S -> aSb | ε' },
  { id: 'expr', label: 'E → E+T | T; T → T*F | F; F → (E) | a (non-regular, has left rec)', src: 'E -> E+T | T\nT -> T*F | F\nF -> a' },
  { id: 'rl', label: 'Right-linear: S → aS | b', src: 'S -> aS | b' },
  { id: 'll', label: 'Left-linear : S → Sa | b', src: 'S -> Sa | b' },
  { id: 'useless', label: 'Useless: S → AB | a; A → a; B → ε', src: 'S -> AB | a\nA -> a\nB -> ε' },
  { id: 'palindrome', label: 'Palindromes: S → aSa | bSb | a | b | ε', src: 'S -> aSa | bSb | a | b | ε' },
]

const TABS = [
  { id: 'cnf', label: 'CNF' },
  { id: 'gnf', label: 'GNF' },
  { id: 'regular', label: 'Regular → DFA' },
  { id: 'pda', label: 'PDA + Stack Sim' },
]

export default function CfgLab() {
  const [src, setSrc] = useState(PRESETS[0].src)
  const [tab, setTab] = useState('cnf')
  const [pdaInput, setPdaInput] = useState('aabb')

  const parsed = useMemo(() => {
    try {
      return { ok: true, grammar: parseCFG(src) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [src])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          CFG · Chilling
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Context-Free Grammar Workbench
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Parse a grammar and transform it through CNF or GNF, detect whether it's
          regular (and if so convert it all the way to a minimal DFA), or build
          the canonical single-state PDA and run a stack simulation against any
          input string. Every transformation logs intermediate grammar snapshots.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card-3d">
        <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Grammar (format: <code>LHS -&gt; rhs1 | rhs2 | ε</code>, one line per NT)
        </label>
        <textarea
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSrc(p.src)}
              className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {!parsed.ok && <GrammarError err={parsed.error} />}

      {parsed.ok && (
        <>
          <section className="rounded-xl border border-border bg-card p-5">
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                Parsed grammar
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                start = {parsed.grammar.start} · V = {parsed.grammar.nonTerminals.size} · Σ = {parsed.grammar.terminals.size}
              </span>
            </header>
            <pre className="rounded-md border border-border bg-background p-3 font-mono text-sm leading-relaxed text-foreground">
              {formatGrammar(parsed.grammar)}
            </pre>
          </section>

          <nav className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs ${
                  tab === t.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'cnf' && <CnfSection grammar={parsed.grammar} />}
          {tab === 'gnf' && <GnfSection grammar={parsed.grammar} />}
          {tab === 'regular' && <RegularSection grammar={parsed.grammar} />}
          {tab === 'pda' && (
            <PdaSection
              grammar={parsed.grammar}
              input={pdaInput}
              onInputChange={setPdaInput}
            />
          )}
        </>
      )}
    </div>
  )
}

// ─── CNF section ─────────────────────────────────────────────────────────

function CnfSection({ grammar }) {
  const result = useMemo(() => {
    try {
      const cnf = toCNF(grammar)
      return { ok: true, cnf, offenders: validateCNF(cnf.grammar) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [grammar])

  if (!result.ok) return <GrammarError err={result.error} />

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <ResultCard title="Final CNF grammar" body={formatGrammar(result.cnf.grammar)} />
        <ValidationCard
          title="CNF validator"
          offenders={result.offenders}
          okMessage="Every production matches A → BC or A → a (plus S → ε only if ε ∈ L)."
        />
      </div>
      <section className="rounded-xl border border-border bg-card p-5">
        <GrammarStepper steps={result.cnf.steps} title="CNF conversion · 5 steps" />
      </section>
    </section>
  )
}

// ─── GNF section ─────────────────────────────────────────────────────────

function GnfSection({ grammar }) {
  const result = useMemo(() => {
    try {
      return { ok: true, gnf: toGNF(grammar) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [grammar])

  if (!result.ok) return <GrammarError err={result.error} />
  return (
    <section className="space-y-6">
      <ResultCard title="Final GNF grammar" body={formatGrammar(result.gnf.grammar)} />
      <section className="rounded-xl border border-border bg-card p-5">
        <GrammarStepper
          steps={result.gnf.steps}
          title="GNF conversion · left-recursion removal + back-substitution"
        />
      </section>
    </section>
  )
}

// ─── Regular → DFA section ───────────────────────────────────────────────

function RegularSection({ grammar }) {
  const classification = useMemo(() => classifyGrammar(grammar), [grammar])

  const derived = useMemo(() => {
    if (!classification.regular) return null
    if (classification.kind === 'left') return { unsupported: true }
    try {
      const nfa = rightLinearToNFA(grammar)
      const sub = subsetConstruction(nfa)
      const min = minimizeDFA(sub.dfa)
      return { nfa, sub, min }
    } catch (err) {
      return { error: err }
    }
  }, [grammar, classification])

  return (
    <section className="space-y-6">
      <div
        className={`rounded-xl border p-4 ${
          classification.regular
            ? 'border-primary/30 bg-primary/5'
            : 'border-destructive/30 bg-destructive/10'
        }`}
      >
        <div className="flex items-start gap-3">
          {classification.regular ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 text-destructive" />
          )}
          <div>
            <p className="font-semibold text-foreground">
              Classification: <span className="font-mono">{classification.kind}</span>
            </p>
            {!classification.regular && (
              <p className="mt-1 text-sm text-muted-foreground">
                {classification.kind === 'mixed'
                  ? 'Grammar contains both right-linear and left-linear productions. A grammar is regular only if all productions are of the same linear kind.'
                  : 'Conversion to DFA is not possible — grammar is not regular.'}
              </p>
            )}
            {classification.offending?.length > 0 && (
              <ul className="mt-2 space-y-1 font-mono text-xs text-destructive/80">
                {classification.offending.slice(0, 5).map((o, i) => (
                  <li key={i}>
                    {o.production.lhs} → {o.production.rhs.join('') || 'ε'} · {o.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {classification.regular && derived?.unsupported && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          This grammar is left-linear. Left-linear conversion is planned — for now
          please flip your productions to right-linear form and re-run.
        </div>
      )}

      {classification.regular && derived?.min && (
        <div className="grid gap-6 lg:grid-cols-2">
          <DiagramCard
            title="NFA (right-linear construction)"
            subtitle={`${derived.nfa.states.length} states`}
            graph={toNfaGraph(derived.nfa)}
          />
          <DiagramCard
            title="Minimal DFA"
            subtitle={`${derived.min.dfa.states.length} states`}
            graph={derived.min.graph}
          />
        </div>
      )}
    </section>
  )
}

function toNfaGraph(nfa) {
  const accepts = new Set(nfa.accepts)
  return {
    nodes: nfa.states.map((s) => ({
      id: s.id,
      isStart: s.id === nfa.start,
      isAccept: accepts.has(s.id),
    })),
    edges: nfa.transitions.map((t, i) => ({
      id: `n${i}`,
      source: t.from,
      target: t.to,
      label: t.symbol,
    })),
  }
}

// ─── PDA section ─────────────────────────────────────────────────────────

function PdaSection({ grammar, input, onInputChange }) {
  const pda = useMemo(() => cfgToPDA(grammar), [grammar])
  const rules = useMemo(() => formatPDARules(pda), [pda])
  const sim = useMemo(() => {
    try {
      return { ok: true, ...simulatePDA(pda, input) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [pda, input])

  return (
    <section className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">
            PDA definition
          </h2>
          <p className="text-xs text-muted-foreground">
            P = ({'{q}'}, Σ, Γ, δ, q, {grammar.start}, ∅) with empty-stack
            acceptance. Every production becomes an ε-move that pops its LHS
            and pushes its RHS onto the stack; every terminal has a match move.
          </p>
        </header>
        <pre className="max-h-[260px] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
          {rules}
        </pre>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-3">
          <h2 className="font-display text-lg font-bold text-foreground">
            Stack simulation
          </h2>
          <p className="text-xs text-muted-foreground">
            Non-deterministic BFS, bounded at 2000 configurations. Shows an
            accepting path when one exists.
          </p>
        </header>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          spellCheck={false}
          placeholder="aabb"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <StackTrace sim={sim} />
      </section>
    </section>
  )
}

function StackTrace({ sim }) {
  if (!sim) return null
  if (!sim.ok) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        <XCircle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-semibold">{sim.error.name}</p>
          <p className="font-mono text-xs">{sim.error.message}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-3 space-y-3">
      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
          sim.accepted
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-muted/30 text-muted-foreground'
        }`}
      >
        <PlayCircle className="h-4 w-4" />
        <span>
          {sim.accepted ? 'Accepted' : `Rejected (${sim.reason})`} · {sim.trace.length - 1} move{sim.trace.length === 2 ? '' : 's'}
        </span>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-1.5">step</th>
              <th className="px-3 py-1.5">state</th>
              <th className="px-3 py-1.5">input</th>
              <th className="px-3 py-1.5">stack (top → right)</th>
              <th className="px-3 py-1.5">move</th>
            </tr>
          </thead>
          <tbody>
            {sim.trace.map((row) => (
              <tr key={row.step} className="border-b border-border/60 font-mono">
                <td className="px-3 py-1 text-muted-foreground">{row.step}</td>
                <td className="px-3 py-1 text-foreground">{row.state}</td>
                <td className="px-3 py-1 text-muted-foreground">
                  {row.remaining || 'ε'}
                </td>
                <td className="px-3 py-1 text-primary">
                  {row.stack.length === 0 ? 'ε' : row.stack.join(' ')}
                </td>
                <td className="px-3 py-1 text-muted-foreground">
                  {row.move
                    ? row.move.source === 'match'
                      ? `match '${row.move.input}'`
                      : `${row.move.production.lhs} → ${row.move.production.rhs.join('') || 'ε'}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Shared subcomponents ────────────────────────────────────────────────

function ResultCard({ title, body }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-3">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      </header>
      <pre className="max-h-[360px] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-sm leading-relaxed text-foreground">
        {body}
      </pre>
    </section>
  )
}

function ValidationCard({ title, offenders, okMessage }) {
  const ok = offenders.length === 0
  return (
    <section
      className={`rounded-xl border p-5 ${
        ok ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/10'
      }`}
    >
      <header className="mb-3 flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      </header>
      {ok ? (
        <p className="text-sm text-muted-foreground">{okMessage}</p>
      ) : (
        <ul className="space-y-1 font-mono text-xs text-destructive">
          {offenders.map((p, i) => (
            <li key={i}>
              {p.lhs} → {p.rhs.join('') || 'ε'}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DiagramCard({ title, subtitle, graph }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{subtitle}</span>
      </header>
      <CytoscapeDiagram graph={graph} height={360} />
    </section>
  )
}

function GrammarError({ err }) {
  return (
    <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div className="min-w-0">
          <p className="font-semibold text-destructive">{err.name}</p>
          <p className="mt-1 font-mono text-sm text-destructive/90">{err.message}</p>
        </div>
      </div>
    </section>
  )
}
