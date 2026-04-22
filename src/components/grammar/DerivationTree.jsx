import React from 'react'

const DerivationTree = ({ grammarData, testString, derivationSteps }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-secondary-50 rounded-lg">
        <h3 className="font-semibold mb-2">Derivation Tree</h3>
        <p className="text-sm text-secondary-600">
          Derivation tree visualization will be implemented here with D3.js.
        </p>
      </div>
    </div>
  )
}

export default DerivationTree 