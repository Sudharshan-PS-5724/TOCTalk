import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  Brain,
  Zap,
  Info,
  Home,
  Regex,
  Braces,
  Film,
  Sigma,
  Gauge,
  ScrollText,
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  )
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Home, description: 'Quest hub' },
    { name: 'Automata', href: '/automata', icon: Brain, description: 'DFA, NFA, PDA, TM' },
    { name: 'Regex Lab', href: '/regex', icon: Regex, description: 'Regex ➜ ε-NFA ➜ min DFA' },
    { name: 'CFG Chilling', href: '/cfg', icon: Braces, description: 'CNF, GNF, PDA, DFA (if regular)' },
    { name: 'TM Test Site', href: '/tm', icon: Film, description: 'Turing machine tape simulator' },
    { name: 'Decidability Lab', href: '/decidability-lab', icon: Sigma, description: 'HALT, A_TM, Rice\'s theorem' },
    { name: 'Complexity', href: '/complexity', icon: Gauge, description: 'P, NP, NPC reductions' },
    { name: 'Proof Lab', href: '/proof-lab', icon: ScrollText, description: 'Pumping, Myhill–Nerode, reductions' },
    { name: 'Quiz', href: '/quiz', icon: Zap, description: 'Drills & XP' },
    { name: 'About', href: '/about', icon: Info, description: 'Credits & guide' },
  ]

  const isActive = (path) => location.pathname === path

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 border-r border-sidebar-border bg-sidebar-background/98 shadow-[4px_0_0_0_hsl(355_90%_25%)] backdrop-blur-md transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-sidebar-border p-5">
            <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-12 w-12 items-center justify-center rounded-sm border-[3px] border-black bg-primary shadow-pixel-sm">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-pixel text-[0.65rem] leading-tight text-sidebar-foreground">
                  TOCTALK
                </p>
                <p className="text-xs text-muted-foreground">Theory of Computation</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 transition hover:bg-sidebar-accent"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <p className="mb-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Modules
            </p>
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? 'border border-primary/30 bg-primary/15 font-semibold text-primary shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0 opacity-90" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{item.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      <div
        className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ${
          sidebarOpen ? 'lg:ml-80' : ''
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className={`rounded-lg border border-border bg-card p-2 shadow-sm transition hover:bg-muted ${
                  sidebarOpen ? 'lg:hidden' : ''
                }`}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </button>
              <div className="hidden sm:block">
                <h2 className="font-display text-base font-bold text-foreground md:text-lg">
                  {navigation.find((item) => isActive(item.href))?.name ?? 'TOCTalk'}
                </h2>
                <p className="text-xs text-muted-foreground md:text-sm">
                  {navigation.find((item) => isActive(item.href))?.description ??
                    'Gamified TOC learning'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
