import React from 'react'

/** Chunky pixel / cyberpunk frame — red keyline + dark inset. */
export function PixelFrame({ children, className = '', as: Tag = 'div' }) {
  return (
    <Tag
      className={[
        'rounded-sm border-[3px] border-[hsl(355,85%,42%)]',
        'shadow-[3px_3px_0_0_#020617,0_0_20px_hsl(355_100%_45%/0.25),inset_0_1px_0_hsl(186_100%_50%/0.12)]',
        'bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.2))]',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
