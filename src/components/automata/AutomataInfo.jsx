import React, { useState } from 'react'
import { Info, Brain, Cpu, Database, Server, Target, ChevronDown, ChevronRight, Lightbulb, BookOpen, Zap, AlertCircle, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

const AutomataInfo = ({ automataType }) => {
  const [expandedSections, setExpandedSections] = useState(['overview'])

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const automataData = {
    dfa: {
      name: 'Deterministic Finite Automaton',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'A finite automaton where each state has exactly one transition for each input symbol.',
      features: [
        'Exactly one transition per state-symbol pair',
        'No ε-transitions',
        'Deterministic behavior',
        'Can be easily implemented',
        'Recognizes regular languages'
      ],
      examples: [
        'Strings ending with "00"',
        'Strings containing exactly two "1"s',
        'Strings that start with "0" and end with "1"',
        'Binary numbers divisible by 3'
      ],
      tips: [
        'Start with a clear understanding of the language',
        'Identify all possible states needed',
        'Ensure every state has transitions for all symbols',
        'Mark accept states carefully',
        'Test with various input strings'
      ],
      complexity: 'O(n) time complexity for input processing'
    },
    nfa: {
      name: 'Nondeterministic Finite Automaton',
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'A finite automaton that can have multiple transitions for the same state-symbol pair.',
      features: [
        'Multiple transitions possible per state-symbol pair',
        'No ε-transitions',
        'Nondeterministic behavior',
        'Can be converted to DFA',
        'Recognizes regular languages'
      ],
      examples: [
        'Strings containing "101" or "010"',
        'Strings with at least two consecutive "1"s',
        'Strings that end with "00" or "11"',
        'Strings with pattern "0*1*0*"'
      ],
      tips: [
        'Think of multiple possible paths',
        'Consider all possible transitions',
        'Use nondeterminism to simplify design',
        'Convert to DFA for implementation',
        'Test with edge cases'
      ],
      complexity: 'O(n) time complexity (with DFA conversion)'
    },
    enfa: {
      name: 'NFA with ε-transitions',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'An NFA that can make transitions without reading any input symbol (ε-transitions).',
      features: [
        'ε-transitions (no input required)',
        'Multiple transitions possible',
        'Can represent complex patterns',
        'Convertible to DFA',
        'Recognizes regular languages'
      ],
      examples: [
        'Strings with optional prefix "ab"',
        'Strings containing "a" followed by any number of "b"s',
        'Strings that can skip certain symbols',
        'Patterns with optional parts'
      ],
      tips: [
        'Use ε-transitions for optional parts',
        'Consider closure operations',
        'Simplify complex patterns',
        'Convert to DFA for simulation',
        'Handle ε-closure properly'
      ],
      complexity: 'O(n) time complexity (with conversion)'
    },
    pda: {
      name: 'Pushdown Automaton',
      icon: Server,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'A finite automaton with a stack that can recognize context-free languages.',
      features: [
        'Has a stack for memory',
        'Can push and pop symbols',
        'Recognizes context-free languages',
        'More powerful than finite automata',
        'Used in parsing'
      ],
      examples: [
        'a^n b^n (equal number of a\'s and b\'s)',
        'Balanced parentheses',
        'Palindrome over {a,b}',
        'Strings with nested structures'
      ],
      tips: [
        'Use stack to count symbols',
        'Push for opening, pop for closing',
        'Consider stack operations carefully',
        'Test with nested structures',
        'Verify stack is empty at end'
      ],
      complexity: 'O(n) time complexity'
    },
    tm: {
      name: 'Turing Machine',
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'The most powerful automaton that can recognize recursively enumerable languages.',
      features: [
        'Has an infinite tape',
        'Can read, write, and move',
        'Recognizes recursively enumerable languages',
        'Universal computational model',
        'Can solve any computable problem'
      ],
      examples: [
        'Copy machine (copies input)',
        'Palindrome checker',
        'Binary addition',
        'Pattern matching with wildcards'
      ],
      tips: [
        'Plan tape operations carefully',
        'Use multiple states for complex logic',
        'Consider halting conditions',
        'Test with various inputs',
        'Verify termination'
      ],
      complexity: 'Varies by problem (may not halt)'
    }
  }

  const currentData = automataData[automataType] || automataData.dfa
  const Icon = currentData.icon

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Info,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{currentData.description}</p>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">Complexity:</span>
            <span className="font-medium">{currentData.complexity}</span>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Key Features',
      icon: Zap,
      content: (
        <ul className="space-y-1 text-sm">
          {currentData.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )
    },
    {
      id: 'examples',
      title: 'Examples',
      icon: BookOpen,
      content: (
        <div className="space-y-2">
          {currentData.examples.map((example, index) => (
            <div key={index} className="p-2 bg-background rounded border border-border">
              <span className="text-sm text-muted-foreground">{example}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Learning Tips',
      icon: Lightbulb,
      content: (
        <ul className="space-y-1 text-sm">
          {currentData.tips.map((tip, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Lightbulb className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Information</h4>
        <div className={`p-1 rounded ${currentData.bgColor}`}>
          <Icon className={`w-4 h-4 ${currentData.color}`} />
        </div>
      </div>

      {/* Automata Type Info */}
      <div className={`p-3 rounded-lg border ${currentData.bgColor} border-current/20`}>
        <div className="flex items-center space-x-2 mb-2">
          <Icon className={`w-4 h-4 ${currentData.color}`} />
          <h5 className="text-sm font-medium text-foreground">{currentData.name}</h5>
        </div>
        <p className="text-xs text-muted-foreground">{currentData.description}</p>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {sections.map((section) => {
          const SectionIcon = section.icon
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <div key={section.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <SectionIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-3 border-t border-border bg-muted/30">
                  {section.content}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Reference */}
      <div className="p-3 bg-accent/30 rounded border border-border">
        <h5 className="text-sm font-medium text-foreground mb-2">Quick Reference</h5>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div
              className="h-3 w-3 rounded-full border border-[hsl(186,100%,48%)] bg-[hsl(195,100%,8%)]"
              style={{ boxShadow: '0 0 0 1px hsl(186 100% 48% / 0.4)' }}
            />
            <span className="text-muted-foreground">Circle + cyan ring = Start State</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/20 rounded-full border border-current" />
            <span className="text-muted-foreground">Double Circle = Accept State</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary/20 rounded-full" />
            <span className="text-muted-foreground">Circle = Regular State</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Arrow = Transition</span>
          </div>
        </div>
      </div>

      {/* State Shapes Legend */}
      <div className="p-3 bg-accent/30 rounded border border-border">
        <h5 className="text-sm font-medium text-foreground mb-2">State Shapes</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div
              className="h-4 w-4 rounded-full border border-[hsl(186,100%,48%)] bg-[hsl(195,100%,8%)]"
              style={{ boxShadow: '0 0 0 1px hsl(186 100% 48% / 0.45)' }}
            />
            <span className="text-muted-foreground">Start</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary/20 rounded-full border border-current" />
            <span className="text-muted-foreground">Accept</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary/20 rounded-full" />
            <span className="text-muted-foreground">Regular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full border-2 border-[hsl(186,100%,55%)] bg-[hsl(355,90%,45%)]" />
            <span className="text-muted-foreground">Current</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutomataInfo 