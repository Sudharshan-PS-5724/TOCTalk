import React from 'react'

const GrammarEditor = ({ grammarData, onGrammarChange }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary-50 rounded-lg">
        <h3 className="font-semibold mb-2">Grammar Editor</h3>
        <p className="text-sm text-secondary-600">
          Grammar editor component will be implemented here with Monaco Editor integration.
        </p>
      </div>
    </div>
  )
}

export default GrammarEditor 