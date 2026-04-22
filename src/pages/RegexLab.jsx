import React, { useMemo, useState } from 'react'
import { AlertTriangle, Wand2, PlayCircle, XCircle } from 'lucide-react'
import {
  parseRegex,
  regexASTtoEpsilonNFA,
  subsetConstruction,
  minimizeDFA,
  simulateDFA,
  astToTree,
} from '../engine/index.js'
import CytoscapeDiagram from '../viz/CytoscapeDiagram.jsx'
import DerivationStepper from '../viz/DerivationStepper.jsx'

const EXAMPLES = [
  '(a|b)*abb',
  'a(b|c)*',
  '(a|ε)b*',
  'a*b*',
  '(ab|ba)*',
  'a(a|b)*b',
]

export default function RegexLab() {
  const [src, setSrc] = useState('(a|b)*abb')
  const [testInput, setTestInput] = useState('aabb')
  const [showSteps, setShowSteps] = useState('thompson') // 'thompson' | 'subset' | 'minimize' | 'none'

  const result = useMemo(() => {
    try {
      const ast = parseRegex(src)
      const nfa = regexASTtoEpsilonNFA(ast)
      const sub = subsetConstruction(nfa)
      const min = minimizeDFA(sub.dfa)
      return { ok: true, ast, nfa, sub, min }
    } catch (err) {
      return {
        ok: false,
        error: {
          name: err.name || 'Error',
          message: err.message,
          position: err.position,
          reason: err.reason,
        },
      }
    }
  }, [src])

  const simulation = useMemo(() => {
    if (!result.ok) return null
    try {
      const out = simulateDFA(result.min.dfa, testInput)
      return { ok: true, ...out }
    } catch (err) {
      return { ok: false, error: { name: err.name, message: err.message } }
    }
  }, [result, testInput])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          Engine · Phases 1–4
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Regex Lab — Regex ➜ ε-NFA ➜ DFA ➜ Minimal DFA
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Strict parser → Thompson construction → subset construction with
          ε-closure → table-filling minimization. Every transformation is
          step-logged so you can scrub through the derivation, and the final
          minimal DFA runs a bounded simulator for testing strings.
        </p>
      </header>

      {/* ── Regex input ─────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-card-3d">
        <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Regex (alphabet a–z, A–Z, 0–9 &middot; operators <code>|</code>{' '}
          <code>*</code> <code>(</code> <code>)</code> <code>ε</code>)
        </label>
        <input
          type="text"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoComplete="off"
          placeholder="(a|b)*abb"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setSrc(ex)}
              className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {!result.ok && (
        <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="min-w-0">
              <p className="font-semibold text-destructive">
                {result.error.name}
              </p>
              <p className="mt-1 font-mono text-sm text-destructive/90">
                {result.error.message}
              </p>
              {typeof result.error.position === 'number' && (
                <ErrorPointer src={src} pos={result.error.position} />
              )}
            </div>
          </div>
        </section>
      )}

      {result.ok && (
        <>
          {/* ── Row: ε-NFA + AST ───────────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DiagramCard
              title="Final ε-NFA"
              subtitle={`${result.nfa.states.length} states · ${result.nfa.transitions.length} transitions`}
              graph={result.nfa.graph}
              detail={
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <Info label="Start" value={result.nfa.start} />
                  <Info label="Accept" value={result.nfa.accepts.join(', ')} />
                  <Info
                    className="col-span-2"
                    label="Alphabet Σ"
                    value={
                      result.nfa.alphabet.length
                        ? `{ ${result.nfa.alphabet.join(', ')} }`
                        : '∅'
                    }
                  />
                </dl>
              }
            />

            <section className="rounded-xl border border-border bg-card p-5">
              <header className="mb-3">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Parse Tree (AST)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Precedence applied: <code>*</code> &gt; concatenation &gt;{' '}
                  <code>|</code>.
                </p>
              </header>
              <pre className="max-h-[420px] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground">
                {astToTree(result.ast)}
              </pre>
            </section>
          </div>

          {/* ── Row: DFA + Minimal DFA ─────────────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DiagramCard
              title="Deterministic DFA"
              subtitle={`${result.sub.dfa.states.length} states · subset construction`}
              graph={result.sub.graph}
              detail={<SubsetMapping dfa={result.sub.dfa} />}
            />
            <DiagramCard
              title="Minimal DFA"
              subtitle={`${result.min.dfa.states.length} states · table-filling`}
              graph={result.min.graph}
              detail={<EquivalenceList classes={result.min.equivalenceClasses} />}
            />
          </div>

          {/* ── Transition table (minimal DFA) ─────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-5">
            <header className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                δ transition table (minimal DFA)
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                Σ = {'{' + result.min.dfa.alphabet.join(', ') + '}'}
              </span>
            </header>
            <DFATransitionTable dfa={result.min.dfa} />
          </section>

          {/* ── Simulation ─────────────────────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-5">
            <header className="mb-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                Simulate a string on the minimal DFA
              </h2>
              <p className="text-xs text-muted-foreground">
                Bounded at 1000 steps. Rejects symbols not in Σ with a precise
                position.
              </p>
            </header>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              spellCheck={false}
              placeholder="aabb"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <SimulationView simulation={simulation} />
          </section>

          {/* ── Derivation stepper (tabbed) ─────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card p-5">
            <header className="mb-3 flex flex-wrap items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Derivation
              </h2>
              <div className="ml-auto flex flex-wrap gap-1">
                {[
                  ['thompson', `Thompson (${result.nfa.steps.length})`],
                  ['subset', `Subset (${result.sub.steps.length})`],
                  ['minimize', `Minimize (${result.min.steps.length})`],
                  ['none', 'Hide'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setShowSteps(key)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                      showSteps === key
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </header>
            {showSteps === 'thompson' && (
              <DerivationStepper
                steps={result.nfa.steps}
                title="Thompson construction"
              />
            )}
            {showSteps === 'subset' && (
              <DerivationStepper
                steps={result.sub.steps}
                title="Subset construction"
              />
            )}
            {showSteps === 'minimize' && (
              <DerivationStepper
                steps={result.min.steps}
                title="Table-filling minimization"
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function DiagramCard({ title, subtitle, graph, detail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{subtitle}</span>
      </header>
      <CytoscapeDiagram graph={graph} height={380} />
      {detail && <div className="mt-4">{detail}</div>}
    </section>
  )
}

function Info({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-foreground">{value}</dd>
    </div>
  )
}

function SubsetMapping({ dfa }) {
  return (
    <div className="space-y-1 text-xs">
      <p className="text-muted-foreground">DFA state ↔ NFA subset</p>
      <ul className="grid gap-1 font-mono text-foreground sm:grid-cols-2">
        {dfa.states.map((s) => (
          <li key={s.id} className="truncate">
            <span className="text-primary">{s.id}</span> = {s.subsetLabel}
            {s.accepting && <span className="ml-1 text-destructive">★</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EquivalenceList({ classes }) {
  return (
    <div className="space-y-1 text-xs">
      <p className="text-muted-foreground">Equivalence classes merged</p>
      <ul className="grid gap-1 font-mono text-foreground sm:grid-cols-2">
        {classes.map((cls, i) => (
          <li key={i}>
            <span className="text-primary">M{i}</span> = {'{' + cls.join(', ') + '}'}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DFATransitionTable({ dfa }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-3 py-2 font-mono text-xs text-muted-foreground">
              state
            </th>
            {dfa.alphabet.map((s) => (
              <th
                key={s}
                className="px-3 py-2 font-mono text-xs text-muted-foreground"
              >
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dfa.states.map((s) => (
            <tr key={s.id} className="border-b border-border/60">
              <td className="px-3 py-1.5 font-mono text-foreground">
                {s.id === dfa.start && <span className="mr-1">→</span>}
                {s.accepting && <span className="mr-1">*</span>}
                {s.id}
              </td>
              {dfa.alphabet.map((sym) => (
                <td
                  key={sym}
                  className="px-3 py-1.5 font-mono text-muted-foreground"
                >
                  {dfa.delta[s.id]?.[sym] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SimulationView({ simulation }) {
  if (!simulation) return null
  if (!simulation.ok) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        <XCircle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-semibold">{simulation.error.name}</p>
          <p className="font-mono text-xs">{simulation.error.message}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-3 space-y-3">
      <div
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
          simulation.accepted
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-muted/30 text-muted-foreground'
        }`}
      >
        <PlayCircle className="h-4 w-4" />
        <span>
          {simulation.accepted ? 'Accepted' : 'Rejected'} &middot; final state{' '}
          <span className="font-mono">{simulation.finalState}</span>
        </span>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-1.5">step</th>
              <th className="px-3 py-1.5">state</th>
              <th className="px-3 py-1.5">symbol</th>
              <th className="px-3 py-1.5">next</th>
              <th className="px-3 py-1.5">remaining</th>
            </tr>
          </thead>
          <tbody>
            {simulation.trace.map((row) => (
              <tr key={row.index} className="border-b border-border/60 font-mono">
                <td className="px-3 py-1 text-muted-foreground">{row.index + 1}</td>
                <td className="px-3 py-1 text-foreground">{row.stateBefore}</td>
                <td className="px-3 py-1 text-primary">{row.symbol}</td>
                <td className="px-3 py-1 text-foreground">{row.stateAfter}</td>
                <td className="px-3 py-1 text-muted-foreground">
                  {row.remaining || 'ε'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ErrorPointer({ src, pos }) {
  const safePos = Math.max(0, Math.min(pos, src.length))
  return (
    <pre className="mt-2 rounded-md bg-background/60 p-3 font-mono text-xs leading-5 text-foreground">
      {src}
      {'\n'}
      {' '.repeat(safePos)}
      <span className="text-destructive">^</span>
    </pre>
  )
}
