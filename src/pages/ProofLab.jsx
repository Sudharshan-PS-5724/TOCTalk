import React, { useMemo, useState } from 'react'
import { CheckCircle2, Target } from 'lucide-react'
import { PROOF_TEMPLATES, instantiateProof } from '../engine/index.js'

export default function ProofLab() {
  const [templateId, setTemplateId] = useState(PROOF_TEMPLATES[0].id)
  const template = PROOF_TEMPLATES.find((t) => t.id === templateId) || PROOF_TEMPLATES[0]
  const [params, setParams] = useState(
    Object.fromEntries(template.params.map((p) => [p.id, p.default])),
  )

  const rendered = useMemo(() => {
    try {
      return instantiateProof(templateId, params)
    } catch (err) {
      return { error: err }
    }
  }, [templateId, params])

  const onTemplate = (id) => {
    const tpl = PROOF_TEMPLATES.find((t) => t.id === id) || PROOF_TEMPLATES[0]
    setTemplateId(id)
    setParams(Object.fromEntries(tpl.params.map((p) => [p.id, p.default])))
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          Module · Proof Lab
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Proof Lab
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Structured, parameterized proof templates for the most common
          non-regularity, non-CFL, closure, equivalence, ambiguity, and
          reduction arguments.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(260px,1fr)_2fr]">
        <aside className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Templates
          </p>
          <ul className="space-y-1">
            {PROOF_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => onTemplate(t.id)}
                  className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                    t.id === templateId
                      ? 'border border-primary/40 bg-primary/10 text-primary'
                      : 'border border-transparent text-foreground hover:bg-muted/40'
                  }`}
                >
                  <Target className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    <span className="block truncate font-semibold">{t.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.kind}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="space-y-5 rounded-xl border border-border bg-card p-5">
          <header>
            <h2 className="font-display text-2xl font-bold text-foreground">{template.title}</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {template.kind}
            </p>
          </header>

          <section>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Statement
            </h3>
            <p className="mt-1 text-sm text-foreground">{template.statement}</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Parameters
            </h3>
            {template.params.map((p) => (
              <label key={p.id} className="block">
                <span className="font-mono text-xs text-muted-foreground">{p.label}</span>
                <textarea
                  value={params[p.id] ?? ''}
                  rows={Math.max(1, Math.ceil((params[p.id] || '').length / 60))}
                  onChange={(e) => setParams({ ...params, [p.id]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
                />
                {p.help && <p className="mt-1 text-[11px] text-muted-foreground">{p.help}</p>}
              </label>
            ))}
          </section>

          {rendered?.error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {rendered.error.message}
            </p>
          )}

          {rendered?.rendered && (
            <section className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Generated Proof
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                Strategy — {rendered.rendered.strategy}
              </p>
              <ol className="space-y-2">
                {rendered.rendered.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-xs text-primary">{s.label}</span>
                    <span className="text-foreground">{s.detail}</span>
                  </li>
                ))}
              </ol>
              <p className="rounded-md border border-primary/40 bg-background/40 p-3 font-mono text-sm text-primary">
                {rendered.rendered.conclusion}
              </p>
            </section>
          )}
        </article>
      </section>
    </div>
  )
}
