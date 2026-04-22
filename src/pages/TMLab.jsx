import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  SkipBack,
  SkipForward,
  XCircle,
} from 'lucide-react'
import { parseTM, simulateTM, TM_PRESETS, groupPresetsByCategory } from '../engine/index.js'
import TapeView from '../viz/TapeView.jsx'

const PRESET_GROUPS = groupPresetsByCategory()

export default function TMLab() {
  const [presetId, setPresetId] = useState(TM_PRESETS[0].id)
  const initialPreset = TM_PRESETS.find((p) => p.id === presetId) || TM_PRESETS[0]
  const [src, setSrc] = useState(initialPreset.source)
  const [inputs, setInputs] = useState((initialPreset.sampleInputs || []).join('\n'))
  const activePreset = TM_PRESETS.find((p) => p.id === presetId) || TM_PRESETS[0]

  const tmResult = useMemo(() => {
    try {
      return { ok: true, tm: parseTM(src) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [src])

  const inputList = useMemo(
    () =>
      inputs
        .split(/\r?\n/)
        .map((s) => s)
        .filter((_, i, arr) => arr.length > 0),
    [inputs],
  )

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-pixel text-[0.65rem] uppercase tracking-widest text-primary">
          TM · Test Site
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Turing Machine Lab
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Build a TM with a simple text DSL, run it on any number of input
          strings, and scrub through the tape step-by-step. Bounded at 1000
          steps per run.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card-3d">
          <div className="mb-3 flex items-center justify-between">
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              TM definition
            </label>
            <select
              value={presetId}
              onChange={(e) => {
                const p = TM_PRESETS.find((x) => x.id === e.target.value)
                if (p) {
                  setPresetId(p.id)
                  setSrc(p.source)
                  if (Array.isArray(p.sampleInputs)) {
                    setInputs(p.sampleInputs.join('\n'))
                  }
                }
              }}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-foreground"
            >
              {Object.entries(PRESET_GROUPS).map(([group, list]) => (
                <optgroup key={group} label={group}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <textarea
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            rows={14}
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Input strings (one per line)
          </label>
          <textarea
            value={inputs}
            onChange={(e) => setInputs(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {tmResult.ok && (
            <dl className="mt-4 space-y-1 text-xs">
              <Row k="start" v={tmResult.tm.start} />
              <Row k="accept" v={tmResult.tm.accept.join(', ') || '—'} />
              <Row k="blank" v={tmResult.tm.blank} />
              <Row k="Σ" v={`{ ${tmResult.tm.inputAlphabet.join(', ')} }`} />
              <Row k="Γ" v={`{ ${tmResult.tm.tapeAlphabet.join(', ')} }`} />
            </dl>
          )}
          {activePreset?.description && (
            <p className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-mono uppercase tracking-wider text-foreground/70">
                About this TM —{' '}
              </span>
              {activePreset.description}
            </p>
          )}
          {activePreset?.formal && (
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {activePreset.formal}
            </p>
          )}
        </div>
      </section>

      {!tmResult.ok && <ErrBox err={tmResult.error} />}

      {tmResult.ok && (
        <div className="space-y-4">
          {inputList.map((inp, i) => (
            <SimulationCard key={`${i}-${inp}`} tm={tmResult.tm} input={inp} />
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono text-foreground">{v}</dd>
    </div>
  )
}

function SimulationCard({ tm, input }) {
  const result = useMemo(() => {
    try {
      return { ok: true, ...simulateTM(tm, input) }
    } catch (err) {
      return { ok: false, error: err }
    }
  }, [tm, input])

  const [idx, setIdx] = useState(0)
  const length = result.ok ? result.trace.length : 0
  const go = (n) => setIdx(Math.max(0, Math.min(length - 1, n)))
  const current = result.ok ? result.trace[Math.min(idx, length - 1)] : null

  const banner = result.ok
    ? result.accepted
      ? { kind: 'ok', label: 'Accepted', icon: CheckCircle2 }
      : { kind: 'no', label: `Rejected (${result.reason})`, icon: XCircle }
    : { kind: 'err', label: result.error?.name ?? 'Error', icon: AlertTriangle }
  const Icon = banner.icon

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Input
          </p>
          <p className="font-mono text-lg text-foreground">
            {input.length === 0 ? 'ε' : input}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
            banner.kind === 'ok'
              ? 'border-primary/40 bg-primary/10 text-primary'
              : banner.kind === 'no'
                ? 'border-border bg-muted/30 text-muted-foreground'
                : 'border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{banner.label}</span>
          {result.ok && (
            <span className="font-mono text-xs opacity-70">
              · {length - 1} step{length - 1 === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </header>

      {!result.ok && (
        <p className="font-mono text-sm text-destructive">
          {result.error.message}
        </p>
      )}

      {result.ok && current && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Step {idx} / {length - 1}
              </p>
              <p className="font-mono text-sm text-foreground">
                state = <span className="text-primary">{current.state}</span>
              </p>
              {current.move && (
                <p className="font-mono text-xs text-muted-foreground">
                  δ({current.move.from}, {current.move.read}) = ({current.move.to},{' '}
                  {current.move.write}, {current.move.direction})
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <NavBtn onClick={() => go(0)} aria="First">
                <SkipBack className="h-4 w-4" />
              </NavBtn>
              <NavBtn onClick={() => go(idx - 1)} aria="Previous">
                <ChevronLeft className="h-4 w-4" />
              </NavBtn>
              <NavBtn onClick={() => go(idx + 1)} aria="Next">
                <ChevronRight className="h-4 w-4" />
              </NavBtn>
              <NavBtn onClick={() => go(length - 1)} aria="Last">
                <SkipForward className="h-4 w-4" />
              </NavBtn>
            </div>
          </div>
          <TapeView cells={current.cells} head={current.head} />
          <details className="rounded-md border border-border bg-background/60 p-3 text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Full trace ({length - 1} transitions)
            </summary>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full border-collapse font-mono">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-2 py-1">step</th>
                    <th className="px-2 py-1">state</th>
                    <th className="px-2 py-1">head</th>
                    <th className="px-2 py-1">read</th>
                    <th className="px-2 py-1">write</th>
                    <th className="px-2 py-1">dir</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trace.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-border/40 ${i === idx ? 'bg-primary/10' : ''}`}
                    >
                      <td className="px-2 py-1 text-muted-foreground">{i}</td>
                      <td className="px-2 py-1 text-foreground">{row.state}</td>
                      <td className="px-2 py-1">{row.head}</td>
                      <td className="px-2 py-1">{row.move?.read ?? '—'}</td>
                      <td className="px-2 py-1">{row.move?.write ?? '—'}</td>
                      <td className="px-2 py-1">{row.move?.direction ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </section>
  )
}

function NavBtn({ children, onClick, aria }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  )
}

function ErrBox({ err }) {
  return (
    <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">{err.name}</p>
          <p className="mt-1 font-mono text-sm text-destructive/90">{err.message}</p>
        </div>
      </div>
    </section>
  )
}
