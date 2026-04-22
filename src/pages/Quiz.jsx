import React, { useState, useEffect } from 'react'
import { Target, Brain, Calculator, ArrowRight, RotateCcw, Download, Upload, Settings, CheckCircle, AlertTriangle, Info, Zap, BookOpen, HelpCircle, Timer, Trophy } from 'lucide-react'
import useGSAP from '../hooks/useGSAP'

const Quiz = () => {
  const [activeTab, setActiveTab] = useState('automata')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [showExamples, setShowExamples] = useState(false)

  const { elementRef, animateIn, staggerIn } = useGSAP()

  const tabs = [
    { id: 'automata', name: 'Automata', description: 'DFA, NFA, PDA, TM', icon: Calculator },
    { id: 'grammar', name: 'CFG', description: 'CNF, GNF, PDA (CFG Chilling)', icon: BookOpen },
    { id: 'proofs', name: 'Proof Lab', description: 'Pumping, MN, reductions', icon: Brain },
    { id: 'complexity', name: 'Complexity', description: 'P, NP, NPC', icon: Target },
  ]

  const quizzes = {
    automata: {
      name: "Automata Quiz",
      description: "Test your knowledge of finite automata and Turing machines",
      questions: [
        {
          question: "Which of the following is a property of DFA?",
          options: [
            "Multiple transitions for same symbol",
            "Exactly one transition per symbol per state",
            "ε-transitions allowed",
            "Infinite tape"
          ],
          correct: 1,
          explanation: "DFA has exactly one transition for each symbol in each state, making it deterministic."
        },
        {
          question: "What does NFA stand for?",
          options: [
            "Non-Finite Automaton",
            "Nondeterministic Finite Automaton", 
            "Normal Finite Automaton",
            "Network Finite Automaton"
          ],
          correct: 1,
          explanation: "NFA stands for Nondeterministic Finite Automaton, which can have multiple transitions for the same input symbol."
        },
        {
          question: "Which automaton can recognize context-free languages?",
          options: [
            "DFA",
            "NFA", 
            "PDA",
            "All of the above"
          ],
          correct: 2,
          explanation: "Pushdown Automata (PDA) can recognize context-free languages, while finite automata can only recognize regular languages."
        }
      ]
    },
    grammar: {
      name: "Grammar Quiz", 
      description: "Test your understanding of context-free grammars and normal forms",
      questions: [
        {
          question: "In Chomsky Normal Form (CNF), productions are of the form:",
          options: [
            "A → BC or A → a",
            "A → aB or A → ε",
            "A → aα where α is a string of non-terminals",
            "A → any string"
          ],
          correct: 0,
          explanation: "CNF requires productions to be either A → BC (two non-terminals) or A → a (single terminal)."
        },
        {
          question: "What is the purpose of converting a CFG to CNF?",
          options: [
            "To make it more readable",
            "To enable efficient parsing algorithms",
            "To reduce the number of productions",
            "To make it deterministic"
          ],
          correct: 1,
          explanation: "CNF enables efficient parsing algorithms like CYK algorithm for context-free languages."
        },
        {
          question: "Which normal form allows ε-productions?",
          options: [
            "Chomsky Normal Form",
            "Greibach Normal Form",
            "Both allow ε-productions",
            "Neither allows ε-productions"
          ],
          correct: 1,
          explanation: "Greibach Normal Form allows ε-productions, while CNF does not."
        }
      ]
    },
    proofs: {
      name: "Proofs Quiz",
      description: "Test your knowledge of formal proofs and theorems",
      questions: [
        {
          question: "Kleene's Theorem states that:",
          options: [
            "Every regular expression has a unique DFA",
            "Regular expressions and finite automata are equivalent",
            "Every DFA can be minimized",
            "Regular languages are closed under union"
          ],
          correct: 1,
          explanation: "Kleene's Theorem proves that regular expressions and finite automata recognize the same class of languages."
        },
        {
          question: "The Pumping Lemma is used to:",
          options: [
            "Prove languages are regular",
            "Prove languages are NOT regular",
            "Convert NFA to DFA",
            "Minimize DFA"
          ],
          correct: 1,
          explanation: "The Pumping Lemma is a necessary condition for regularity, used to prove languages are NOT regular."
        },
        {
          question: "Myhill-Nerode Theorem relates to:",
          options: [
            "Regular expression equivalence",
            "DFA minimization",
            "NFA to DFA conversion",
            "Context-free grammars"
          ],
          correct: 1,
          explanation: "Myhill-Nerode Theorem provides a method for constructing minimal DFAs using equivalence classes."
        }
      ]
    },
    complexity: {
      name: "Complexity Quiz",
      description: "Test your understanding of computational complexity and decidability",
      questions: [
        {
          question: "Which class contains problems solvable in polynomial time?",
          options: [
            "NP",
            "P",
            "PSPACE",
            "Undecidable"
          ],
          correct: 1,
          explanation: "P is the class of problems solvable in polynomial time by deterministic Turing machines."
        },
        {
          question: "The Halting Problem is:",
          options: [
            "Decidable",
            "Undecidable",
            "NP-complete",
            "PSPACE-complete"
          ],
          correct: 1,
          explanation: "The Halting Problem is undecidable - no algorithm can determine if an arbitrary program halts on arbitrary input."
        },
        {
          question: "3-SAT is in which complexity class?",
          options: [
            "P",
            "NP",
            "PSPACE",
            "Undecidable"
          ],
          correct: 1,
          explanation: "3-SAT is in NP - it can be verified in polynomial time, but no known polynomial-time algorithm solves it."
        }
      ]
    }
  }

  const currentQuiz = quizzes[activeTab]
  const currentQ = currentQuiz.questions[currentQuestion]

  const checkAnswer = () => {
    const isCorrect = userAnswer === currentQ.correct
    if (isCorrect) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer('')
      setShowResult(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setUserAnswer('')
    setShowResult(false)
    setScore(0)
  }

  useEffect(() => {
    animateIn('fadeIn', 0.2)
    setTimeout(() => {
      staggerIn('.tab-item', 0.1, 0.3)
    }, 200)
  }, [animateIn, staggerIn])

  return (
    <div className="max-w-7xl mx-auto" ref={elementRef}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Interactive Quiz</h1>
        <p className="text-muted-foreground">Test your knowledge of Theory of Computation concepts</p>
      </div>

      {/* Quiz Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentQuestion(0)
                    setScore(0)
                    setShowResult(false)
                  }}
                  className={`tab-item py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="mt-2 p-3 bg-accent/50 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">{tabs.find(tab => tab.id === activeTab)?.description}</span>
            </div>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="btn-secondary text-sm"
            >
              <Brain className="w-4 h-4 mr-1" />
              Practice
            </button>
          </div>
        </div>
      </div>

      {/* Practice Modal */}
      {showExamples && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">🎯 Practice Exercises</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(quizzes).map(([key, quiz]) => (
                <div 
                  key={key}
                  className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveTab(key)
                    setCurrentQuestion(0)
                    setScore(0)
                    setShowExamples(false)
                  }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold">{quiz.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {quiz.questions.length} questions
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowExamples(false)}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quiz Display - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="card h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">{currentQuiz.name}</h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>Question {currentQuestion + 1} of {currentQuiz.questions.length}</span>
                </div>
                <button onClick={resetQuiz} className="btn-secondary text-sm">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </button>
              </div>
            </div>
            
            <div className="h-full flex flex-col">
              {/* Question */}
              <div className="flex-1 p-6 bg-muted/30 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {currentQ.question}
                </h3>
                
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="answer"
                        value={index}
                        checked={userAnswer === index}
                        onChange={(e) => setUserAnswer(parseInt(e.target.value))}
                        className="w-4 h-4 text-primary border-border focus:ring-primary"
                        disabled={showResult}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Result */}
              {showResult && (
                <div className={`p-4 rounded-lg mb-4 ${
                  userAnswer === currentQ.correct 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {userAnswer === currentQ.correct ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      {userAnswer === currentQ.correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm">{currentQ.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {!showResult ? (
                  <button 
                    onClick={checkAnswer}
                    disabled={userAnswer === ''}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    <Target className="w-4 h-4 mr-1" /> Check Answer
                  </button>
                ) : (
                  <button 
                    onClick={nextQuestion}
                    className="btn-primary flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" /> Next Question
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Takes 1 column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quiz Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quiz Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Multiple choice questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Detailed explanations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Instant feedback</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Score:</span>
                <span className="font-medium">{score} / {currentQuiz.questions.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(score / currentQuiz.questions.length) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((score / currentQuiz.questions.length) * 100)}% complete
              </div>
            </div>
          </div>

          {/* Quiz Properties */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quiz Properties</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Questions:</span>
                <span className="font-medium">{currentQuiz.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium text-yellow-600">Intermediate</span>
              </div>
              <div className="flex justify-between">
                <span>Time Limit:</span>
                <span className="font-medium">None</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                <Download className="w-4 h-4 mr-1" /> Export Results
              </button>
              <button className="w-full btn-secondary text-sm">
                <Trophy className="w-4 h-4 mr-1" /> View Leaderboard
              </button>
              <button className="w-full btn-secondary text-sm">
                <HelpCircle className="w-4 h-4 mr-1" /> Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz 