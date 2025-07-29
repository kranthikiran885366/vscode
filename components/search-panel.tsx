"use client"

import { useState } from "react"
import { Search, Replace, CaseSensitive, Regex, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditor } from "../lib/editor-store"

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [showReplace, setShowReplace] = useState(false)

  const searchResults = [
    {
      file: "src/components/App.tsx",
      line: 15,
      column: 8,
      text: "const [count, setCount] = useState(0)",
      match: "useState",
    },
    {
      file: "src/components/Header.tsx",
      line: 8,
      column: 12,
      text: "import { useState } from 'react'",
      match: "useState",
    },
  ]

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Search</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowReplace(!showReplace)}>
            <Replace className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="relative">
            <Replace className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Replace"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
        )}

        {/* Options */}
        <div className="flex items-center space-x-1">
          <Button
            variant={caseSensitive ? "default" : "ghost"}
            size="sm"
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Match Case"
          >
            <CaseSensitive className="w-4 h-4" />
          </Button>
          <Button
            variant={useRegex ? "default" : "ghost"}
            size="sm"
            onClick={() => setUseRegex(!useRegex)}
            title="Use Regular Expression"
          >
            <Regex className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {searchResults.length} results in {new Set(searchResults.map(r => r.file)).size} files
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-2 text-xs bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {result.file}:{result.line}:{result.column}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-mono">
                  {result.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}