/**
 * Curriculum spine — topic groupings for the landing “syllabus map”.
 * Routes point at the live engine-backed labs (not legacy placeholder pages).
 * Tones: cyberpunk red/cyan on dark (no lavender).
 */
export const syllabusParts = [
  {
    id: 'p1',
    title: 'Part I — Introduction',
    tone: 'from-rose-950/80 via-zinc-950/40 to-cyan-950/30',
    chapters: [
      { n: '1–2', label: 'Why TOC · Languages & strings', route: '/about' },
      { n: '3–4', label: 'Hierarchy · Computation & nondeterminism', route: '/decidability-lab' },
    ],
  },
  {
    id: 'p2',
    title: 'Part II — Finite machines & regular languages',
    tone: 'from-red-950/70 via-zinc-900/50 to-cyan-950/25',
    chapters: [
      { n: '5–7', label: 'FSM · Regex · Regular grammars', route: '/regex' },
      { n: '8–9', label: 'Non-regular languages · Decision procedures', route: '/proof-lab' },
    ],
  },
  {
    id: 'p3',
    title: 'Part III — CFG & pushdown automata',
    tone: 'from-emerald-950/40 via-zinc-950/50 to-rose-950/40',
    chapters: [
      { n: '11–12', label: 'CFG · CNF · GNF · PDA', route: '/cfg' },
      { n: '13–15', label: 'CFL properties · Parsing (intro)', route: '/cfg' },
    ],
  },
  {
    id: 'p4',
    title: 'Part IV — Turing machines & undecidability',
    tone: 'from-violet-950/50 via-zinc-950/60 to-cyan-950/35',
    chapters: [
      { n: '17–20', label: 'TM · Church–Turing · Decidable vs SD', route: '/tm' },
      { n: '21–23', label: 'Reductions · Rice · HALT · PCP', route: '/decidability-lab' },
    ],
  },
  {
    id: 'p5',
    title: 'Part V — Complexity',
    tone: 'from-fuchsia-950/40 via-zinc-950/55 to-red-950/45',
    chapters: [
      { n: '27–31', label: 'P, NP · NPC · Reduction chains', route: '/complexity' },
    ],
  },
]

/**
 * Primary interactive modules — matches sidebar + App routes.
 */
export const moduleCards = [
  { title: 'Regex Lab', desc: 'Thompson · ε-NFA · subset · minimal DFA', route: '/regex', emoji: '∑' },
  { title: 'CFG Chilling', desc: 'CNF · GNF · PDA · regular → DFA', route: '/cfg', emoji: '⌘' },
  { title: 'TM Test Site', desc: 'DSL TMs · tape simulation · presets', route: '/tm', emoji: '▤' },
  { title: 'Decidability Lab', desc: 'HALT · A_TM · Rice · reductions', route: '/decidability-lab', emoji: 'Σ' },
  { title: 'Complexity', desc: 'P · NP · NPC · SAT → CLIQUE …', route: '/complexity', emoji: '⧗' },
  { title: 'Proof Lab', desc: 'Pumping · MN · closure · reductions', route: '/proof-lab', emoji: '◇' },
  { title: 'Automata Lab', desc: 'DFA · NFA · legacy visual playground', route: '/automata', emoji: '⬡' },
  { title: 'Quiz Rush', desc: 'Timed drills & XP', route: '/quiz', emoji: '⚡' },
  { title: 'About', desc: 'Credits & how to use TOCTalk', route: '/about', emoji: '◆' },
]
