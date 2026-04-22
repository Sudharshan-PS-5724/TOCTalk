import React, { useRef, useEffect, useState, useCallback } from 'react'
import cytoscape from 'cytoscape'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Play, Square, RotateCcw, Lightbulb, BookOpen, Zap, Target, 
  HelpCircle, Download, Upload, Settings, Brain, Cpu, Database, Server, 
  ChevronRight, ChevronDown, Info, Star, Eye, EyeOff, MousePointer, 
  ArrowRight, CheckCircle, XCircle, Grid, Layers, Maximize2, Minimize2,
  Layout, Network
} from 'lucide-react'

const CytoscapeCanvas = ({ automataType, data, onDataChange, isSimulating }) => {
  const cyRef = useRef(null)
  const containerRef = useRef(null)
  const [cy, setCy] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [playgroundMode, setPlaygroundMode] = useState('learn')
  const [showExamples, setShowExamples] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [layoutType, setLayoutType] = useState('grid')
  const [isDrawing, setIsDrawing] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState(null)

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return

    const cyInstance = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'hsl(0, 0%, 6%)',
            'border-color': 'hsl(355, 90%, 48%)',
            'border-width': '2px',
            'color': 'hsl(355, 95%, 55%)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 'bold',
            'width': '44px',
            'height': '44px',
            'shape': 'ellipse',
          }
        },
        {
          selector: 'node.start',
          style: {
            'background-color': 'hsl(195, 100%, 8%)',
            'color': 'hsl(186, 100%, 52%)',
            'border-color': 'hsl(186, 100%, 48%)',
            'border-width': '3px',
            'shape': 'ellipse',
            'width': '44px',
            'height': '44px',
          }
        },
        {
          selector: 'node.accept',
          style: {
            'background-color': 'hsl(355, 85%, 42%)',
            'color': 'hsl(0, 10%, 98%)',
            'border-color': 'hsl(355, 100%, 58%)',
            'border-width': '4px',
            'shape': 'ellipse',
          }
        },
        {
          selector: 'node.current',
          style: {
            'background-color': 'hsl(355, 95%, 48%)',
            'color': 'hsl(0, 10%, 98%)',
            'border-color': 'hsl(186, 100%, 55%)',
            'border-width': '3px',
            'border-opacity': '1',
            'shape': 'ellipse',
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'background-color': 'hsl(355, 95%, 48%)',
            'color': 'hsl(0, 10%, 98%)',
            'border-color': 'hsl(355, 100%, 58%)',
            'border-width': '3px',
            'width': '46px',
            'height': '46px',
            'shape': 'ellipse',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': '2px',
            'line-color': 'hsl(186, 85%, 48%)',
            'target-arrow-color': 'hsl(186, 85%, 48%)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'text-rotation': 'autorotate',
            'text-margin-y': '-10px',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-background-color': 'hsl(0, 0%, 8%)',
            'text-background-opacity': '0.8',
            'text-background-padding': '2px'
          }
        },
        {
          selector: 'edge.animated',
          style: {
            'line-color': 'hsl(355, 100%, 55%)',
            'target-arrow-color': 'hsl(355, 100%, 55%)',
            'width': '3px'
          }
        }
      ],
      layout: {
        name: 'grid',
        rows: 3,
        cols: 3,
        padding: 50
      }
    })

    setCy(cyInstance)

    return () => {
      cyInstance.destroy()
    }
  }, [])

  // Update graph when data changes
  useEffect(() => {
    if (!cy) return

    // Clear existing elements
    cy.elements().remove()

    // Add nodes
    const nodes = data.states.map(state => ({
      group: 'nodes',
      data: {
        id: state.id,
        label: state.label,
        x: state.x,
        y: state.y
      },
      classes: [
        state.id === data.startState ? 'start' : '',
        data.acceptStates.includes(state.id) ? 'accept' : '',
        isSimulating && selectedState === state.id ? 'current' : '',
        highlightedElement === state.id ? 'highlighted' : ''
      ].filter(Boolean).join(' ')
    }))

    // Add edges
    const edges = data.transitions.map((transition, index) => ({
      group: 'edges',
      data: {
        id: `e${index}`,
        source: transition.from,
        target: transition.to,
        label: transition.symbol
      },
      classes: isSimulating && selectedState === transition.from ? 'animated' : ''
    }))

    cy.add([...nodes, ...edges])

    // Apply layout
    const layout = cy.layout({
      name: layoutType,
      padding: 50,
      animate: true,
      animationDuration: 500
    })
    layout.run()

  }, [cy, data, isSimulating, selectedState, highlightedElement, layoutType])

  // Event handlers
  useEffect(() => {
    if (!cy) return

    const handleNodeClick = (event) => {
      const node = event.target
      if (playgroundMode === 'learn') {
        setHighlightedElement(node.id())
        setTimeout(() => setHighlightedElement(null), 2000)
      }
      setSelectedState(node.id())
    }

    const handleTap = (event) => {
      if (isDrawing && playgroundMode === 'build' && event.target === cy) {
        const position = event.position
        const newState = {
          id: `q${data.states.length}`,
          label: `q${data.states.length}`,
          x: position.x,
          y: position.y
        }
        onDataChange({
          ...data,
          states: [...data.states, newState]
        })
      }
    }

    cy.on('tap', 'node', handleNodeClick)
    cy.on('tap', handleTap)

    return () => {
      cy.removeListener('tap', 'node', handleNodeClick)
      cy.removeListener('tap', handleTap)
    }
  }, [cy, playgroundMode, isDrawing, data, onDataChange])

  const loadExample = (exampleType) => {
    const examples = {
      dfa: {
        states: [
          { id: 'q0', label: 'q0', x: 100, y: 200 },
          { id: 'q1', label: 'q1', x: 300, y: 200 },
          { id: 'q2', label: 'q2', x: 500, y: 200 }
        ],
        transitions: [
          { from: 'q0', to: 'q1', symbol: '0' },
          { from: 'q0', to: 'q0', symbol: '1' },
          { from: 'q1', to: 'q2', symbol: '0' },
          { from: 'q1', to: 'q0', symbol: '1' },
          { from: 'q2', to: 'q2', symbol: '0' },
          { from: 'q2', to: 'q0', symbol: '1' }
        ],
        startState: 'q0',
        acceptStates: ['q2'],
        alphabet: ['0', '1'],
        description: 'DFA that accepts strings ending with "00"'
      },
      nfa: {
        states: [
          { id: 'q0', label: 'q0', x: 100, y: 200 },
          { id: 'q1', label: 'q1', x: 300, y: 150 },
          { id: 'q2', label: 'q2', x: 300, y: 250 },
          { id: 'q3', label: 'q3', x: 500, y: 200 }
        ],
        transitions: [
          { from: 'q0', to: 'q1', symbol: '0' },
          { from: 'q0', to: 'q2', symbol: '0' },
          { from: 'q1', to: 'q3', symbol: '1' },
          { from: 'q2', to: 'q3', symbol: '1' },
          { from: 'q3', to: 'q3', symbol: '0' },
          { from: 'q3', to: 'q3', symbol: '1' }
        ],
        startState: 'q0',
        acceptStates: ['q3'],
        alphabet: ['0', '1'],
        description: 'NFA that accepts strings starting with "0" and ending with "1"'
      },
      enfa: {
        states: [
          { id: 'q0', label: 'q0', x: 100, y: 200 },
          { id: 'q1', label: 'q1', x: 300, y: 200 },
          { id: 'q2', label: 'q2', x: 500, y: 200 }
        ],
        transitions: [
          { from: 'q0', to: 'q1', symbol: 'ε' },
          { from: 'q1', to: 'q2', symbol: 'a' },
          { from: 'q2', to: 'q2', symbol: 'b' }
        ],
        startState: 'q0',
        acceptStates: ['q2'],
        alphabet: ['a', 'b', 'ε'],
        description: 'ε-NFA that accepts strings starting with "a" followed by any number of "b"s'
      },
      pda: {
        states: [
          { id: 'q0', label: 'q0', x: 100, y: 200 },
          { id: 'q1', label: 'q1', x: 300, y: 200 },
          { id: 'q2', label: 'q2', x: 500, y: 200 }
        ],
        transitions: [
          { from: 'q0', to: 'q1', symbol: 'ε,ε→Z', stackOp: 'push Z' },
          { from: 'q1', to: 'q1', symbol: 'a,ε→A', stackOp: 'push A' },
          { from: 'q1', to: 'q2', symbol: 'b,A→ε', stackOp: 'pop A' },
          { from: 'q2', to: 'q2', symbol: 'b,A→ε', stackOp: 'pop A' }
        ],
        startState: 'q0',
        acceptStates: ['q2'],
        alphabet: ['a', 'b'],
        description: 'PDA that accepts a^n b^n (equal number of a\'s and b\'s)'
      },
      tm: {
        states: [
          { id: 'q0', label: 'q0', x: 100, y: 200 },
          { id: 'q1', label: 'q1', x: 300, y: 200 },
          { id: 'q2', label: 'q2', x: 500, y: 200 },
          { id: 'q3', label: 'q3', x: 700, y: 200 }
        ],
        transitions: [
          { from: 'q0', to: 'q1', symbol: '0→0,R', tapeOp: 'read 0, write 0, move right' },
          { from: 'q1', to: 'q1', symbol: '0→0,R', tapeOp: 'read 0, write 0, move right' },
          { from: 'q1', to: 'q2', symbol: '1→1,R', tapeOp: 'read 1, write 1, move right' },
          { from: 'q2', to: 'q2', symbol: '1→1,R', tapeOp: 'read 1, write 1, move right' },
          { from: 'q2', to: 'q3', symbol: '□→□,L', tapeOp: 'read blank, write blank, move left' }
        ],
        startState: 'q0',
        acceptStates: ['q3'],
        alphabet: ['0', '1'],
        description: 'Turing Machine that accepts strings with at least one "1"'
      }
    }

    const example = examples[exampleType]
    if (example) {
      onDataChange(example)
      setShowExamples(false)
    }
  }

  const changeLayout = (newLayout) => {
    setLayoutType(newLayout)
    if (cy) {
      const layout = cy.layout({
        name: newLayout,
        padding: 50,
        animate: true,
        animationDuration: 500
      })
      layout.run()
    }
  }

  const renderPlaygroundControls = () => (
    <div className="absolute top-4 left-4 z-20">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">
            {['learn', 'build', 'simulate'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPlaygroundMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  playgroundMode === mode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className={`p-2 rounded-md transition-colors ${
              showTutorial ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Show Tutorial"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowExamples(!showExamples)}
            className={`p-2 rounded-md transition-colors ${
              showExamples ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Load Examples"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-md transition-colors ${
              showGrid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-md transition-colors ${
              showLabels ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Labels"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => changeLayout(layoutType === 'grid' ? 'circle' : 'grid')}
            className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Change Layout"
          >
            <Layout className="w-4 h-4" />
          </button>

          {playgroundMode === 'build' && (
            <button
              onClick={() => setIsDrawing(!isDrawing)}
              className={`p-2 rounded-md transition-colors ${
                isDrawing ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Add States"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderExamples = () => {
    if (!showExamples) return null

    const examples = [
      { id: 'dfa', name: 'DFA', description: 'Deterministic Finite Automaton', icon: Brain },
      { id: 'nfa', name: 'NFA', description: 'Nondeterministic Finite Automaton', icon: Cpu },
      { id: 'enfa', name: 'ε-NFA', description: 'NFA with ε-transitions', icon: Database },
      { id: 'pda', name: 'PDA', description: 'Pushdown Automaton', icon: Server },
      { id: 'tm', name: 'TM', description: 'Turing Machine', icon: Target }
    ]

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-20 left-4 z-20 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Load Examples</h3>
          <button
            onClick={() => setShowExamples(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {examples.map((example) => {
            const Icon = example.icon
            return (
              <button
                key={example.id}
                onClick={() => loadExample(example.id)}
                className="w-full flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors text-left"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{example.name}</div>
                  <div className="text-xs text-muted-foreground">{example.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  const renderTutorial = () => {
    if (!showTutorial) return null

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="absolute top-20 right-4 z-20 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Cytoscape.js Features</h3>
          <button
            onClick={() => setShowTutorial(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Network className="w-3 h-3 text-primary" />
            <span>Advanced graph analysis and layout</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layout className="w-3 h-3 text-primary" />
            <span>Multiple layout algorithms</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-3 h-3 text-primary" />
            <span>Professional graph visualization</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-3 h-3 text-primary" />
            <span>High-performance rendering</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gradient-to-br from-background to-muted"
        style={{ minHeight: '500px' }}
      />
      
      {renderPlaygroundControls()}
      {renderTutorial()}
      {renderExamples()}

      {/* Empty State */}
      {data.states.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium mb-2">Start Building Your Automaton</p>
            <p className="text-sm mb-4">Switch to Build mode and click on the canvas to add states</p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary/10 rounded-full"></div>
                <span>Regular State</span>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full border border-[hsl(186,100%,50%)] bg-[hsl(195,100%,8%)]"
                  style={{ boxShadow: '0 0 0 1px hsl(186 100% 50% / 0.5)' }}
                />
                <span>Start State</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-primary/10 rounded-full border-2 border-current"></div>
                <span>Accept State</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Mode Overlay */}
      {playgroundMode === 'learn' && data.states.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-foreground">Click on states to highlight them</span>
          </div>
        </div>
      )}

      {/* Drawing Mode Indicator */}
      {isDrawing && playgroundMode === 'build' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Click on the canvas to add states</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CytoscapeCanvas 