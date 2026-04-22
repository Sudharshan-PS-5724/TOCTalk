import React, { useState } from 'react'
import { Plus, Trash2, Edit3, Save, RotateCcw, Settings, Eye, EyeOff, ArrowRight, CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react'

const AutomataControls = ({ automataType, data, onDataChange }) => {
  const [newStateId, setNewStateId] = useState('')
  const [newTransition, setNewTransition] = useState({ from: '', to: '', symbol: '' })
  const [editingState, setEditingState] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  const addState = () => {
    if (!newStateId.trim()) return
    
    const newState = {
      id: newStateId.trim(),
      label: newStateId.trim(),
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    }
    
    onDataChange({
      ...data,
      states: [...data.states, newState]
    })
    setNewStateId('')
  }

  const removeState = (stateId) => {
    const updatedStates = data.states.filter(s => s.id !== stateId)
    const updatedTransitions = data.transitions.filter(t => t.from !== stateId && t.to !== stateId)
    const updatedAcceptStates = data.acceptStates.filter(s => s !== stateId)
    
    let updatedStartState = data.startState
    if (data.startState === stateId) {
      updatedStartState = updatedStates.length > 0 ? updatedStates[0].id : null
    }
    
    onDataChange({
      ...data,
      states: updatedStates,
      transitions: updatedTransitions,
      startState: updatedStartState,
      acceptStates: updatedAcceptStates
    })
  }

  const setStartState = (stateId) => {
    onDataChange({
      ...data,
      startState: stateId
    })
  }

  const toggleAcceptState = (stateId) => {
    const isAccept = data.acceptStates.includes(stateId)
    const updatedAcceptStates = isAccept 
      ? data.acceptStates.filter(s => s !== stateId)
      : [...data.acceptStates, stateId]
    
    onDataChange({
      ...data,
      acceptStates: updatedAcceptStates
    })
  }

  const addTransition = () => {
    if (!newTransition.from || !newTransition.to || !newTransition.symbol) return
    
    const transition = {
      from: newTransition.from,
      to: newTransition.to,
      symbol: newTransition.symbol
    }
    
    onDataChange({
      ...data,
      transitions: [...data.transitions, transition]
    })
    setNewTransition({ from: '', to: '', symbol: '' })
  }

  const removeTransition = (index) => {
    const updatedTransitions = data.transitions.filter((_, i) => i !== index)
    onDataChange({
      ...data,
      transitions: updatedTransitions
    })
  }

  const clearAll = () => {
    onDataChange({
      states: [],
      transitions: [],
      startState: null,
      acceptStates: [],
      alphabet: automataType === 'pda' ? ['0', '1', 'ε'] : ['0', '1']
    })
  }

  const getStateShape = (state) => {
    if (data.acceptStates.includes(state.id)) return 'double-circle'
    if (state.id === data.startState) return 'start-circle'
    return 'circle'
  }

  const StartIcon = () => (
    <div
      className="h-3 w-3 rounded-full border border-[hsl(186,100%,48%)] bg-[hsl(195,100%,8%)]"
      style={{ boxShadow: '0 0 0 1px hsl(186 100% 48% / 0.4)' }}
    />
  )

  const getStateIcon = (state) => {
    const shape = getStateShape(state)
    switch (shape) {
      case 'start-circle':
        return <StartIcon />
      case 'double-circle':
        return <div className="h-3 w-3 rounded-full border-2 border-[hsl(355,90%,52%)] bg-[hsl(355,85%,38%)]" />
      default:
        return <div className="h-3 w-3 rounded-full border border-[hsl(355,85%,45%)] bg-[hsl(0,0%,8%)]" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Help Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Controls</h4>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-1 rounded hover:bg-accent transition-colors"
          title="Show Help"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="p-3 bg-accent/50 rounded-lg border border-border">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <StartIcon />
              <span>Circle + cyan ring = Start State</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/20 rounded-full border border-current" />
              <span>Double Circle = Accept State</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/20 rounded-full" />
              <span>Circle = Regular State</span>
            </div>
          </div>
        </div>
      )}

      {/* Add State */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Add State</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newStateId}
            onChange={(e) => setNewStateId(e.target.value)}
            placeholder="State ID"
            className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
            onKeyPress={(e) => e.key === 'Enter' && addState()}
          />
          <button
            onClick={addState}
            className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* States List */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">States ({data.states.length})</label>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {data.states.map((state) => (
            <div
              key={state.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
            >
              <div className="flex items-center space-x-2">
                {getStateIcon(state)}
                <span className="font-medium">{state.id}</span>
                {state.id === data.startState && (
                  <span className="text-primary text-xs">START</span>
                )}
                {data.acceptStates.includes(state.id) && (
                  <span className="text-green-600 text-xs">ACCEPT</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setStartState(state.id)}
                  className={`p-1 rounded text-xs ${
                    state.id === data.startState
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                  title="Set as Start State"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => toggleAcceptState(state.id)}
                  className={`p-1 rounded text-xs ${
                    data.acceptStates.includes(state.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-muted hover:bg-accent'
                  }`}
                  title="Toggle Accept State"
                >
                  <CheckCircle className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeState(state.id)}
                  className="p-1 rounded bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Remove State"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {data.states.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No states defined
            </div>
          )}
        </div>
      </div>

      {/* Add Transition */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Add Transition</label>
        <div className="space-y-2">
          <div className="flex space-x-1">
            <select
              value={newTransition.from}
              onChange={(e) => setNewTransition({ ...newTransition, from: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
            >
              <option value="">From</option>
              {data.states.map((state) => (
                <option key={state.id} value={state.id}>{state.id}</option>
              ))}
            </select>
            <select
              value={newTransition.to}
              onChange={(e) => setNewTransition({ ...newTransition, to: e.target.value })}
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
            >
              <option value="">To</option>
              {data.states.map((state) => (
                <option key={state.id} value={state.id}>{state.id}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTransition.symbol}
              onChange={(e) => setNewTransition({ ...newTransition, symbol: e.target.value })}
              placeholder="Symbol"
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
              onKeyPress={(e) => e.key === 'Enter' && addTransition()}
            />
            <button
              onClick={addTransition}
              className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Transitions List */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Transitions ({data.transitions.length})</label>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {data.transitions.map((transition, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
            >
              <div className="flex items-center space-x-1">
                <span className="font-medium">{transition.from}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{transition.to}</span>
                <span className="text-muted-foreground">({transition.symbol})</span>
              </div>
              <button
                onClick={() => removeTransition(index)}
                className="p-1 rounded bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Remove Transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {data.transitions.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-2">
              No transitions defined
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Quick Actions</label>
        <div className="flex space-x-2">
          <button
            onClick={clearAll}
            className="flex-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-accent transition-colors"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear All
          </button>
        </div>
      </div>

      {/* Automata Info */}
      <div className="p-2 bg-accent/30 rounded border border-border">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{automataType.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alphabet:</span>
            <span className="font-medium">{data.alphabet.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start State:</span>
            <span className="font-medium">{data.startState || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Accept States:</span>
            <span className="font-medium">{data.acceptStates.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomataControls 