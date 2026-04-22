import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Panel,
  Handle,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Play, Square, RotateCcw, Lightbulb, BookOpen, Zap, Target, 
  HelpCircle, Download, Upload, Settings, Brain, Cpu, Database, Server, 
  ChevronRight, ChevronDown, Info, Star, Eye, EyeOff, MousePointer, 
  ArrowRight, CheckCircle, XCircle, Grid, Layers, Maximize2, Minimize2 
} from 'lucide-react'

// Custom Node Components
const StateNode = ({ data, selected, id }) => {
  const isStart = data.isStart
  const isAccept = data.isAccept
  const isCurrent = data.isCurrent
  const isHighlighted = data.isHighlighted

  const getNodeStyle = () => {
    let style = {
      padding: '8px 12px',
      borderRadius: '50%',
      border: '2px solid',
      fontSize: '12px',
      fontWeight: 'bold',
      minWidth: '40px',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      position: 'relative',
      cursor: 'pointer',
      userSelect: 'none'
    }

    if (isStart) {
      // All states are circles; start = cyan outer ring (cyberpunk), dark fill
      style = {
        ...style,
        backgroundColor: 'hsl(195, 100%, 8%)',
        color: 'hsl(186, 100%, 52%)',
        borderColor: 'hsl(186, 100%, 48%)',
        borderRadius: '50%',
        minWidth: '44px',
        minHeight: '44px',
        width: '44px',
        height: '44px',
        boxShadow:
          '0 0 0 3px hsl(186 100% 48% / 0.95), 0 0 20px hsl(186 100% 50% / 0.35), inset 0 0 12px hsl(0 100% 45% / 0.15)',
      }
    } else if (isAccept) {
      // Accepting: filled circle + double-ring look (same circle geometry as all states)
      style = {
        ...style,
        backgroundColor: 'hsl(355, 85%, 42%)',
        color: 'hsl(0, 10%, 98%)',
        borderColor: 'hsl(355, 100%, 58%)',
        borderRadius: '50%',
        minWidth: '44px',
        minHeight: '44px',
        width: '44px',
        height: '44px',
        boxShadow:
          '0 0 0 3px hsl(355 100% 52%), 0 0 0 6px hsl(0 0% 4%), 0 0 24px hsl(355 100% 50% / 0.45)',
      }
    } else {
      style = {
        ...style,
        backgroundColor: 'hsl(0, 0%, 6%)',
        color: 'hsl(355, 95%, 55%)',
        borderColor: 'hsl(355, 90%, 48%)',
        borderRadius: '50%',
        minWidth: '44px',
        minHeight: '44px',
        width: '44px',
        height: '44px',
        boxShadow: '0 0 12px hsla(355, 100%, 45%, 0.25), inset 0 0 8px hsl(0 0% 0% / 0.5)',
      }
    }

    if (isCurrent) {
      style = {
        ...style,
        backgroundColor: 'hsl(355, 95%, 48%)',
        color: 'hsl(0, 10%, 98%)',
        borderColor: 'hsl(186, 100%, 55%)',
        boxShadow:
          '0 0 0 2px hsl(186 100% 50% / 0.9), 0 0 28px hsl(355 100% 50% / 0.75), 0 0 40px hsl(186 100% 50% / 0.35)',
        transform: 'scale(1.08)',
        zIndex: 10,
      }
    }

    if (isHighlighted) {
      style = {
        ...style,
        transform: 'scale(1.05)',
        boxShadow:
          '0 0 20px hsl(355 100% 50% / 0.55), 0 0 30px hsl(186 100% 50% / 0.25)',
        zIndex: 5,
      }
    }

    if (selected) {
      style = {
        ...style,
        boxShadow:
          '0 0 0 3px hsl(186 100% 50%), 0 0 24px hsl(355 100% 50% / 0.5)',
        transform: 'scale(1.03)',
      }
    }

    return style
  }

  return (
    <div style={getNodeStyle()} className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-[hsl(186,100%,55%)] !bg-[hsl(0,0%,8%)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-[hsl(186,100%,55%)] !bg-[hsl(0,0%,8%)]"
      />
      {data.label}
      
      {/* Current state animation */}
      {isCurrent && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-[hsl(186,100%,55%)]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Highlighted state animation */}
      {isHighlighted && (
        <motion.div
          className="absolute -inset-2 border-2 border-primary rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Start state indicator */}
      {isStart && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
      
      {/* Accept state indicator */}
      {isAccept && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  )
}

const AutomataCanvas = ({ automataType, data, onDataChange, isSimulating }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showGrid, setShowGrid] = useState(true)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [playgroundMode, setPlaygroundMode] = useState('learn')
  const [showExamples, setShowExamples] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const reactFlowWrapper = useRef(null)

  // Convert automata data to React Flow format
  const convertToReactFlowData = useCallback(() => {
    if (!data.states || data.states.length === 0) {
      return { nodes: [], edges: [] }
    }

    // Calculate better positions for nodes if not already set
    const flowNodes = data.states.map((state, index) => {
      let x = state.x
      let y = state.y
      
      // If positions are not set, calculate them in a circle layout
      if (x === undefined || y === undefined) {
        const radius = 200
        const angle = (index * 2 * Math.PI) / data.states.length
        x = 400 + radius * Math.cos(angle)
        y = 300 + radius * Math.sin(angle)
      }

      return {
        id: state.id,
        type: 'stateNode',
        position: { x, y },
        data: {
          label: state.label,
          isStart: state.id === data.startState,
          isAccept: data.acceptStates && data.acceptStates.includes(state.id),
          isCurrent: isSimulating && selectedState === state.id,
          isHighlighted: highlightedElement === state.id
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      }
    })

    // Group transitions by source-target pairs to avoid overlapping edges
    const transitionGroups = new Map()
    
    ;(data.transitions || []).forEach((transition, index) => {
      const sourceNode = data.states.find(s => s.id === transition.from)
      const targetNode = data.states.find(s => s.id === transition.to)
      
      if (!sourceNode || !targetNode) {
        console.warn(`Invalid transition: ${transition.from} -> ${transition.to}`)
        return
      }

      const key = `${transition.from}-${transition.to}`
      if (!transitionGroups.has(key)) {
        transitionGroups.set(key, [])
      }
      transitionGroups.get(key).push(transition)
    })

    const flowEdges = []
    let edgeIndex = 0

    transitionGroups.forEach((transitions) => {
      const first = transitions[0]
      const source = first.from
      const target = first.to
      const isSelfLoop = source === target
      
      // Combine symbols for multiple transitions between same states
      const symbols = transitions.map(t => t.symbol).join(', ')
      
      flowEdges.push({
        id: `e${edgeIndex}`,
        source,
        target,
        label: symbols,
        type: isSelfLoop ? 'smoothstep' : 'default',
        animated: isSimulating && selectedState === source,
        style: {
          // High-contrast on dark canvas (gray was nearly invisible)
          stroke: 'hsl(186, 100%, 55%)',
          strokeWidth: 2.5,
          strokeDasharray: isSimulating && selectedState === source ? '5,5' : undefined,
        },
        labelStyle: {
          fill: 'hsl(120, 8%, 96%)',
          fontSize: 11,
          fontWeight: 'bold',
        },
        labelBgStyle: {
          fill: 'hsl(0, 0%, 10%)',
          fillOpacity: 0.92,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 22,
          height: 22,
          color: 'hsl(186, 100%, 55%)',
        },
      })
      edgeIndex++
    })

    return { nodes: flowNodes, edges: flowEdges }
  }, [data, isSimulating, selectedState, highlightedElement])

  // Update React Flow data when automata data changes
  useEffect(() => {
    const { nodes: flowNodes, edges: flowEdges } = convertToReactFlowData()
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [convertToReactFlowData, setNodes, setEdges])

  const onConnect = useCallback((params) => {
    const newTransition = {
      from: params.source,
      to: params.target,
      symbol: 'ε'
    }
    
    onDataChange({
      ...data,
      transitions: [...(data.transitions || []), newTransition]
    })
  }, [data, onDataChange])

  const onNodeDragStop = useCallback((event, node) => {
    const updatedStates = data.states.map(state => 
      state.id === node.id 
        ? { ...state, x: node.position.x, y: node.position.y }
        : state
    )
    
    onDataChange({
      ...data,
      states: updatedStates
    })
  }, [data, onDataChange])

  const onNodeClick = useCallback((event, node) => {
    if (playgroundMode === 'learn') {
      setHighlightedElement(node.id)
      setTimeout(() => setHighlightedElement(null), 2000)
    }
    setSelectedState(node.id)
  }, [playgroundMode])

  const onPaneClick = useCallback((event) => {
    if (isDrawing && playgroundMode === 'build' && reactFlowInstance) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      })

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
  }, [isDrawing, playgroundMode, data, onDataChange, reactFlowInstance])

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

  const tutorialSteps = [
    {
      title: "Welcome to Advanced Automata Visualizer!",
      content: "This professional-grade tool uses React Flow for superior visualization and interaction.",
      highlight: null
    },
    {
      title: "Interactive Canvas",
      content: "Drag nodes to reposition, zoom and pan freely, and use the minimap for navigation.",
      highlight: 'canvas'
    },
    {
      title: "State Management",
      content: "Click states to highlight them, use the controls panel for building and simulation.",
      highlight: 'states'
    },
    {
      title: "Professional Features",
      content: "Export/import automata, use grid snapping, and access comprehensive examples.",
      highlight: 'features'
    }
  ]

  const renderPlaygroundControls = () => (
    <Panel position="top-left" className="z-10">
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
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={`p-2 rounded-md transition-colors ${
              showMiniMap ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle MiniMap"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-md transition-colors ${
              showControls ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Controls"
          >
            <Settings className="w-4 h-4" />
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
    </Panel>
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
      <Panel position="top-left" className="z-20 mt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-sm"
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
      </Panel>
    )
  }

  const renderTutorial = () => {
    if (!showTutorial) return null

    const currentStep = tutorialSteps[tutorialStep]

    return (
      <Panel position="top-right" className="z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tutorial</h3>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2">{currentStep.title}</h4>
            <p className="text-xs text-muted-foreground">{currentStep.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === tutorialStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                disabled={tutorialStep === 0}
                className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <button
                onClick={() => setTutorialStep(Math.min(tutorialSteps.length - 1, tutorialStep + 1))}
                disabled={tutorialStep === tutorialSteps.length - 1}
                className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        </motion.div>
      </Panel>
    )
  }

  const nodeTypes = useMemo(() => ({
    stateNode: StateNode
  }), [])

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="bottom-left"
        className="bg-[radial-gradient(ellipse_at_50%_0%,hsl(355_60%_12%/0.35)_0%,transparent_55%),linear-gradient(165deg,hsl(0_0%_6%)_0%,hsl(195_40%_5%)_100%)]"
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { stroke: 'hsl(186, 85%, 48%)', strokeWidth: 2 },
        }}
        connectionMode="loose"
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        preventScrolling={true}
        zoomOnDoubleClick={false}
        nodesDraggable={true}
        nodesConnectable={playgroundMode === 'build'}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        {showGrid && (
          <Background
            variant="dots"
            color="hsl(355 70% 45% / 0.22)"
            gap={22}
            size={1.15}
          />
        )}
        {showControls && (
          <Controls 
            className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        )}
        {showMiniMap && (
          <MiniMap
            className="rounded-lg border border-border bg-background/95 shadow-lg backdrop-blur-sm"
            nodeColor="hsl(355, 85%, 48%)"
            maskColor="hsla(0, 0%, 0%, 0.45)"
          />
        )}
        
        {renderPlaygroundControls()}
        {renderTutorial()}
        {renderExamples()}

        {/* Empty State */}
        {data.states.length === 0 && (
          <Panel position="center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-muted-foreground bg-background/95 backdrop-blur-sm border border-border rounded-lg p-8 shadow-lg"
            >
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">Start Building Your Automaton</h3>
              <p className="text-sm mb-6">Switch to Build mode and click on the canvas to add states</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-4 h-4 bg-primary/10 rounded-full border border-primary"></div>
                  <span>Regular State</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div
                    className="h-4 w-4 rounded-full border border-[hsl(186,100%,50%)] bg-[hsl(195,100%,8%)]"
                    style={{ boxShadow: '0 0 0 1px hsl(186 100% 50% / 0.5)' }}
                  />
                  <span>Start State</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-4 h-4 bg-primary/10 rounded-full border-2 border-current"></div>
                  <span>Accept State</span>
                </div>
              </div>
            </motion.div>
          </Panel>
        )}

        {/* Learning Mode Overlay */}
        {playgroundMode === 'learn' && data.states.length > 0 && (
          <Panel position="bottom-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center space-x-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-foreground">Click on states to highlight them</span>
              </div>
            </motion.div>
          </Panel>
        )}

        {/* Drawing Mode Indicator */}
        {isDrawing && playgroundMode === 'build' && (
          <Panel position="bottom-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Click on the canvas to add states</span>
              </div>
            </motion.div>
          </Panel>
        )}

        {/* Simulation Mode Indicator */}
        {isSimulating && (
          <Panel position="top-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent text-foreground px-4 py-2 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Simulation Active</span>
              </div>
            </motion.div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

export default AutomataCanvas 