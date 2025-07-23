'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Math as MathComponent } from './Math'

interface InteractiveVennDiagramProps {
  width?: number
  height?: number
}

export function InteractiveVennDiagram({ width = 600, height = 400 }: InteractiveVennDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null)
  const [lockedRegion, setLockedRegion] = useState<string | null>(null)

  // Calculate the actual diagram size (what the universe rectangle was)
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const diagramWidth = width - margin.left - margin.right
  const diagramHeight = height - margin.top - margin.bottom

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // No margins needed since SVG is now the exact size we want
    const innerWidth = diagramWidth
    const innerHeight = diagramHeight

    const g = svg.append('g')

    // Circle parameters - positioning H like P and E like Q in reference image
    const centerX = innerWidth / 2
    const centerY = innerHeight / 2
    const radius = Math.min(innerWidth, innerHeight) / 3
    const overlap = radius * 0.8

    // Circle centers - H on left (like P), E on right (like Q)
    const hCenter = { x: centerX - overlap/2, y: centerY }
    const eCenter = { x: centerX + overlap/2, y: centerY }

    
    // No need for background rectangle - SVG container provides the boundary

    // Create circles for H and E with better colors
    const hCircle = g.append('circle')
      .attr('cx', hCenter.x)
      .attr('cy', hCenter.y)
      .attr('r', radius)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.4)
      .attr('stroke', '#1d4ed8')
      .attr('stroke-width', 2)
      .attr('class', 'h-circle')

    const eCircle = g.append('circle')
      .attr('cx', eCenter.x)
      .attr('cy', eCenter.y)
      .attr('r', radius)
      .attr('fill', '#10b981')
      .attr('fill-opacity', 0.4)
      .attr('stroke', '#059669')
      .attr('stroke-width', 2)
      .attr('class', 'e-circle')

    // Create intersection area using clipPath for proper intersection highlighting
    const defs = g.append('defs')
    
    // Define clip path for intersection
    const clipPath = defs.append('clipPath')
      .attr('id', 'intersection-clip')
    
    clipPath.append('circle')
      .attr('cx', hCenter.x)
      .attr('cy', hCenter.y)
      .attr('r', radius)
    
    // Create intersection highlight circle that covers borders
    const intersectionHighlight = g.append('circle')
      .attr('cx', eCenter.x)
      .attr('cy', eCenter.y)
      .attr('r', radius + 2) // Slightly larger to cover borders
      .attr('fill', '#8b5cf6')
      .attr('fill-opacity', 0)
      .attr('clip-path', 'url(#intersection-clip)')
      .attr('class', 'intersection-highlight')

    // Add labels - H positioned like P (upper left), E like Q (lower right)
    g.append('text')
      .attr('x', hCenter.x - radius * 0.9)
      .attr('y', hCenter.y - radius * 0.9)
      .attr('text-anchor', 'middle')
      .attr('font-size', '32')
      .attr('font-weight', 'normal')
      .attr('font-family', 'Times, serif')
      .attr('font-style', 'italic')
      .attr('fill', '#1d4ed8')
      .text('H')

    g.append('text')
      .attr('x', eCenter.x + radius * 1)
      .attr('y', eCenter.y + radius * 1)
      .attr('text-anchor', 'middle')
      .attr('font-size', '32')
      .attr('font-weight', 'normal')
      .attr('font-family', 'Times, serif')
      .attr('font-style', 'italic')
      .attr('fill', '#059669')
      .text('E')

    // Function to update highlighting
    const updateHighlight = (region: string | null) => {
      // Reset all elements - keep background unchanged
      hCircle.attr('fill-opacity', 0.4).attr('stroke-width', 2).attr('stroke-opacity', 1)
      eCircle.attr('fill-opacity', 0.4).attr('stroke-width', 2).attr('stroke-opacity', 1)
      intersectionHighlight.attr('fill-opacity', 0).attr('fill', '#8b5cf6')

      if (region === 'intersection') {
        // Highlight intersection with purple overlay that covers the borders
        intersectionHighlight.attr('fill-opacity', 0.9)
        // Make the non-intersection parts of both circles much more translucent
        hCircle.attr('fill-opacity', 0.15).attr('stroke-opacity', 0.3)
        eCircle.attr('fill-opacity', 0.15).attr('stroke-opacity', 0.3)
      } else if (region === 'evidence') {
        // Highlight E circle, dim H
        eCircle.attr('fill-opacity', 0.8).attr('stroke-width', 4)
        hCircle.attr('fill-opacity', 0.1).attr('stroke-width', 1)
      } else if (region === 'conditional') {
        // Show conditional relationship - E is the new universe, intersection shows H within E
        // Highlight E circle as the probability space we're conditioning on
        eCircle.attr('fill-opacity', 0.8).attr('stroke-width', 4)
        hCircle.attr('fill-opacity', 0.1).attr('stroke-width', 1)
        // Make intersection blue to show H portion within E
        intersectionHighlight.attr('fill-opacity', 0.8).attr('fill', '#3b82f6')
      }
      
      // Reset stroke colors if not conditional
      if (region !== 'conditional') {
        hCircle.attr('stroke', '#1d4ed8')
        eCircle.attr('stroke', '#059669')
      }
    }

    // Update highlighting when state changes
    updateHighlight(highlightedRegion)

  }, [diagramWidth, diagramHeight, highlightedRegion])

  const handleFormulaClick = (region: string) => {
    if (lockedRegion === region) {
      // Unlock if clicking the same region
      setLockedRegion(null)
      setHighlightedRegion(null)
    } else {
      // Lock to new region
      setLockedRegion(region)
      setHighlightedRegion(region)
    }
  }

  const handleFormulaHover = (region: string) => {
    // Only hover if nothing is locked
    if (lockedRegion === null) {
      setHighlightedRegion(region)
    }
  }

  const handleFormulaLeave = () => {
    // Only clear if nothing is locked
    if (lockedRegion === null) {
      setHighlightedRegion(null)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Interactive Formula */}
      <div className="mb-6 text-center">
        <div className="text-sm mb-3 text-gray-600 dark:text-gray-400">
          Hover or click formula parts to explore:
        </div>
        <div className="flex items-center justify-center gap-2 text-2xl">
                     <button
             onClick={() => handleFormulaClick('conditional')}
             onMouseEnter={() => handleFormulaHover('conditional')}
             onMouseLeave={handleFormulaLeave}
             className={`px-2 py-1 rounded transition-colors ${
               highlightedRegion === 'conditional' 
                 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                 : 'hover:bg-gray-100 dark:hover:bg-gray-800'
             }`}
           >
             <MathComponent>{"P(H|E)"}</MathComponent>
           </button>
           <span className="text-gray-700 dark:text-gray-300">=</span>
                      <div className="flex flex-col items-center">
             <button
               onClick={() => handleFormulaClick('intersection')}
               onMouseEnter={() => handleFormulaHover('intersection')}
               onMouseLeave={handleFormulaLeave}
               className={`px-2 py-1 rounded transition-colors ${
                 highlightedRegion === 'intersection' 
                   ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                   : 'hover:bg-gray-100 dark:hover:bg-gray-800'
               }`}
             >
               <MathComponent>{"P(H \\cap E)"}</MathComponent>
             </button>
             {/* Invisible bridge for smooth hover transitions - covers the entire gap */}
             <div 
               className="w-full h-2"
               onMouseEnter={() => handleFormulaHover('intersection')}
               onMouseLeave={handleFormulaLeave}
             ></div>
             <div className="w-full h-px bg-gray-400 dark:bg-gray-600"></div>
             <div 
               className="w-full h-2"
               onMouseEnter={() => handleFormulaHover('evidence')}
               onMouseLeave={handleFormulaLeave}
             ></div>
             <button
               onClick={() => handleFormulaClick('evidence')}
               onMouseEnter={() => handleFormulaHover('evidence')}
               onMouseLeave={handleFormulaLeave}
               className={`px-2 py-1 rounded transition-colors ${
                 highlightedRegion === 'evidence' 
                   ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                   : 'hover:bg-gray-100 dark:hover:bg-gray-800'
               }`}
             >
               <MathComponent>{"P(E)"}</MathComponent>
             </button>
           </div>
        </div>
      </div>

      {/* Venn Diagram */}
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={diagramWidth}
          height={diagramHeight}
          viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
          className="rounded-lg"
          style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #dee2e6'
          }}
          onClick={() => {
            setLockedRegion(null)
            setHighlightedRegion(null)
          }}
        />
      </div>

      
    </div>
  )
} 