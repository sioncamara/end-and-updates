'use client'

import { useState, useRef, useEffect } from 'react'

interface Reference {
  id: string
  content: React.ReactNode
}

interface CollapsibleReferencesProps {
  references: Reference[]
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

export function CollapsibleReferences({ references }: CollapsibleReferencesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const referencesRef = useRef<HTMLDivElement>(null)

  // Check if URL has a reference hash on mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#ref')) {
      setIsExpanded(true)
      // Small delay to ensure the content is rendered before scrolling
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [])

  // Handle clicking on reference links in the article
  useEffect(() => {
    const handleReferenceClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.href && target.href.includes('#ref')) {
        e.preventDefault()
        const refId = target.href.split('#')[1]
        
        // Expand the references section
        setIsExpanded(true)
        
        // Scroll to the specific reference after a short delay
        setTimeout(() => {
          const refElement = document.getElementById(refId)
          if (refElement) {
            // First scroll to the references section
            referencesRef.current?.scrollIntoView({ behavior: 'smooth' })
            
            // Then highlight and scroll to the specific reference
            setTimeout(() => {
              refElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              
              // Add a temporary highlight effect
              refElement.style.backgroundColor = 'rgb(59 130 246 / 0.1)'
              refElement.style.transition = 'background-color 0.3s ease'
              
              setTimeout(() => {
                refElement.style.backgroundColor = 'transparent'
              }, 2000)
            }, 300)
          }
        }, 100)
      }
    }

    // Add event listeners to all reference links
    const referenceLinks = document.querySelectorAll('a[href^="#ref"]')
    referenceLinks.forEach(link => {
      link.addEventListener('click', handleReferenceClick)
    })

    return () => {
      referenceLinks.forEach(link => {
        link.removeEventListener('click', handleReferenceClick)
      })
    }
  }, [])

  return (
    <div ref={referencesRef} className="mt-16">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={isExpanded}
      >
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
          References
        </h2>
        <ChevronDownIcon 
          className={`w-6 h-6 text-zinc-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          {references.map((ref) => (
            <div key={ref.id} id={ref.id} className="scroll-mt-24">
              {ref.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 