'use client'

import { useEffect, useRef, useState } from 'react'
import { useFileStore } from '@/lib/store/useAppStore'

interface CodeEditorProps {
  fileId: string
  initialContent: string
  language: string
  readOnly?: boolean
  onChange?: (content: string) => void
}

export default function CodeEditor({
  fileId,
  initialContent,
  language,
  readOnly = false,
  onChange,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState(initialContent)
  const [cursorPos, setCursorPos] = useState({ line: 0, column: 0 })
  const { markDirty } = useFileStore()

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent, fileId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.currentTarget.value
    setContent(newContent)
    markDirty(fileId, newContent)
    onChange?.(newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget

    if (e.key === 'Tab') {
      e.preventDefault()
      const start = target.selectionStart
      const end = target.selectionEnd
      const newContent = content.substring(0, start) + '\t' + content.substring(end)
      setContent(newContent)
      markDirty(fileId, newContent)

      // Move cursor after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1
      }, 0)
    }

    // Update cursor position
    const lines = target.value.substring(0, target.selectionStart).split('\n')
    const line = lines.length - 1
    const column = lines[lines.length - 1].length
    setCursorPos({ line, column })
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 dark:bg-gray-950">
      {/* Editor toolbar */}
      <div className="border-b border-gray-700 px-4 py-2 flex items-center justify-between bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Language: {language}</span>
        </div>
        <div className="text-xs text-gray-500">
          Ln {cursorPos.line + 1}, Col {cursorPos.column}
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1 overflow-hidden relative">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 text-gray-500 text-sm overflow-hidden">
          {content.split('\n').map((_, i) => (
            <div key={i} className="h-6 pl-2 pr-1 text-right leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck="false"
          className="absolute inset-0 pl-16 pr-4 py-2 bg-gray-900 dark:bg-gray-950 text-white font-mono text-sm border-0 outline-none resize-none"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            lineHeight: '1.5',
            caretColor: '#3b82f6',
          }}
        />
      </div>

      {/* Status bar */}
      <div className="border-t border-gray-700 px-4 py-1 text-xs text-gray-500 bg-gray-800 flex justify-between">
        <span>{content.length} characters</span>
        <span>{content.split('\n').length} lines</span>
      </div>
    </div>
  )
}
