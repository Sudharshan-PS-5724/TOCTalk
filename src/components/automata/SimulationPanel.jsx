import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Play, Square, RotateCcw, StepForward, ChevronLeft, Zap, Info, CheckCircle, XCircle, AlertCircle, ArrowRight, Clock, Target, Eye, EyeOff } from 'lucide-react'

const SimulationPanel = ({ data, currentInput, setCurrentInput, isSimulating, setIsSimulating, simulationSteps, currentStep, setCurrentStep }) => {
  const [isRunning, setIsRunning] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [inputValue, setInputValue] = useState(currentInput)

  // Debounced input update to prevent blinking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== currentInput) {
        setCurrentInput(inputValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, currentInput, setCurrentInput])

  // Sync input value when currentInput prop changes
  useEffect(() => {
    setInputValue(currentInput)
  }, [currentInput])

  const runSimulation = useCallback(() => {
    if (!inputValue.trim()) return

    const steps = []
    let currentStates = new Set([data.startState])
    let remainingInput = inputValue
    let stepNumber = 0

    while (remainingInput.length > 0) {
      const symbol = remainingInput[0]
      const nextStates = new Set()

      // Find all transitions for current states with current symbol
      for (const state of currentStates) {
        const transitions = data.transitions.filter(t => 
          t.from === state && t.symbol === symbol
        )
        transitions.forEach(t => nextStates.add(t.to))
      }

      steps.push({
        step: stepNumber + 1,
        symbol,
        currentStates: Array.from(currentStates),
        nextStates: Array.from(nextStates),
        remainingInput: remainingInput.slice(1),
        description: `Reading '${symbol}' from states ${Array.from(currentStates).join(', ')}`
      })

      currentStates = nextStates
      remainingInput = remainingInput.slice(1)
      stepNumber++
    }

    // Final step
    steps.push({
      step: stepNumber + 1,
      symbol: null,
      currentStates: Array.from(currentStates),
      nextStates: [],
      remainingInput: '',
      description: 'Input processing complete'
    })

    simulationSteps.current = steps
    setCurrentStep(0)
    setIsSimulating(true)
  }, [inputValue, data, simulationSteps, setCurrentStep, setIsSimulating])

  const onSimulate = useCallback(() => {
    if (isRunning) return
    setIsRunning(true)
    runSimulation()
    setIsRunning(false)
  }, [isRunning, runSimulation, setIsRunning])

  const stepForward = useCallback(() => {
    if (currentStep < simulationSteps.current.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, simulationSteps, setCurrentStep])

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])

  const autoRun = useCallback(() => {
    if (isRunning) return
    setIsRunning(true)
    runSimulation()
    
    let step = 0
    const interval = setInterval(() => {
      if (step < simulationSteps.current.length - 1) {
        setCurrentStep(step)
        step++
      } else {
        setCurrentStep(step)
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 1000)
  }, [isRunning, runSimulation, simulationSteps, setCurrentStep, setIsRunning])

  const resetSimulation = useCallback(() => {
    setCurrentStep(0)
    setIsSimulating(false)
    simulationSteps.current = []
  }, [setCurrentStep, setIsSimulating, simulationSteps])

  const getCurrentStepData = useMemo(() => {
    if (!isSimulating || !simulationSteps.current[currentStep]) return null
    return simulationSteps.current[currentStep]
  }, [isSimulating, simulationSteps, currentStep])

  const getProgressPercentage = useMemo(() => {
    if (!isSimulating || simulationSteps.current.length === 0) return 0
    return ((currentStep + 1) / simulationSteps.current.length) * 100
  }, [isSimulating, simulationSteps, currentStep])

  const getFinalResult = useMemo(() => {
    if (!isSimulating || simulationSteps.current.length === 0) return null
    
    const finalStep = simulationSteps.current[simulationSteps.current.length - 1]
    const finalStates = finalStep.currentStates
    
    // Check if any final state is an accept state
    const hasAcceptState = finalStates.some(state => data.acceptStates.includes(state))
    const hasStates = finalStates.length > 0
    
    if (!hasStates) {
      return {
        accepted: false,
        message: 'No valid transitions found',
        reason: 'The automaton could not process the input due to missing transitions'
      }
    }
    
    if (hasAcceptState) {
      return {
        accepted: true,
        message: 'Input accepted',
        reason: `Final states ${finalStates.join(', ')} include accept state(s)`
      }
    } else {
      return {
        accepted: false,
        message: 'Input rejected',
        reason: `Final states ${finalStates.join(', ')} do not include any accept state`
      }
    }
  }, [isSimulating, simulationSteps, data.acceptStates])

  const quickTestInputs = ['0', '1', '00', '01', '10', '11', '000', '001', '010', '011']

  return (
    <div className="bg-background border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Automata Simulation</h3>
            <p className="text-sm text-muted-foreground">Test your automaton with input strings</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`p-2 rounded-md transition-colors ${
            showHelp ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Help"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-accent/30 border border-border rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-foreground">Simulation Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full"></div>
                <span className="text-muted-foreground">Start State</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full"></div>
                <span className="text-muted-foreground">Accept State</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-full"></div>
                <span className="text-muted-foreground">Regular State</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Input Accepted</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-muted-foreground">Input Rejected</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-muted-foreground">No Valid Transitions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-foreground">Input String:</label>
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter input string (e.g., 001)"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Quick Test Inputs */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-2">Quick test:</span>
          {quickTestInputs.map((input) => (
            <button
              key={input}
              onClick={() => setInputValue(input)}
              className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground transition-colors"
            >
              {input}
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSimulate}
            disabled={isRunning || !inputValue.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Run Simulation</span>
          </button>
          
          <button
            onClick={autoRun}
            disabled={isRunning || !inputValue.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-accent text-foreground rounded-md hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Auto Run</span>
          </button>
          
          <button
            onClick={resetSimulation}
            disabled={!isSimulating}
            className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Result Display */}
      {getFinalResult && (
        <div className="bg-accent/30 border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            {getFinalResult.accepted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-semibold ${
              getFinalResult.accepted ? 'text-green-600' : 'text-red-600'
            }`}>
              {getFinalResult.message}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{getFinalResult.reason}</p>
        </div>
      )}

      {/* Progress Bar */}
      {isSimulating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">{Math.round(getProgressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Step Display */}
      {getCurrentStepData && (
        <div className="bg-accent/30 border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Step {getCurrentStepData.step}
            </span>
            {getCurrentStepData.symbol && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Symbol: {getCurrentStepData.symbol}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Input: </span>
              <span className="font-mono bg-background px-2 py-1 rounded">
                {inputValue.slice(0, getCurrentStepData.step - 1)}
                <span className="bg-primary text-primary-foreground px-1">
                  {getCurrentStepData.symbol || ''}
                </span>
                {inputValue.slice(getCurrentStepData.step)}
              </span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Remaining: </span>
              <span className="font-mono bg-background px-2 py-1 rounded">
                {getCurrentStepData.remainingInput || 'ε'}
              </span>
            </div>
          </div>
          
          <div>
            <span className="text-muted-foreground text-sm">Current States: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {getCurrentStepData.currentStates.map((state, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    data.acceptStates.includes(state)
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : data.startState === state
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            {getCurrentStepData.description}
          </p>
        </div>
      )}

      {/* Step Navigation */}
      {isSimulating && simulationSteps.current.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={stepBackward}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <span className="text-sm text-muted-foreground">
            {currentStep + 1} of {simulationSteps.current.length}
          </span>
          
          <button
            onClick={stepForward}
            disabled={currentStep === simulationSteps.current.length - 1}
            className="flex items-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <StepForward className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simulation Info */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-3">Simulation Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Start State: </span>
            <span className="font-mono text-foreground">{data.startState}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Accept States: </span>
            <span className="font-mono text-foreground">{data.acceptStates.join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Alphabet: </span>
            <span className="font-mono text-foreground">{data.alphabet.join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total States: </span>
            <span className="font-mono text-foreground">{data.states.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationPanel 