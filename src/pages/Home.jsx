import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Map, Crosshair } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PixelFrame } from '../components/PixelFrame'
import { syllabusParts, moduleCards } from '../data/syllabusFromBooks'

const stats = [
  { label: 'Parts', value: '5' },
  { label: 'Labs', value: '9' },
  { label: 'Books', value: '4+' },
  { label: 'Modes', value: '∞' },
]

const labStrip = [
  { to: '/regex', label: 'Regex' },
  { to: '/cfg', label: 'CFG' },
  { to: '/tm', label: 'TM' },
  { to: '/decidability-lab', label: 'Decidability' },
  { to: '/complexity', label: 'Complexity' },
  { to: '/proof-lab', label: 'Proofs' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const Home = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-toc-hero">
      {/* Stella-like dotted field + pixel lattice */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-dot-field bg-[length:14px_14px] opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-pixel-grid opacity-[0.35]"
        aria-hidden
      />

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-10 pt-8 text-center md:pt-14"
      >
        <PixelFrame className="mb-7 w-full max-w-xl px-4 py-3 md:px-6 md:py-3.5">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[0.5rem] leading-relaxed text-secondary md:text-[0.6rem]">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            <span className="font-pixel uppercase tracking-[0.12em] text-[hsl(120_8%_88%)]">
              Side quest: master TOC
            </span>
            <Crosshair className="h-3 w-3 text-primary opacity-80" />
          </div>
        </PixelFrame>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-6xl md:leading-[1.08]">
          <span className="text-gradient">TOCTalk</span>
          <br />
          <span className="mt-1 block text-xl font-semibold tracking-wide text-muted-foreground md:text-3xl">
            Regex · CFG · TM · Decidability · Complexity · Proofs
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg [&>strong]:text-foreground">
          Gamified Theory of Computation — dotted, pixel-edged UI with{' '}
          <strong className="font-medium">red–neon + black</strong> cyber tone and{' '}
          <strong className="font-medium">cyan</strong> accents. Synergy-heavy module cards,
          syllabus map from classic texts, and labs where <strong>every state is a circle</strong>{' '}
          (start = cyan ring, accept = double ring).
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/regex"
            className="font-display inline-flex items-center rounded-sm border-[3px] border-[#0c0c0c] bg-primary px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-pixel transition hover:bg-[hsl(355_100%_48%)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#020617]"
          >
            Regex Lab
          </Link>
          <Link
            to="/cfg"
            className="font-display inline-flex items-center rounded-sm border-[3px] border-[#0c0c0c] bg-[hsl(0_0%_12%)] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-foreground shadow-pixel transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#020617]"
          >
            CFG Chilling
          </Link>
          <Link
            to="/automata"
            className="font-display inline-flex items-center rounded-sm border-[3px] border-border bg-card px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-foreground shadow-pixel-sm transition hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Automata
          </Link>
          <Link
            to="/quiz"
            className="font-display inline-flex items-center rounded-sm border-[3px] border-secondary bg-[hsl(186_100%_48%)] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-secondary-foreground shadow-pixel-sm transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Quiz Rush
          </Link>
        </div>
        <nav
          aria-label="Core labs"
          className="mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-xs text-muted-foreground md:text-sm"
        >
          {labStrip.map((item, i) => (
            <React.Fragment key={item.to}>
              {i > 0 && <span className="text-border">·</span>}
              <Link to={item.to} className="text-secondary transition hover:text-primary">
                {item.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </motion.section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-foreground">
          <Map className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold md:text-2xl">Syllabus map</h2>
          <span className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[10px] text-muted-foreground md:text-xs">
            canonical TOC spine
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {syllabusParts.map((part, i) => (
            <motion.div
              key={part.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border border-white/10 bg-gradient-to-br ${part.tone} p-px shadow-card-3d`}
            >
              <div className="h-full rounded-[11px] border border-white/5 bg-[hsl(0_0%_7%/0.92)] p-4 backdrop-blur-md">
                <h3 className="font-display text-sm font-bold leading-snug text-foreground md:text-[0.95rem]">
                  {part.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {part.chapters.map((ch) => (
                    <li key={ch.label}>
                      <Link
                        to={ch.route}
                        className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                      >
                        <span className="font-mono text-[10px] text-secondary/90">{ch.n}</span>
                        <span className="group-hover:text-secondary">{ch.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-14 md:grid-cols-2 lg:grid-cols-3"
      >
        {moduleCards.map((m, i) => (
          <motion.div key={m.title} variants={item}>
            <Link to={m.route} className="group block h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[hsl(355_70%_12%)] via-[hsl(0_0%_8%)] to-[hsl(195_40%_10%)] p-px shadow-card-3d transition duration-300 hover:-translate-y-1 hover:shadow-glow-red">
                <div className="relative h-full rounded-2xl bg-toc-card-shine p-6">
                  <div className="absolute right-3 top-3 font-pixel text-[0.5rem] text-secondary/70">
                    LV.{String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-[hsl(0_0%_5%)] text-5xl shadow-inner">
                    <span className="drop-shadow-[0_0_12px_hsl(355_100%_45%/0.5)]">{m.emoji}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                    Deploy
                    <span className="transition group-hover:translate-x-1">›</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      <section className="relative z-10 mx-auto mb-14 grid w-full max-w-4xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <PixelFrame
            key={s.label}
            className="flex flex-col items-center justify-center border-secondary/40 bg-[hsl(355_40%_8%/0.5)] px-3 py-4 text-center"
          >
            <span className="font-pixel text-lg text-primary md:text-xl">{s.value}</span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </span>
          </PixelFrame>
        ))}
      </section>

      <footer className="relative z-10 mt-auto border-t border-border bg-[hsl(0_0%_6%/0.92)] py-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-display text-foreground">TOCTalk</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <Link to="/about" className="hover:text-secondary">
              About
            </Link>
            <span className="text-border">·</span>
            <Link to="/cfg" className="hover:text-secondary">
              CFG
            </Link>
            <span className="text-border">·</span>
            <Link to="/proof-lab" className="hover:text-secondary">
              Proof Lab
            </Link>
            <span className="text-border">·</span>
            <Link to="/decidability-lab" className="hover:text-secondary">
              Decidability
            </Link>
            <span className="text-border">·</span>
            <Link to="/complexity" className="hover:text-secondary">
              Complexity
            </Link>
          </div>
          <p className="max-w-xs text-center text-[10px] text-muted-foreground/80 md:text-right">
            Typography: <span className="text-foreground/90">Syne</span> display ·{' '}
            <span className="text-foreground/90">Inter</span> UI. Full image brief:{' '}
            <code className="rounded bg-muted px-1 font-mono text-[10px]">FRONTEND_ASSET_PROMPTS.txt</code>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
