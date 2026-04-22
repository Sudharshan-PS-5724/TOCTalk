import React from 'react'

const GrammarInfo = ({ grammarData }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary-50 rounded-lg">
        <h3 className="font-semibold mb-2">Grammar Information</h3>
        <p className="text-sm text-secondary-600">
          Grammar information and analysis will be displayed here.
        </p>
      </div>
    </div>
  )
}

export default GrammarInfo 