import React, { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  COMPLEXITY_CATALOG,
  COMPLEXITY_REDUCTIONS,
  reductionPathBetween,
} from '../engine/index.js'
import CytoscapeDiagram from '../viz/CytoscapeDiagram.jsx'

const CLASS_STYLES = {
  P: 'border-primary/40 bg-primary/10 text-primary',
  NP: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  'NP-Complete': 'border-destructive/40 bg-destructive/10 text-destructive',
  'NP-Hard': 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200',
}

export default function ComplexityAnalyzer() {
  const [selectedId, setSelectedId] = useState('3SAT')
  const [srcId, setSrcId] = useState('3SAT')
  const [tgtId, setTgtId] = useState('VC')

  const selected = COMPLEXITY_CATALOG.find((p) => p.id === selectedId)
  const path = useMemo(() => reductionPathBetween(srcId, tgtId), [srcId, tgtId])
  const graph = useMemo(() => buildGraphForCytoscape(), [])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          Module · Complexity Analyzer
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Complexity Analyzer
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Classify canonical decision problems into P, NP, NP-Complete, and
          NP-Hard; inspect the polynomial-time reductions that connect them.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(260px,1fr)_2fr]">
        <aside className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Problem catalog
          </p>
          <ul className="space-y-1">
            {COMPLEXITY_CATALOG.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                    p.id === selectedId
                      ? 'border border-primary/40 bg-primary/10 text-primary'
                      : 'border border-transparent text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="truncate font-mono">{p.name}</span>
                  <ClassBadge cls={p.class} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {selected && (
          <article className="space-y-4 rounded-xl border border-border bg-card p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {selected.name}
                </h2>
                <p className="font-mono text-xs text-muted-foreground">
                  {selected.decision_or_optimization}
                </p>
              </div>
              <ClassBadge cls={selected.class} big />
            </header>

            <section>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Definition
              </h3>
              <p className="mt-1 font-mono text-sm text-foreground">{selected.definition}</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background/40 p-3">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  Best-known time
                </p>
                <p className="mt-1 font-mono text-sm">{selected.best_time_known}</p>
              </div>
              {selected.reduction_from && (
                <div className="rounded-md border border-border bg-background/40 p-3">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">
                    Hard via reduction from
                  </p>
                  <p className="mt-1 font-mono text-sm text-primary">{selected.reduction_from}</p>
                </div>
              )}
            </section>

            <section>
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Reason
              </h3>
              <p className="mt-1 text-sm text-foreground">{selected.reason}</p>
            </section>

            {selected.notes && (
              <p className="text-xs italic text-muted-foreground">{selected.notes}</p>
            )}
          </article>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-bold text-foreground">Reduction chain</h3>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <label className="font-mono text-xs uppercase text-muted-foreground">From</label>
          <ProblemSelect value={srcId} onChange={setSrcId} />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <label className="font-mono text-xs uppercase text-muted-foreground">To</label>
          <ProblemSelect value={tgtId} onChange={setTgtId} />
        </div>
        {!path && (
          <p className="rounded-md border border-border bg-background/40 p-3 font-mono text-xs text-muted-foreground">
            No known polynomial-time reduction path between these problems in the catalog.
          </p>
        )}
        {path && (
          <ol className="space-y-2">
            {path.map((step, i) => (
              <li key={`${step.problem.id}-${i}`} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{i + 1}.</span>
                  <span className="font-mono text-sm text-foreground">{step.problem.name}</span>
                  <ClassBadge cls={step.problem.class} />
                </div>
                {step.via && (
                  <p className="ml-6 rounded-md border border-border bg-background/40 p-2 font-mono text-xs text-muted-foreground">
                    <span className="text-primary">mapping:</span> {step.via.mapping}
                    <br />
                    <span className="text-primary">idea:</span> {step.via.idea}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-display text-lg font-bold text-foreground">
          Reduction graph
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Edges point from a problem to the problem it reduces to.  Hardness flows forward.
        </p>
        <div className="h-[420px] rounded-lg border border-border/60 bg-background/40">
          <CytoscapeDiagram graph={graph} />
        </div>
      </section>
    </div>
  )
}

function ProblemSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
    >
      {COMPLEXITY_CATALOG.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
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

/**
 * The CytoscapeDiagram expects the unified { nodes, edges } graph used by
 * the rest of the engine; we adapt the complexity catalog into that shape,
 * making every node a non-start non-accept state so the automata styling
 * doesn't misfire.
 */
function buildGraphForCytoscape() {
  return {
    nodes: COMPLEXITY_CATALOG.map((p, i) => ({
      id: p.id,
      label: p.name,
      isStart: i === 0,
      isAccept: false,
    })),
    edges: COMPLEXITY_REDUCTIONS.map((e, i) => ({
      id: `r_${i}`,
      source: e.from,
      target: e.to,
      label: '≤_p',
    })),
  }
}
