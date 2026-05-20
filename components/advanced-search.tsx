"use client"

import { useState, useCallback } from "react"
import { Search, X, ChevronDown, ChevronUp, Replace, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchResult {
  file: string
  line: number
  column: number
  text: string
}

export function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isRegex, setIsRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [resultIndex, setResultIndex] = useState(0)
  const [includeFiles, setIncludeFiles] = useState("")
  const [excludeFiles, setExcludeFiles] = useState("")

  // Mock search implementation
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const mockResults: SearchResult[] = [
      {
        file: "src/components/Editor.tsx",
        line: 12,
        column: 5,
        text: searchQuery,
      },
      {
        file: "src/pages/index.tsx",
        line: 45,
        column: 10,
        text: searchQuery,
      },
      {
        file: "src/utils/helpers.ts",
        line: 28,
        column: 3,
        text: searchQuery,
      },
    ]

    setResults(mockResults)
    setResultIndex(0)
  }, [searchQuery])

  const handleReplace = useCallback(
    (index: number) => {
      if (results[index]) {
        const updated = [...results]
        updated.splice(index, 1)
        setResults(updated)
        if (resultIndex >= updated.length && resultIndex > 0) {
          setResultIndex(resultIndex - 1)
        }
      }
    },
    [results, resultIndex]
  )

  const handleReplaceAll = useCallback(() => {
    if (window.confirm(`Replace all ${results.length} occurrences?`)) {
      setResults([])
    }
  }, [results.length])

  const goToNext = useCallback(() => {
    if (results.length > 0) {
      setResultIndex((prev) => (prev + 1) % results.length)
    }
  }, [results.length])

  const goToPrevious = useCallback(() => {
    if (results.length > 0) {
      setResultIndex((prev) => (prev - 1 + results.length) % results.length)
    }
  }, [results.length])

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4 space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Find in files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>

        {/* Replace Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Replace className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Button onClick={handleReplaceAll} size="sm" variant="outline">
            Replace All
          </Button>
        </div>
      </div>

      {/* Search Options */}
      <div className="space-y-3 pb-4 border-b border-gray-700">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={isRegex ? "default" : "outline"}
            size="sm"
            onClick={() => setIsRegex(!isRegex)}
            className="text-xs"
            title="Alt+R"
          >
            .*
          </Button>
          <Button
            variant={caseSensitive ? "default" : "outline"}
            size="sm"
            onClick={() => setCaseSensitive(!caseSensitive)}
            className="text-xs"
            title="Alt+C"
          >
            Aa
          </Button>
          <Button
            variant={wholeWord ? "default" : "outline"}
            size="sm"
            onClick={() => setWholeWord(!wholeWord)}
            className="text-xs"
            title="Alt+W"
          >
            ab
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Settings className="w-3 h-3" />
            More
          </Button>
        </div>

        {/* File Filters */}
        <div className="space-y-2">
          <Input
            placeholder="Include files (*.ts, *.tsx)"
            value={includeFiles}
            onChange={(e) => setIncludeFiles(e.target.value)}
            className="text-xs bg-gray-800 border-gray-700 text-white"
          />
          <Input
            placeholder="Exclude files (node_modules, dist)"
            value={excludeFiles}
            onChange={(e) => setExcludeFiles(e.target.value)}
            className="text-xs bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto">
        {results.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>
              {searchQuery ? "No results found" : "Enter search terms to begin"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">
              {resultIndex + 1} of {results.length} results
            </div>

            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => setResultIndex(index)}
                className={`p-3 rounded border transition cursor-pointer ${
                  index === resultIndex
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      {result.file}:{result.line}:{result.column}
                    </div>
                    <div className="text-sm font-mono">
                      {result.text}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReplace(index)
                    }}
                  >
                    <Replace className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      {results.length > 0 && (
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="gap-2"
          >
            <ChevronUp className="w-4 h-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} className="gap-2">
            <ChevronDown className="w-4 h-4" />
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
