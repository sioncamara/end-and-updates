'use client'

import { InlineMath, BlockMath } from 'react-katex'

interface MathProps {
  children: string
  display?: boolean
  className?: string
}

export function Math({ children, display = false, className = '' }: MathProps) {
  if (display) {
    return (
      <span className={`block my-6 text-center ${className}`}>
        <BlockMath math={children} />
      </span>
    )
  }
  
  return (
    <span className={`inline ${className}`}>
      <InlineMath math={children} />
    </span>
  )
} 