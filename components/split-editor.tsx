'use client'

import { useState, useRef } from 'react'
import { X } from 'lucide-react'

interface SplitEditorProps {
  leftContent: string
  rightContent?: string
  leftLanguage?: string
  rightLanguage?: string
  onLeftChange?: (content: string) => void
  onRightChange?: (content: string) => void
  onClose?: () => void
  splitMode?: 'vertical' | 'horizontal'
}

export function SplitEditor({
  leftContent,
  rightContent,
  leftLanguage = 'plaintext',
  rightLanguage = 'plaintext',
  onLeftChange,
  onRightChange,
  onClose,
  splitMode = 'vertical',
}: SplitEditorProps) {
  const [resizing, setResizing] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setResizing(true)
  }

  const handleMouseUp = () => {
    setResizing(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!resizing || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = splitMode === 'vertical' ? ((e.clientX - rect.left) / rect.width) * 100 : ((e.clientY - rect.top) / rect.height) * 100

    setSplitPosition(Math.max(20, Math.min(80, newPosition)))
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${splitMode === 'vertical' ? 'flex-row' : 'flex-col'} h-full bg-gray-900`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Editor */}
      <div
        className="flex-1 overflow-hidden bg-gray-900 border-r border-gray-700"
        style={{
          [splitMode === 'vertical' ? 'width' : 'height']: `${splitPosition}%`,
        }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-sm text-gray-300">
            Left Editor ({leftLanguage})
          </div>
          <textarea
            value={leftContent}
            onChange={(e) => onLeftChange?.(e.target.value)}
            className="flex-1 bg-gray-900 text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Splitter */}
      <div
        onMouseDown={handleMouseDown}
        className={`${splitMode === 'vertical' ? 'w-1 cursor-col-resize hover:bg-blue-500' : 'h-1 cursor-row-resize hover:bg-blue-500'} bg-gray-700 transition-colors`}
      />

      {/* Right Editor */}
      {rightContent !== undefined && (
        <div
          className="flex-1 overflow-hidden bg-gray-900"
          style={{
            [splitMode === 'vertical' ? 'width' : 'height']: `${100 - splitPosition}%`,
          }}
        >
          <div className="h-full flex flex-col">
            <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 text-sm text-gray-300 flex justify-between items-center">
              <span>Right Editor ({rightLanguage})</span>
              {onClose && (
                <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              value={rightContent}
              onChange={(e) => onRightChange?.(e.target.value)}
              className="flex-1 bg-gray-900 text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>
        </div>
      )}
    </div>
  )
}
