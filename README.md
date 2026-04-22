# TOCTalk

**TOCTalk** is a browser-based learning platform for **Theory of Computation**. It pairs interactive labs (automata, regular expressions, grammars, Turing machines, proofs, decidability, and complexity) with step-by-step visualizations so you can experiment with formal models instead of only reading static diagrams.

## Features

- **Automata** (`/automata`) — Build and simulate finite automata and related models on a graph canvas.
- **Regex lab** (`/regex`) — Parse regular expressions, run the Thompson construction, subset construction, and DFA minimization with a unified step log and graph snapshots.
- **CFG lab** (`/cfg`) — Edit context-free grammars, CNF/GNF workflows, and grammar-linked visualizations (legacy `/grammar` redirects here).
- **Turing machines** (`/tm`) — Define or load TM presets and watch tape-based simulation.
- **Proof lab** (`/proof-lab`) — Parameterized proof templates (pumping lemmas, closure, Myhill–Nerode, ambiguity, equivalence, reductions). Legacy `/proofs` redirects here.
- **Decidability** (`/decidability-lab`) — Catalog of undecidable problems and reduction chains. Legacy `/decidability` redirects here.
- **Complexity** (`/complexity`) — Exploration of complexity classes and relationships.
- **Quiz** (`/quiz`) — Practice questions with feedback.
- **About** (`/about`) — Project information.

The **computation engine** lives under `src/engine/` as pure JavaScript modules (no React). The UI in `src/pages/` and `src/viz/` consumes graph models and step logs from the engine.

## Tech stack


| Area               | Choice                             |
| ------------------ | ---------------------------------- |
| App                | React 18, Vite 4                   |
| Routing            | React Router 6                     |
| Styling            | Tailwind CSS 3                     |
| Graphs / canvas    | Cytoscape.js, React Flow, D3, Visx |
| Motion             | Framer Motion, GSAP                |
| Editing            | Monaco Editor                      |
| Forms / validation | React Hook Form, Zod               |
| Icons              | Lucide React                       |


## Requirements

- **Node.js** 18+ recommended (matches current Vite/React toolchain).

## Quick start

```bash
cd TOCTalk
npm install
npm run dev
```

Vite is configured to serve on **[http://localhost:3000](http://localhost:3000)** and may open the browser automatically (`vite.config.js`).


| Script            | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Development server with HMR                      |
| `npm run build`   | Production build → `dist/` (source maps enabled) |
| `npm run preview` | Local preview of the production build            |
| `npm run lint`    | ESLint on `.js` / `.jsx`                         |


## Project layout

```
TOCTalk/
├── index.html              # Vite entry HTML
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── src/
│   ├── main.jsx            # React bootstrap + router shell
│   ├── App.jsx             # Route table
│   ├── index.css           # Global styles
│   ├── engine/             # Pure ToC algorithms & simulators (no DOM)
│   ├── pages/              # Screen-level components per route
│   ├── viz/                # Cytoscape / steppers / tape views
│   ├── components/         # Layout, automata UI, grammar UI, etc.
│   ├── data/               # Syllabus / static data
│   └── hooks/              # Shared hooks (e.g. GSAP)
├── books/                  # Local textbook PDFs (optional; not required to run the app)
└── dist/                   # Build output (generated; typically gitignored)
```

## Production build

```bash
npm run build
```

Serve the `dist/` folder with any static host (e.g. Netlify, Vercel, GitHub Pages, or `npm run preview` for a quick check).

## Documentation in this repo

- **TOCKTalk_SRS.txt** — Original software requirements / specification notes (if present)

## Contributing

Issues and pull requests are welcome if you publish this project to a forge. Keep UI changes in `src/pages` and `src/components`, and keep algorithmic logic in `src/engine/`

