"use client"

import { useState } from "react"
import {
  GitBranch,
  GitCommit,
  Plus,
  X,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Trash2,
  Settings,
  Download,
  Upload,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "../lib/editor-store"

interface GitChange {
  id: string
  filename: string
  status: "added" | "modified" | "deleted" | "renamed"
  staged: boolean
}

interface GitCommit {
  hash: string
  author: string
  message: string
  date: Date
  files: number
}

interface GitBranch {
  name: string
  current: boolean
  tracking?: string
}

export function GitPanel() {
  const { state, dispatch } = useEditor()
  const [currentBranch, setCurrentBranch] = useState("main")
  const [commitMessage, setCommitMessage] = useState("")
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const [changes, setChanges] = useState<GitChange[]>([
    { id: "1", filename: "src/App.tsx", status: "modified", staged: false },
    { id: "2", filename: "src/components/Header.tsx", status: "added", staged: false },
    { id: "3", filename: "src/utils/helpers.ts", status: "modified", staged: true },
    { id: "4", filename: "package.json", status: "modified", staged: true },
  ])

  const [branches, setBranches] = useState<GitBranch[]>([
    { name: "main", current: true },
    { name: "feature/dark-mode", current: false },
    { name: "bugfix/header", current: false },
  ])

  const [commits, setCommits] = useState<GitCommit[]>([
    {
      hash: "a1b2c3d",
      author: "John Doe",
      message: "Add dark mode support",
      date: new Date(Date.now() - 86400000),
      files: 5,
    },
    {
      hash: "e4f5g6h",
      author: "Jane Smith",
      message: "Fix responsive layout",
      date: new Date(Date.now() - 172800000),
      files: 3,
    },
  ])

  const stagedChanges = changes.filter((c) => c.staged)
  const unstagedChanges = changes.filter((c) => !c.staged)

  const toggleFileExpand = (id: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleStaged = (id: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, staged: !c.staged } : c))
    )
  }

  const getStatusColor = (status: GitChange["status"]) => {
    switch (status) {
      case "added":
        return "text-green-500"
      case "modified":
        return "text-blue-500"
      case "deleted":
        return "text-red-500"
      case "renamed":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusLabel = (status: GitChange["status"]) => {
    switch (status) {
      case "added":
        return "A"
      case "modified":
        return "M"
      case "deleted":
        return "D"
      case "renamed":
        return "R"
      default:
        return "?"
    }
  }

  const renderChangeItem = (change: GitChange) => (
    <div
      key={change.id}
      className="px-6 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm"
    >
      <input
        type="checkbox"
        checked={change.staged}
        onChange={() => toggleStaged(change.id)}
        className="w-4 h-4"
      />
      <span className={`w-6 font-mono ${getStatusColor(change.status)}`}>
        {getStatusLabel(change.status)}
      </span>
      <span className="flex-1 text-gray-300 truncate">{change.filename}</span>
    </div>
  )

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          <span className="text-sm font-semibold">{currentBranch}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="changes" className="flex-1 flex flex-col">
        <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none w-full justify-start">
          <TabsTrigger value="changes" className="rounded-none text-xs">
            Changes ({changes.length})
          </TabsTrigger>
          <TabsTrigger value="branches" className="rounded-none text-xs">
            Branches ({branches.length})
          </TabsTrigger>
          <TabsTrigger value="log" className="rounded-none text-xs">
            Commit Log
          </TabsTrigger>
        </TabsList>

        {/* Changes Tab */}
        <TabsContent value="changes" className="flex-1 flex flex-col m-0 overflow-hidden">
          {/* Commit Message */}
          <div className="px-4 py-3 border-b border-gray-700">
            <textarea
              placeholder="Commit message (required)"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 placeholder-gray-500 resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button className="flex-1 h-8 text-xs" disabled={!commitMessage.trim()}>
                Commit
              </Button>
              <Button variant="outline" className="h-8 text-xs flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Amend
              </Button>
            </div>
          </div>

          {/* Changes List */}
          <div className="flex-1 overflow-auto">
            {stagedChanges.length > 0 && (
              <div>
                <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm font-semibold">
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-green-500">Staged Changes ({stagedChanges.length})</span>
                </button>
                {stagedChanges.map((change) => renderChangeItem(change))}
              </div>
            )}

            {unstagedChanges.length > 0 && (
              <div>
                <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm font-semibold">
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-blue-500">Changes ({unstagedChanges.length})</span>
                </button>
                {unstagedChanges.map((change) => renderChangeItem(change))}
              </div>
            )}

            {changes.length === 0 && (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p className="text-sm">No changes</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="flex-1 overflow-auto m-0">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Create new branch..."
                className="h-7 text-xs bg-gray-800 border-gray-700"
              />
              <Button size="sm" className="h-7 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="divide-y divide-gray-700">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={`px-3 py-2 hover:bg-gray-800 flex items-center justify-between cursor-pointer ${
                    branch.current ? "bg-gray-800/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3 h-3 text-gray-500" />
                    <span className="text-sm">{branch.name}</span>
                    {branch.current && (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  {!branch.current && (
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Commit Log Tab */}
        <TabsContent value="log" className="flex-1 overflow-auto m-0">
          <div className="divide-y divide-gray-700">
            {commits.map((commit) => (
              <div
                key={commit.hash}
                className="px-4 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <GitCommit className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200">{commit.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{commit.author}</span>
                      <span>•</span>
                      <span>{commit.date.toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                        {commit.hash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pull/Push Actions */}
      <div className="px-4 py-3 border-t border-gray-700 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-8 text-xs flex items-center justify-center gap-1"
        >
          <Download className="w-3 h-3" />
          Pull
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-8 text-xs flex items-center justify-center gap-1"
        >
          <Upload className="w-3 h-3" />
          Push
        </Button>
      </div>
    </div>
  )
}
