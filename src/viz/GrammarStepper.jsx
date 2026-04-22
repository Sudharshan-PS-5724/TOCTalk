import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react'

/**
 * Text-oriented stepper for grammar transformations.
 * Each step's `extras.grammar` is the pretty-printed grammar AFTER that step.
 */
export default function GrammarStepper({ steps, title = 'Derivation' }) {
  const [idx, setIdx] = useState(0)
  const safe = steps && steps.length ? steps : []
  const current = safe[Math.min(idx, safe.length - 1)] || null

  if (!current) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        No derivation steps.
      </div>
    )
  }

  const go = (n) => setIdx(Math.max(0, Math.min(safe.length - 1, n)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-pixel text-[0.65rem] uppercase tracking-wider text-primary">
            {title}
          </p>
          <h3 className="font-display text-lg font-bold text-foreground">
            Step {current.index + 1} / {safe.length} ·{' '}
            <span className="font-mono text-primary">{current.operation}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <NavBtn onClick={() => go(0)} aria="First"><SkipBack /></NavBtn>
          <NavBtn onClick={() => go(idx - 1)} aria="Previous"><ChevronLeft /></NavBtn>
          <NavBtn onClick={() => go(idx + 1)} aria="Next"><ChevronRight /></NavBtn>
          <NavBtn onClick={() => go(safe.length - 1)} aria="Last"><SkipForward /></NavBtn>
        </div>
      </div>

      <pre className="max-h-[360px] overflow-auto rounded-md border border-border bg-background p-3 font-mono text-sm leading-relaxed text-foreground">
        {current.extras?.grammar ?? '(no grammar snapshot)'}
      </pre>

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

function NavBtn({ children, onClick, aria }) {
  const child = React.Children.only(children)
  const Icon = child.type
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
