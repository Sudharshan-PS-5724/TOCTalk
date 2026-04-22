import React from 'react'

/**
 * Renders a Turing Machine tape snapshot as a horizontal strip of cells,
 * with the head clearly marked.
 *
 * Props:
 *   cells      : { idx, symbol }[]   — the padded tape window from simulateTM
 *   head       : number              — absolute head index
 *   highlight  : string              — extra classes on the head cell
 */
export default function TapeView({ cells, head, highlight = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col items-center font-mono text-sm">
        <div className="flex">
          {cells.map((c) => {
            const isHead = c.idx === head
            return (
              <div
                key={c.idx}
                className={`flex h-10 w-10 items-center justify-center border border-border ${
                  isHead
                    ? `bg-primary/20 text-primary ${highlight}`
                    : 'bg-background text-foreground'
                }`}
              >
                {c.symbol}
              </div>
            )
          })}
        </div>
        <div className="flex">
          {cells.map((c) => (
            <div key={c.idx} className="flex h-5 w-10 items-center justify-center">
              {c.idx === head ? (
                <span className="text-primary">▲</span>
              ) : (
                <span className="opacity-0">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
