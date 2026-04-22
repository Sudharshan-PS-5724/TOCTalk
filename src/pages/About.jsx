import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Info,
  Brain,
  Calculator,
  Lightbulb,
  HelpCircle,
  Target,
  Github,
  ExternalLink,
  Heart,
  Star,
  Zap,
  Users,
  Code,
  Book,
  Award,
  Regex,
  Braces,
  Film,
  Sigma,
  Gauge,
  ScrollText,
} from 'lucide-react'
import useGSAP from '../hooks/useGSAP'

const About = () => {
  const { elementRef, animateIn, staggerIn } = useGSAP()

  const features = [
    {
      icon: Calculator,
      title: "Automata Simulator",
      description: "Interactive DFA, NFA, PDA, and Turing Machine simulators with step-by-step execution"
    },
    {
      icon: Braces,
      title: 'CFG Chilling',
      description:
        'Strict CFG parser, CNF/GNF pipelines, PDA construction, stack simulation, regular → DFA when applicable',
    },
    {
      icon: Lightbulb,
      title: 'Proof Lab',
      description:
        'Parameterized templates: pumping lemmas, Myhill–Nerode, closure, ambiguity, equivalence, reductions',
    },
    {
      icon: HelpCircle,
      title: 'Decidability & complexity',
      description:
        'Catalog-backed Decidability Lab (HALT, Rice) and Complexity Analyzer (P, NP, NPC, reduction chains)',
    },
    {
      icon: Target,
      title: "Interactive Quiz",
      description: "Practice exercises with instant feedback and detailed explanations"
    },
    {
      icon: Zap,
      title: "Real-time Visualization",
      description: "Beautiful animations and visual representations of complex concepts"
    }
  ]

  const technologies = [
    { name: "React 18", description: "Modern UI framework" },
    { name: "Vite", description: "Fast build tool" },
    { name: "TailwindCSS", description: "Utility-first CSS" },
    { name: "Framer Motion", description: "Smooth animations" },
    { name: "GSAP", description: "Advanced animations" },
    { name: "Lucide React", description: "Beautiful icons" }
  ]

  const team = [
    {
      name: "TOCTALK Team",
      role: "Theory of Computation Learning Platform",
      description: "Dedicated to making complex computational theory concepts accessible and engaging"
    }
  ]

  useEffect(() => {
    animateIn('fadeIn', 0.2)
    setTimeout(() => {
      staggerIn('.feature-item', 0.1, 0.3)
    }, 200)
  }, [animateIn, staggerIn])

  return (
    <div className="max-w-7xl mx-auto" ref={elementRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">About TOCTALK</h1>
        <p className="text-muted-foreground">Interactive learning platform for Theory of Computation & Compiler Design</p>
      </div>

      {/* Hero Section */}
      <div className="card mb-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Theory of Computation Made Simple</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TOCTALK is an interactive learning platform designed to make complex concepts in Theory of Computation 
            accessible, engaging, and intuitive. From finite automata to Turing machines, from regular expressions 
            to context-free grammars, we provide hands-on tools for understanding computational theory.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="feature-item card hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mission & Vision - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Our Mission</h3>
            <p className="text-muted-foreground mb-4">
              To democratize access to complex computational theory concepts by providing intuitive, 
              interactive tools that make learning engaging and effective. We believe that understanding 
              the theoretical foundations of computation is crucial for every computer scientist.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">Students & Educators</span>
              </div>
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm">Researchers & Developers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Book className="w-4 h-4 text-primary" />
                <span className="text-sm">Self-learners</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm">Competitive Programmers</span>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Technology Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-medium text-sm text-foreground">{tech.name}</div>
                  <div className="text-xs text-muted-foreground">{tech.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Future Roadmap</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-sm">Phase 1: Core Features</div>
                  <div className="text-xs text-muted-foreground">Basic automata and grammar tools</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-sm">Phase 2: Advanced Features</div>
                  <div className="text-xs text-muted-foreground">
                    Proof Lab, Complexity Analyzer, Decidability Lab, TM presets — live
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-sm">Phase 3: Collaboration</div>
                  <div className="text-xs text-muted-foreground">Real-time collaboration and sharing</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Takes 1 column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Team */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Team</h3>
            <div className="space-y-4">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-foreground">{member.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Platform Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Automata Types:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span>Proof Examples:</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span>Quiz Categories:</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between">
                <span>Interactive labs:</span>
                <span className="font-medium">9</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              <Link to="/regex" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Regex className="h-4 w-4 shrink-0" />
                <span className="text-sm">Regex Lab</span>
              </Link>
              <Link to="/cfg" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Braces className="h-4 w-4 shrink-0" />
                <span className="text-sm">CFG Chilling</span>
              </Link>
              <Link to="/tm" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Film className="h-4 w-4 shrink-0" />
                <span className="text-sm">TM Test Site</span>
              </Link>
              <Link
                to="/decidability-lab"
                className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent"
              >
                <Sigma className="h-4 w-4 shrink-0" />
                <span className="text-sm">Decidability Lab</span>
              </Link>
              <Link to="/complexity" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Gauge className="h-4 w-4 shrink-0" />
                <span className="text-sm">Complexity</span>
              </Link>
              <Link to="/proof-lab" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <ScrollText className="h-4 w-4 shrink-0" />
                <span className="text-sm">Proof Lab</span>
              </Link>
              <Link to="/automata" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Calculator className="h-4 w-4 shrink-0" />
                <span className="text-sm">Automata Lab</span>
              </Link>
              <Link to="/quiz" className="flex items-center space-x-2 rounded p-2 transition-colors hover:bg-accent">
                <Target className="h-4 w-4 shrink-0" />
                <span className="text-sm">Quiz Rush</span>
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Get in Touch</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                <Github className="w-4 h-4 mr-1" /> GitHub
              </button>
              <button className="w-full btn-secondary text-sm">
                <ExternalLink className="w-4 h-4 mr-1" /> Documentation
              </button>
              <button className="w-full btn-secondary text-sm">
                <HelpCircle className="w-4 h-4 mr-1" /> Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Made with <Heart className="w-4 h-4 inline text-red-500" /> for the Theory of Computation community</p>
        <p className="mt-1">© 2024 TOCTALK. All rights reserved.</p>
      </div>
    </div>
  )
}

export default About 