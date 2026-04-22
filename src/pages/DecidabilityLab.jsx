import React, { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Cpu } from 'lucide-react'
import {
  DECIDABILITY_CATALOG,
  REDUCTION_EDGES,
  reductionChainTo,
  riceClassify,
} from '../engine/index.js'

const CLASS_STYLES = {
  decidable: 'border-primary/40 bg-primary/10 text-primary',
  'semi-decidable': 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  undecidable: 'border-destructive/40 bg-destructive/10 text-destructive',
  'co-semi-decidable': 'border-amber-400/40 bg-amber-400/10 text-amber-300',
}

const TABS = [
  { id: 'classify', label: 'Problem Classifier' },
  { id: 'reductions', label: 'Reduction Engine' },
  { id: 'rice', label: "Rice's Theorem" },
]

export default function DecidabilityLab() {
  const [tab, setTab] = useState('classify')

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          Module · Decidability Lab
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Decidability Lab
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Classify canonical decision problems, explore reductions between
          them, and apply Rice's theorem to semantic properties of recursively
          enumerable languages.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition ${
              tab === t.id
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'classify' && <ClassifierView />}
      {tab === 'reductions' && <ReductionView />}
      {tab === 'rice' && <RiceView />}
    </div>
  )
}

function ClassifierView() {
  const [id, setId] = useState(DECIDABILITY_CATALOG[0].id)
  const selected = DECIDABILITY_CATALOG.find((p) => p.id === id)

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(260px,1fr)_2fr]">
      <aside className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Built-in problems
        </p>
        <ul className="space-y-1">
          {DECIDABILITY_CATALOG.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setId(p.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                  p.id === id
                    ? 'border border-primary/40 bg-primary/10 text-primary'
                    : 'border border-transparent text-foreground hover:bg-muted/40'
                }`}
              >
                <span className="truncate font-mono">{p.name}</span>
                <ClassBadge cls={p.classification} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {selected && <ProblemCard problem={selected} />}
    </section>
  )
}

function ProblemCard({ problem }) {
  const chain = reductionChainTo(problem.id)
  return (
    <article className="space-y-4 rounded-xl border border-border bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{problem.name}</h2>
          <p className="font-mono text-xs text-muted-foreground">id = {problem.id}</p>
        </div>
        <ClassBadge cls={problem.classification} big />
      </header>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          1. Problem Interpretation
        </h3>
        <p className="mt-1 font-mono text-sm text-foreground">{problem.definition}</p>
      </section>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          2. Classification
        </h3>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-mono">{problem.classification}</span>
          {problem.language_class && (
            <span className="ml-2 text-muted-foreground">
              ({problem.language_class})
            </span>
          )}
        </p>
      </section>

      <section>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          3. Proof / Decision Procedure
        </h3>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-semibold">Strategy — </span>
          {problem.proof.strategy}
        </p>
        <ol className="mt-3 space-y-2 text-sm text-foreground">
          {problem.proof.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-xs text-primary">Step {i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {chain.length > 1 && (
        <section>
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            4. Reduction Chain
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {chain.map((step, i) => (
              <React.Fragment key={step.id}>
                <span className="rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-xs">
                  {step.name}
                </span>
                {i < chain.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </section>
      )}

      {problem.rice_applicable && (
        <section className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
          <span className="font-mono font-semibold">Rice applicable — </span>
          this is a semantic non-trivial property of L(M), so undecidability
          follows directly from Rice's theorem.
        </section>
      )}

      {problem.notes && (
        <p className="text-xs italic text-muted-foreground">{problem.notes}</p>
      )}
    </article>
  )
}

function ReductionView() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        All catalogued reductions (from ≤_m to)
      </p>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse font-mono text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2">From</th>
              <th className="px-3 py-2">To</th>
              <th className="px-3 py-2">Mapping</th>
              <th className="px-3 py-2">Idea</th>
            </tr>
          </thead>
          <tbody>
            {REDUCTION_EDGES.map((e, i) => (
              <tr key={i} className="border-t border-border/40">
                <td className="px-3 py-2 text-primary">{e.from}</td>
                <td className="px-3 py-2 text-foreground">{e.to}</td>
                <td className="px-3 py-2 text-foreground">{e.mapping}</td>
                <td className="px-3 py-2 text-muted-foreground">{e.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function RiceView() {
  const [description, setDescription] = useState('L(M) contains the string "abba"')
  const [semantic, setSemantic] = useState(true)
  const [trivial, setTrivial] = useState(false)

  const verdict = useMemo(
    () => riceClassify({ description, semantic, trivial }),
    [description, semantic, trivial],
  )

  const verdictStyles = {
    'undecidable-by-rice': 'border-destructive/40 bg-destructive/10 text-destructive',
    'trivially-decidable': 'border-primary/40 bg-primary/10 text-primary',
    'syntactic-may-be-decidable': 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    'need-direct-proof': 'border-border bg-muted/20 text-muted-foreground',
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold text-foreground">Input property</h3>
        <label className="block">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
          />
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Semantic</span> — depends ONLY on L(M),
            not on the description of M itself.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={trivial}
            onChange={(e) => setTrivial(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="font-semibold">Trivial</span> — holds for every RE
            language, or for none.
          </span>
        </label>
      </div>

      <div
        className={`rounded-xl border p-5 shadow-card-3d ${
          verdictStyles[verdict.verdict] || 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <h3 className="font-display text-lg font-bold">Verdict</h3>
        </div>
        <p className="mt-3 font-mono text-sm uppercase tracking-wide">{verdict.verdict}</p>
        <p className="mt-3 text-sm leading-relaxed">{verdict.reason}</p>
        {verdict.applies && (
          <p className="mt-3 rounded-md border border-current/40 bg-background/20 p-3 font-mono text-xs">
            ∴ The language {'{ ⟨M⟩ : '}
            {verdict.description}
            {' }'} is <span className="font-bold">undecidable</span>.
          </p>
        )}
      </div>
    </section>
  )
}

function ClassBadge({ cls, big = false }) {
  return (
    <span
      className={`rounded-md border px-2 py-0.5 font-mono uppercase tracking-wide ${
        big ? 'text-xs' : 'text-[10px]'
      } ${CLASS_STYLES[cls] || 'border-border text-muted-foreground'}`}
    >
      {cls}
    </span>
  )
}
