"use client"

import { useState, useRef } from "react"
import {
  Search,
  Replace,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Filter,
  FileText,
  Regex,
  CaseSensitive,
  WholeWord,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SearchResult {
  file: string
  line: number
  column: number
  text: string
  match: string
  context: string
}

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [showReplace, setShowReplace] = useState(false)
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [includeFiles, setIncludeFiles] = useState("")
  const [excludeFiles, setExcludeFiles] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const searchInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      file: "/src/components/App.tsx",
      line: 15,
      column: 8,
      text: "const handleClick = () => {",
      match: "handleClick",
      context: "function definition",
    },
    {
      file: "/src/components/App.tsx",
      line: 25,
      column: 12,
      text: "  onClick={handleClick}",
      match: "handleClick",
      context: "event handler",
    },
    {
      file: "/src/components/Header.tsx",
      line: 8,
      column: 15,
      text: "const handleClick = useCallback(() => {",
      match: "handleClick",
      context: "callback function",
    },
    {
      file: "/src/utils/helpers.ts",
      line: 42,
      column: 20,
      text: "export const handleClick = (event: MouseEvent) => {",
      match: "handleClick",
      context: "utility function",
    },
  ]

  const groupedResults = searchResults.reduce(
    (acc, result) => {
      if (!acc[result.file]) {
        acc[result.file] = []
      }
      acc[result.file].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 1000)
  }

  const handleReplace = (result: SearchResult) => {
    console.log("Replace", result.match, "with", replaceQuery, "in", result.file)
  }

  const handleReplaceAll = () => {
    console.log("Replace all occurrences of", searchQuery, "with", replaceQuery)
  }

  const toggleFileExpansion = (file: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(file)) {
        newSet.delete(file)
      } else {
        newSet.add(file)
      }
      return newSet
    })
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    const colors: Record<string, string> = {
      tsx: "text-blue-400",
      ts: "text-blue-600",
      js: "text-yellow-500",
      jsx: "text-blue-400",
      css: "text-blue-500",
      html: "text-orange-500",
      json: "text-yellow-600",
      md: "text-gray-600",
    }
    return <FileText className={`w-4 h-4 ${colors[ext || ""] || "text-gray-500"}`} />
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Search</span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowReplace(!showReplace)}
            title="Toggle Replace"
          >
            <Replace className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 space-y-3">
        <div className="relative">
          <Input
            ref={searchInputRef}
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${matchCase ? "bg-blue-100 dark:bg-blue-900" : ""}`}
              onClick={() => setMatchCase(!matchCase)}
              title="Match Case"
            >
              <CaseSensitive className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${wholeWord ? "bg-blue-100 dark:bg-blue-900" : ""}`}
              onClick={() => setWholeWord(!wholeWord)}
              title="Match Whole Word"
            >
              <WholeWord className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${useRegex ? "bg-blue-100 dark:bg-blue-900" : ""}`}
              onClick={() => setUseRegex(!useRegex)}
              title="Use Regular Expression"
            >
              <Regex className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Replace Input */}
        {showReplace && (
          <div className="relative">
            <Input
              ref={replaceInputRef}
              placeholder="Replace"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleReplaceAll}
              title="Replace All"
            >
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* File Filters */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start h-6 px-2 text-xs">
              <Filter className="w-3 h-3 mr-2" />
              Files to include/exclude
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <Input
              placeholder="Files to include (e.g., *.ts, src/**)"
              value={includeFiles}
              onChange={(e) => setIncludeFiles(e.target.value)}
              className="h-7 text-xs"
            />
            <Input
              placeholder="Files to exclude (e.g., node_modules, *.test.ts)"
              value={excludeFiles}
              onChange={(e) => setExcludeFiles(e.target.value)}
              className="h-7 text-xs"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Search Button */}
        <Button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="w-full h-8">
          {isSearching ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {searchResults.length} results in {Object.keys(groupedResults).length} files
              </span>
              {showReplace && (
                <Button size="sm" variant="outline" onClick={handleReplaceAll} className="h-6 text-xs bg-transparent">
                  Replace All
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-auto">
            {Object.entries(groupedResults).map(([file, results]) => (
              <div key={file} className="border-b border-gray-100 dark:border-gray-800">
                <div
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleFileExpansion(file)}
                >
                  {expandedFiles.has(file) ? (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                  {getFileIcon(file)}
                  <span className="text-sm font-medium truncate flex-1">{file}</span>
                  <Badge variant="secondary" className="text-xs">
                    {results.length}
                  </Badge>
                </div>

                {expandedFiles.has(file) && (
                  <div className="bg-gray-50 dark:bg-gray-800">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 pl-8 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-xs"
                        onClick={() => console.log("Go to", result.file, result.line)}
                      >
                        <div className="flex-shrink-0 w-8 text-gray-500 text-right">{result.line}</div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">
                            {result.text.split(result.match).map((part, i, arr) => (
                              <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{result.match}</mark>
                                )}
                              </span>
                            ))}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">{result.context}</div>
                        </div>
                        {showReplace && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReplace(result)
                            }}
                            title="Replace"
                          >
                            <Replace className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
