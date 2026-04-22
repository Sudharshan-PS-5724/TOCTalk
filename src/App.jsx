import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Automata from './pages/Automata'
import Quiz from './pages/Quiz'
import About from './pages/About'
import RegexLab from './pages/RegexLab'
import CfgLab from './pages/CfgLab'
import TMLab from './pages/TMLab'
import DecidabilityLab from './pages/DecidabilityLab'
import ComplexityAnalyzer from './pages/ComplexityAnalyzer'
import ProofLab from './pages/ProofLab'

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[hsl(195_20%_7%)] to-[hsl(0_0%_4%)]">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/automata" element={<Automata />} />
          <Route path="/regex" element={<RegexLab />} />
          <Route path="/cfg" element={<CfgLab />} />
          <Route path="/tm" element={<TMLab />} />
          <Route path="/proof-lab" element={<ProofLab />} />
          <Route path="/decidability-lab" element={<DecidabilityLab />} />
          {/* Legacy URLs → canonical labs (bookmarks / old links) */}
          <Route path="/grammar" element={<Navigate to="/cfg" replace />} />
          <Route path="/proofs" element={<Navigate to="/proof-lab" replace />} />
          <Route path="/decidability" element={<Navigate to="/decidability-lab" replace />} />
          <Route path="/complexity" element={<ComplexityAnalyzer />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
          },
        }}
      />
    </div>
  )
}

export default App 