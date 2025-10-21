'use client'

import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, ChevronUp, ChevronDown } from 'lucide-react'

interface SearchReplaceProps {
  content: string
  onReplace?: (newContent: string) => void
  onClose?: () => void
}

export function SearchReplace({ content, onReplace, onClose }: SearchReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [currentMatch, setCurrentMatch] = useState(0)
  const [matches, setMatches] = useState<Array<{ start: number; end: number }>>([])
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [regex, setRegex] = useState(false)

  // Find all matches
  const updateMatches = useCallback(() => {
    if (!searchTerm) {
      setMatches([])
      return
    }

    let pattern = searchTerm
    let flags = caseSensitive ? 'g' : 'gi'

    try {
      if (regex) {
        pattern = searchTerm
      } else {
        pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
      }

      const regexPattern = new RegExp(pattern, flags)
      const foundMatches: Array<{ start: number; end: number }> = []

      let match
      while ((match = regexPattern.exec(content)) !== null) {
        foundMatches.push({
          start: match.index,
          end: match.index + match[0].length,
        })
      }

      setMatches(foundMatches)
      setCurrentMatch(0)
    } catch (error) {
      console.error('Invalid regex pattern:', error)
    }
  }, [searchTerm, content, caseSensitive, wholeWord, regex])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return
    setCurrentMatch((prev) => (prev + 1) % matches.length)
  }, [matches])

  const handlePrevMatch = useCallback(() => {
    if (matches.length === 0) return
    setCurrentMatch((prev) => (prev - 1 + matches.length) % matches.length)
  }, [matches])

  const handleReplace = useCallback(() => {
    if (!matches.length || !onReplace) return

    const match = matches[currentMatch]
    const newContent =
      content.substring(0, match.start) +
      replaceTerm +
      content.substring(match.end)

    onReplace(newContent)
    updateMatches()
  }, [matches, currentMatch, replaceTerm, content, onReplace, updateMatches])

  const handleReplaceAll = useCallback(() => {
    if (!matches.length || !onReplace) return

    let newContent = content
    let offset = 0

    matches.forEach((match) => {
      const adjustedStart = match.start + offset
      const adjustedEnd = match.end + offset
      newContent = newContent.substring(0, adjustedStart) + replaceTerm + newContent.substring(adjustedEnd)
      offset += replaceTerm.length - (match.end - match.start)
    })

    onReplace(newContent)
    setMatches([])
  }, [matches, replaceTerm, content, onReplace])

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 space-y-3">
      {/* Search */}
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Find"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 bg-gray-700 border-gray-600 text-white"
          autoFocus
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrevMatch}
            className="p-1"
            title="Previous match (Shift+Enter)"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNextMatch}
            className="p-1"
            title="Next match (Enter)"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {matches.length > 0 ? `${currentMatch + 1} of ${matches.length}` : 'No results'}
        </span>
      </div>

      {/* Replace */}
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Replace"
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          className="flex-1 bg-gray-700 border-gray-600 text-white"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleReplace}
          disabled={matches.length === 0}
          className="whitespace-nowrap"
        >
          Replace
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReplaceAll}
          disabled={matches.length === 0}
          className="whitespace-nowrap"
        >
          Replace All
        </Button>
      </div>

      {/* Options */}
      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Match Case</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={wholeWord}
            onChange={(e) => setWholeWord(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Whole Word</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={regex}
            onChange={(e) => setRegex(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Use Regex</span>
        </label>
        <button onClick={onClose} className="ml-auto hover:bg-gray-700 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
