'use client'

import { useState } from 'react'
import { Math } from './Math'

interface NotationItem {
  symbol: string
  explanation: string
}

interface CollapsibleNotationProps {
  items: NotationItem[]
  title?: string
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export function CollapsibleNotation({ items, title = "Notation Guide" }: CollapsibleNotationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="my-6 border border-zinc-200 dark:border-zinc-700 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 text-left group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Math>{item.symbol}</Math>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 