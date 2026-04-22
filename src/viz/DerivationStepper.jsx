import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react'
import CytoscapeDiagram from './CytoscapeDiagram.jsx'

/**
 * DerivationStepper — linear scrubber over a StepLog produced by any
 * engine transformation (Thompson, subset construction, CNF, …).
 *
 * Props:
 *   steps: Step[]   // each step has { index, operation, explanation, graph, extras? }
 *   title?: string
 */
export default function DerivationStepper({ steps, title = 'Derivation' }) {
  const [idx, setIdx] = useState(0)
  const safeSteps = steps && steps.length ? steps : []
  const current = safeSteps[Math.min(idx, safeSteps.length - 1)] || null

  const highlightNodes = useMemo(() => {
    const hl = new Set()
    const nodes = current?.extras?.highlightNodes
    if (Array.isArray(nodes)) nodes.forEach((n) => hl.add(n))
    return hl
  }, [current])

  if (!current) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        No derivation steps.
      </div>
    )
  }

  const go = (n) =>
    setIdx(Math.max(0, Math.min(safeSteps.length - 1, n)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[0.65rem] uppercase tracking-wider text-primary">
            {title}
          </p>
          <h3 className="font-display text-lg font-bold text-foreground">
            Step {current.index + 1} / {safeSteps.length} ·{' '}
            <span className="font-mono text-primary">{current.operation}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(0)}
            className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            aria-label="First step"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(idx - 1)}
            className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(safeSteps.length - 1)}
            className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
            aria-label="Last step"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      <CytoscapeDiagram
        graph={current.graph}
        highlightStates={highlightNodes}
        height={380}
      />

      <div className="rounded-lg border border-border bg-card/60 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Why this step
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {current.explanation}
        </p>
      </div>
    </div>
  )
}
