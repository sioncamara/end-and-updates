'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface World {
  id: number
  x: number
  y: number
  hasH: boolean
  hasE: boolean
  radius: number
  opacity: number
}

interface BayesVisualizationProps {
  width?: number
  height?: number
}

export function BayesVisualization({ width = 800, height = 600 }: BayesVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [step, setStep] = useState(0)
  const [worlds, setWorlds] = useState<World[]>([])

  // Generate worlds with collision detection
  useEffect(() => {
    const numWorlds = 1000 // Reduced from 1000 to prevent overcrowding
    const pH = 0.3 // 30% of worlds have H
    const pE_given_H = 0.9 // 90% of H-worlds have E
    const pE_given_notH = 0.1 // 10% of non-H-worlds have E

    const newWorlds: World[] = []
    const minDistance = 8 // Minimum distance between circles
    const maxAttempts = 50 // Maximum attempts to place each circle
    
    // Add padding to ensure circles don't bleed outside SVG
    // Account for the maximum radius circles can have (5px in step 3) plus generous buffer
    const maxCircleRadius = 5
    const buffer = 15 // Increased buffer to prevent any edge cutting
    const padding = maxCircleRadius + buffer
    
    for (let i = 0; i < numWorlds; i++) {
      const hasH = Math.random() < pH
      const hasE = hasH ? Math.random() < pE_given_H : Math.random() < pE_given_notH
      
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < maxAttempts) {
        // Ensure circle centers are positioned so that even the largest circles stay within bounds
        const x = Math.random() * (width - 2 * padding) + padding
        const y = Math.random() * (height - 2 * padding) + padding
        
        // Check for collisions with existing worlds
        const hasCollision = newWorlds.some(world => {
          const dx = world.x - x
          const dy = world.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          return distance < minDistance
        })
        
        if (!hasCollision) {
          newWorlds.push({
            id: i,
            x,
            y,
            hasH,
            hasE,
            radius: 3,
            opacity: 1
          })
          placed = true
        }
        
        attempts++
      }
    }
    
    setWorlds(newWorlds)
  }, [width, height])

  // D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || worlds.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Create tooltip with better positioning and dark mode support
    const isDarkMode = document.documentElement.classList.contains('dark')
    const tooltip = d3.select('body').append('div')
      .attr('class', 'bayes-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', isDarkMode ? 'rgba(55, 65, 81, 0.95)' : 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '200px')
      .style('border', isDarkMode ? '1px solid rgba(75, 85, 99, 0.5)' : 'none')

    // Calculate positions and colors based on step
    const getWorldData = (step: number) => {
      switch (step) {
        case 0: // All worlds
          return worlds.map(w => ({
            ...w,
            opacity: 1,
            radius: 3,
            fill: w.hasH ? (w.hasE ? '#22c55e' : '#16a34a') : (w.hasE ? '#ef4444' : '#94a3b8')
          }))
        
        case 1: // P(E|H) - Focus on H worlds
          return worlds.map(w => ({
            ...w,
            opacity: w.hasH ? 1 : 0.1,
            radius: w.hasH ? 4 : 2,
            fill: w.hasH ? (w.hasE ? '#22c55e' : '#16a34a') : '#94a3b8'
          }))
        
        case 2: // P(E|H) × P(H) - Zoom out to joint probability
          return worlds.map(w => ({
            ...w,
            opacity: (w.hasH && w.hasE) ? 1 : 0.2,
            radius: (w.hasH && w.hasE) ? 5 : 2,
            fill: (w.hasH && w.hasE) ? '#22c55e' : '#94a3b8'
          }))
        
        case 3: // Divide by P(E) - Zoom in to E worlds
          return worlds.map(w => ({
            ...w,
            opacity: w.hasE ? 1 : 0.05,
            radius: w.hasE ? (w.hasH ? 5 : 4) : 1,
            fill: w.hasE ? (w.hasH ? '#22c55e' : '#ef4444') : '#94a3b8'
          }))
        
        default:
          return worlds.map(w => ({ ...w, opacity: 1, radius: 3, fill: '#94a3b8' }))
      }
    }

    const worldData = getWorldData(step)

    // Create circles with improved hover behavior
    const circles = svg.selectAll('circle')
      .data(worldData)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      .attr('fill', d => d.fill)
      .attr('opacity', d => d.opacity)
      .style('cursor', 'pointer')
      .style('stroke', 'none')
      .on('mouseover', (event, d) => {
        // Add stroke highlight on hover (color depends on dark mode)
        const strokeColor = isDarkMode ? '#ffffff' : '#000000'
        d3.select(event.target).style('stroke', strokeColor).style('stroke-width', '1px')
        
        tooltip.transition().duration(200).style('opacity', 0.9)
        tooltip.html(`World ${d.id}<br/>H: ${d.hasH ? 'Yes' : 'No'}<br/>E: ${d.hasE ? 'Yes' : 'No'}`)
        
        // Better tooltip positioning to prevent overflow
        const tooltipNode = tooltip.node() as HTMLElement
        const rect = tooltipNode.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let left = event.pageX + 10
        let top = event.pageY - 28
        
        // Adjust if tooltip would go off-screen
        if (left + rect.width > viewportWidth) {
          left = event.pageX - rect.width - 10
        }
        if (top < 0) {
          top = event.pageY + 10
        }
        if (top + rect.height > viewportHeight) {
          top = event.pageY - rect.height - 10
        }
        
        tooltip.style('left', left + 'px').style('top', top + 'px')
      })
      .on('mouseout', (event) => {
        // Remove stroke highlight
        d3.select(event.target).style('stroke', 'none')
        tooltip.transition().duration(500).style('opacity', 0)
      })

    // Animate transitions
    circles.transition()
      .duration(1000)
      .attr('r', d => d.radius)
      .attr('opacity', d => d.opacity)
      .attr('fill', d => d.fill)

    // Cleanup tooltip on unmount
    return () => {
      d3.select('body').selectAll('.bayes-tooltip').remove()
    }
  }, [worlds, step, width, height])

  const stepDescriptions = [
    "All Possible Worlds: Green = H is true, Red = H is false, Bright = E is true",
    "P(E|H): Focusing on worlds where H is true. How many also have E?",
    "P(E|H) × P(H): Zooming out - worlds with both H and E highlighted",
    "÷ P(E): Zooming in - among all E-worlds, what fraction have H?"
  ]

  const getStats = () => {
    const totalWorlds = worlds.length
    const hWorlds = worlds.filter(w => w.hasH).length
    const eWorlds = worlds.filter(w => w.hasE).length
    const hAndEWorlds = worlds.filter(w => w.hasH && w.hasE).length
    
    return {
      totalWorlds,
      hWorlds,
      eWorlds,
      hAndEWorlds,
      pH: hWorlds / totalWorlds,
      pE: eWorlds / totalWorlds,
      pE_given_H: hAndEWorlds / hWorlds,
      pH_given_E: hAndEWorlds / eWorlds
    }
  }

  const stats = worlds.length > 0 ? getStats() : null

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Bayes&apos; Theorem: The Three Operations</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Step {step + 1} of 4</span>
          <button
            onClick={() => setStep(Math.min(3, step + 1))}
            disabled={step === 3}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            Next
          </button>
        </div>
        
        <p className="text-center text-gray-700 dark:text-gray-300 mb-4">{stepDescriptions[step]}</p>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">P(H)</div>
              <div className="text-gray-700 dark:text-gray-300">{stats.pH.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">P(E|H)</div>
              <div className="text-gray-700 dark:text-gray-300">{stats.pE_given_H.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">P(E)</div>
              <div className="text-gray-700 dark:text-gray-300">{stats.pE.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">P(H|E)</div>
              <div className="text-gray-700 dark:text-gray-300">{stats.pH_given_E.toFixed(3)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded border border-gray-300 dark:border-gray-600">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full h-auto bg-white dark:bg-gray-800"
          style={{ maxWidth: '100%' }}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><strong className="text-gray-900 dark:text-white">Legend:</strong></p>
        <p>🟢 Green circles: Worlds where H is true</p>
        <p>🔴 Red circles: Worlds where H is false</p>
        <p>Brightness indicates whether E is true in that world</p>
        <p>Hover over circles to see individual world details</p>
      </div>
    </div>
  )
} 