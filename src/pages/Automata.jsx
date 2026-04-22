import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, Cpu, Database, Server, Target, Zap, BookOpen, Lightbulb,
  Play, Square, RotateCcw, StepForward, ChevronLeft, Info, CheckCircle, 
  XCircle, AlertCircle, ArrowRight, Clock, Eye, EyeOff, Download, Upload,
  Settings, HelpCircle, Star, Users, Code, Globe, Award, TrendingUp
} from 'lucide-react'
import AutomataCanvas from '../components/automata/AutomataCanvas'
import CytoscapeCanvas from '../components/automata/CytoscapeCanvas'
import AutomataControls from '../components/automata/AutomataControls'
import SimulationPanel from '../components/automata/SimulationPanel'
import AutomataInfo from '../components/automata/AutomataInfo'
import useGSAP from '../hooks/useGSAP'

const Automata = () => {
  const [activeTab, setActiveTab] = useState('visualizer')
  const [automataType, setAutomataType] = useState('dfa')
  const [data, setData] = useState({
    states: [],
    transitions: [],
    startState: '',
    acceptStates: [],
    alphabet: []
  })
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentInput, setCurrentInput] = useState('')
  const [simulationSteps, setSimulationSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [visualizationEngine, setVisualizationEngine] = useState('reactflow') // 'reactflow' or 'cytoscape'

  const { elementRef, animateIn, staggerIn } = useGSAP()

  useEffect(() => {
    animateIn('fadeIn', 0.2)
    setTimeout(() => {
      staggerIn('.automata-item', 0.1, 0.3)
    }, 200)
  }, [animateIn, staggerIn])

  const loadSampleAutomaton = () => {
    const sampleData = {
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
      alphabet: ['0', '1']
    }
    setData(sampleData)
  }

  const exportAutomata = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `automata-${automataType}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importAutomata = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          setData(importedData)
        } catch (error) {
          console.error('Error importing automata:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const convertRegexToAutomata = (regex) => {
    // Simple regex to automata conversion (Thompson construction)
    switch (regex) {
      case '0*1*':
        return {
          states: [
            { id: 'q0', label: 'q0', x: 100, y: 200 },
            { id: 'q1', label: 'q1', x: 300, y: 200 },
            { id: 'q2', label: 'q2', x: 500, y: 200 }
          ],
          transitions: [
            { from: 'q0', to: 'q0', symbol: '0' },
            { from: 'q0', to: 'q1', symbol: '1' },
            { from: 'q1', to: 'q1', symbol: '1' }
          ],
          startState: 'q0',
          acceptStates: ['q1'],
          alphabet: ['0', '1']
        }
      case '(0|1)*00(0|1)*':
        return {
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
            { from: 'q2', to: 'q2', symbol: '1' }
          ],
          startState: 'q0',
          acceptStates: ['q2'],
          alphabet: ['0', '1']
        }
      default:
        return data
    }
  }

  const convertCFGToPDA = (cfg) => {
    // Simple CFG to PDA conversion
    switch (cfg) {
      case 'S → aSb | ε':
        return {
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
          alphabet: ['a', 'b']
        }
      default:
        return data
    }
  }

  const tabs = [
    { id: 'visualizer', name: 'Visualizer', icon: Brain },
    { id: 'simulation', name: 'Simulation', icon: Play },
    { id: 'controls', name: 'Controls', icon: Settings },
    { id: 'info', name: 'Info', icon: Info }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted" ref={elementRef}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="automata-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#automata-grid)"/>
        </svg>
      </div>

      {/* Background Image Placeholder */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, hsl(0, 84%, 60%, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 30%, hsl(0, 72%, 51%, 0.05) 0%, transparent 50%)`
          }}
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div 
          className="automata-item mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Automata Visualizer</h1>
              <p className="text-muted-foreground">Interactive visualization for DFA, NFA, PDA, and Turing Machines</p>
            </div>
          </div>

          {/* Visualization Engine Selector */}
          <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Visualization Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  visualizationEngine === 'reactflow' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setVisualizationEngine('reactflow')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">React Flow</h4>
                    <p className="text-sm text-muted-foreground">Professional graph visualization with advanced interactions</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  visualizationEngine === 'cytoscape' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setVisualizationEngine('cytoscape')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Cytoscape.js</h4>
                    <p className="text-sm text-muted-foreground">Advanced graph analysis with multiple layout algorithms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="automata-item mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'visualizer' && (
            <motion.div 
              className="automata-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Automata Canvas</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={loadSampleAutomaton}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Load Sample
                    </button>
                    <button
                      onClick={exportAutomata}
                      className="px-3 py-1 text-xs bg-accent text-foreground rounded-md hover:bg-accent/80 transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </button>
                    <label className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors cursor-pointer">
                      <Upload className="w-3 h-3 mr-1" />
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importAutomata}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <div className="h-96 border border-border rounded-lg overflow-hidden">
                  {visualizationEngine === 'reactflow' ? (
                    <AutomataCanvas
                      automataType={automataType}
                      data={data}
                      onDataChange={setData}
                      isSimulating={isSimulating}
                    />
                  ) : (
                    <CytoscapeCanvas
                      automataType={automataType}
                      data={data}
                      onDataChange={setData}
                      isSimulating={isSimulating}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulation' && (
            <motion.div 
              className="automata-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <SimulationPanel
                data={data}
                currentInput={currentInput}
                setCurrentInput={setCurrentInput}
                isSimulating={isSimulating}
                setIsSimulating={setIsSimulating}
                simulationSteps={simulationSteps}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />
            </motion.div>
          )}

          {activeTab === 'controls' && (
            <motion.div 
              className="automata-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AutomataControls
                data={data}
                onDataChange={setData}
                automataType={automataType}
                setAutomataType={setAutomataType}
              />
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div 
              className="automata-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AutomataInfo automataType={automataType} />
            </motion.div>
          )}
        </div>

        {/* Conversion Tools */}
        <motion.div 
          className="automata-item mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regex to Automata */}
            <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Regex to Automata</h3>
                  <p className="text-sm text-muted-foreground">Convert regular expressions to automata</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setData(convertRegexToAutomata('0*1*'))}
                  className="w-full px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent transition-colors text-left"
                >
                  <div className="font-medium">0*1*</div>
                  <div className="text-xs text-muted-foreground">Zero or more 0s followed by zero or more 1s</div>
                </button>
                
                <button
                  onClick={() => setData(convertRegexToAutomata('(0|1)*00(0|1)*'))}
                  className="w-full px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent transition-colors text-left"
                >
                  <div className="font-medium">(0|1)*00(0|1)*</div>
                  <div className="text-xs text-muted-foreground">Strings containing "00" as substring</div>
                </button>
              </div>
            </div>

            {/* CFG to PDA */}
            <div className="bg-background/50 backdrop-blur-sm border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">CFG to PDA</h3>
                  <p className="text-sm text-muted-foreground">Convert context-free grammars to pushdown automata</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setData(convertCFGToPDA('S → aSb | ε'))}
                  className="w-full px-4 py-2 bg-muted text-foreground rounded-md hover:bg-accent transition-colors text-left"
                >
                  <div className="font-medium">S → aSb | ε</div>
                  <div className="text-xs text-muted-foreground">Language of balanced parentheses (a^n b^n)</div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Automata 