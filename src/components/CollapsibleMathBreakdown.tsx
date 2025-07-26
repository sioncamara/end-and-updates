'use client'

import { useState } from 'react'
import { Math } from './Math'

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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

interface MathStep {
  step: string
  explanation: string
  math?: string | React.ReactNode
  stepName?: string
}

interface CollapsibleMathBreakdownProps {
  title: string
  steps: MathStep[]
  defaultOpen?: boolean
}

export function CollapsibleMathBreakdown({ title, steps, defaultOpen = false }: CollapsibleMathBreakdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors rounded-lg flex items-center justify-between"
      >
        <span className="font-medium text-blue-800 dark:text-blue-200">
          {title}
        </span>
        {isOpen ? (
          <ChevronDownIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 py-4 space-y-4 bg-white dark:bg-gray-900">
          {steps.map((step, index) => (
            <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {step.stepName || `Step ${index + 1}`}: {step.step}
              </h4>
              {step.math && (
                <div className="my-3 text-center">
                  {typeof step.math === 'string' ? (
                    <Math display={true}>{step.math}</Math>
                  ) : (
                    step.math
                  )}
                </div>
              )}
              <p className="text-gray-700 dark:text-gray-300">
                {step.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 