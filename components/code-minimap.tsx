'use client'

import { useEffect, useRef, useState } from 'react'

interface CodeMinimapProps {
  content: string
  scrollPosition?: number
  onScroll?: (position: number) => void
  height?: number
}

export function CodeMinimap({ content, scrollPosition = 0, onScroll, height = 300 }: CodeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lines = content.split('\n')
    const canvasHeight = height
    const canvasWidth = 100

    // Clear canvas
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw minimap
    ctx.fillStyle = '#4b5563'
    const lineHeight = Math.max(1, canvasHeight / lines.length)

    lines.forEach((line, index) => {
      const y = index * lineHeight
      const hasContent = line.trim().length > 0
      const indentLevel = line.length - line.trimStart().length

      if (hasContent) {
        // Color based on indent level
        const hue = (indentLevel * 10) % 360
        ctx.fillStyle = `hsl(${hue}, 60%, 50%)`
        const width = Math.min(canvasWidth, (indentLevel + 1) * 5)
        ctx.fillRect(0, y, width, lineHeight)
      }
    })

    // Draw viewport indicator
    const viewportHeight = Math.min(canvasHeight, (height / (lines.length * 20)) * canvasHeight)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.strokeRect(0, scrollPosition, canvasWidth, viewportHeight)
  }, [content, scrollPosition, height])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onScroll || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    onScroll(y)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !onScroll || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    onScroll(y)
  }

  return (
    <div className="w-24 bg-gray-900 border-l border-gray-700 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={100}
        height={height}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="w-full cursor-pointer"
      />
    </div>
  )
}
