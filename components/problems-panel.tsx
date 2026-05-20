"use client"

import { useState, useMemo } from "react"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Filter,
  Eye,
  EyeOff,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor } from "../lib/editor-store"

interface Problem {
  id: string
  file: string
  line: number
  column: number
  message: string
  type: "error" | "warning" | "info"
  code?: string
  source?: string
  relatedInformation?: string[]
}

export function ProblemsPanel() {
  const { state, dispatch } = useEditor()
  const [problems, setProblems] = useState<Problem[]>([
    {
      id: "1",
      file: "src/components/App.tsx",
      line: 42,
      column: 8,
      message: "Variable 'unused' is defined but never used",
      type: "warning",
      code: "no-unused-vars",
      source: "ESLint",
    },
    {
      id: "2",
      file: "src/utils/helpers.ts",
      line: 15,
      column: 5,
      message: "Missing return type annotation",
      type: "info",
      code: "implicit-any",
      source: "TypeScript",
    },
    {
      id: "3",
      file: "src/index.tsx",
      line: 8,
      column: 1,
      message: "Unterminated string literal",
      type: "error",
      code: "syntax-error",
      source: "Parser",
    },
  ])
  const [filterQuery, setFilterQuery] = useState("")
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set())
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(["error", "warning", "info"])
  )

  const errorCount = problems.filter((p) => p.type === "error").length
  const warningCount = problems.filter((p) => p.type === "warning").length
  const infoCount = problems.filter((p) => p.type === "info").length

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (!visibleTypes.has(p.type)) return false
      if (filterQuery && !p.message.toLowerCase().includes(filterQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [problems, filterQuery, visibleTypes])

  const groupedProblems = useMemo(() => {
    return filteredProblems.reduce(
      (acc, problem) => {
        if (!acc[problem.file]) {
          acc[problem.file] = []
        }
        acc[problem.file].push(problem)
        return acc
      },
      {} as Record<string, Problem[]>
    )
  }, [filteredProblems])

  const toggleProblemExpand = (id: string) => {
    setExpandedProblems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleProblemType = (type: string) => {
    setVisibleTypes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const getProblemIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <Tabs defaultValue="problems" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-700 rounded-none w-full justify-start">
              <TabsTrigger
                value="problems"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
              >
                Problems
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "TOGGLE_PROBLEMS_PANEL" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Problem Stats */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 text-xs">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span>{errorCount} errors</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-yellow-500" />
          <span>{warningCount} warnings</span>
        </div>
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-blue-500" />
          <span>{infoCount} infos</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700">
        <Input
          placeholder="Filter problems..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="h-7 text-xs bg-gray-800 border-gray-700"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2">
              <Filter className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => toggleProblemType("error")}>
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              <span className="flex-1">Errors</span>
              {visibleTypes.has("error") ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleProblemType("warning")}>
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="flex-1">Warnings</span>
              {visibleTypes.has("warning") ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleProblemType("info")}>
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              <span className="flex-1">Infos</span>
              {visibleTypes.has("info") ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-auto">
        {Object.keys(groupedProblems).length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No problems detected</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {Object.entries(groupedProblems).map(([file, fileProblems]) => (
              <div key={file}>
                <button
                  className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm transition-colors"
                  onClick={() => toggleProblemExpand(file)}
                >
                  {expandedProblems.has(file) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="truncate text-gray-400">{file}</span>
                  <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">
                    {fileProblems.length}
                  </span>
                </button>

                {expandedProblems.has(file) && (
                  <div className="divide-y divide-gray-800">
                    {fileProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="px-8 py-2 hover:bg-gray-800 text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          {getProblemIcon(problem.type)}
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-300 line-clamp-2">{problem.message}</div>
                            <div className="text-gray-500 mt-1">
                              Line {problem.line}, Column {problem.column}
                            </div>
                            {problem.source && (
                              <div className="mt-1">
                                <span className="inline-block bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
                                  {problem.source}
                                  {problem.code && ` (${problem.code})`}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
