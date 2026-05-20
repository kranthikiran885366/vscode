"use client"

import { useState } from "react"
import {
  GitCompare,
  ChevronDown,
  ChevronUp,
  Copy,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "../lib/editor-store"

interface DiffLine {
  type: "added" | "removed" | "unchanged" | "context"
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}

interface FileDiff {
  filename: string
  oldContent: string
  newContent: string
  addedCount: number
  removedCount: number
}

export function DiffViewer() {
  const { state, dispatch } = useEditor()
  const [viewMode, setViewMode] = useState<"split" | "unified">("split")
  const [selectedFile, setSelectedFile] = useState(0)

  const [fileDiffs] = useState<FileDiff[]>([
    {
      filename: "src/App.tsx",
      oldContent: `import React from 'react'
import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}`,
      newContent: `import React from 'react'
import { useState, useCallback } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  
  return (
    <div className="app-container">
      <p>Count: {count}</p>
      <button onClick={decrement}>Decrement</button>
      <button onClick={increment}>Increment</button>
    </div>
  )
}`,
      addedCount: 4,
      removedCount: 2,
    },
    {
      filename: "src/utils.ts",
      oldContent: `export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}`,
      newContent: `export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export function multiply(a: number, b: number): number {
  return a * b
}

export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}`,
      addedCount: 7,
      removedCount: 0,
    },
  ])

  const currentDiff = fileDiffs[selectedFile]

  const generateDiffLines = (): DiffLine[] => {
    const oldLines = currentDiff.oldContent.split("\n")
    const newLines = currentDiff.newContent.split("\n")
    const diffLines: DiffLine[] = []

    const maxLines = Math.max(oldLines.length, newLines.length)

    for (let i = 0; i < maxLines; i++) {
      if (i < oldLines.length && i < newLines.length) {
        if (oldLines[i] === newLines[i]) {
          diffLines.push({
            type: "unchanged",
            content: oldLines[i],
            oldLineNumber: i + 1,
            newLineNumber: i + 1,
          })
        } else {
          diffLines.push({
            type: "removed",
            content: oldLines[i],
            oldLineNumber: i + 1,
          })
          if (i < newLines.length) {
            diffLines.push({
              type: "added",
              content: newLines[i],
              newLineNumber: i + 1,
            })
          }
        }
      } else if (i < oldLines.length) {
        diffLines.push({
          type: "removed",
          content: oldLines[i],
          oldLineNumber: i + 1,
        })
      } else {
        diffLines.push({
          type: "added",
          content: newLines[i],
          newLineNumber: i + 1,
        })
      }
    }

    return diffLines
  }

  const diffLines = generateDiffLines()

  const getLineColor = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-900/30 text-green-200"
      case "removed":
        return "bg-red-900/30 text-red-200"
      case "unchanged":
        return "bg-gray-800 text-gray-300"
      case "context":
        return "bg-gray-700 text-gray-400"
      default:
        return "text-gray-300"
    }
  }

  const getSideIcon = (type: DiffLine["type"]) => {
    switch (type) {
      case "added":
        return <span className="text-green-500">+</span>
      case "removed":
        return <span className="text-red-500">-</span>
      default:
        return <span className="text-gray-500"> </span>
    }
  }

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4" />
          <span className="text-sm font-semibold">Diff View</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "TOGGLE_DIFF_VIEWER" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* File Selector */}
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          {fileDiffs.map((diff, index) => (
            <button
              key={diff.filename}
              onClick={() => setSelectedFile(index)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selectedFile === index
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {diff.filename}
              <span className="ml-1 text-green-400">+{diff.addedCount}</span>
              <span className="ml-1 text-red-400">-{diff.removedCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
        <span className="text-xs font-semibold">View Mode:</span>
        <Tabs defaultValue="split" onValueChange={(value) => setViewMode(value as "split" | "unified")}>
          <TabsList className="bg-gray-800 border border-gray-700 rounded h-7">
            <TabsTrigger value="split" className="text-xs h-6">
              Split
            </TabsTrigger>
            <TabsTrigger value="unified" className="text-xs h-6">
              Unified
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {viewMode === "split" ? (
          <div className="flex">
            {/* Old Content */}
            <div className="flex-1 border-r border-gray-700">
              <div className="bg-gray-800 text-gray-400 px-2 py-1 border-b border-gray-700 sticky top-0">
                Original
              </div>
              <div>
                {diffLines.map((line, idx) => {
                  if (line.type === "added") return null
                  return (
                    <div
                      key={`old-${idx}`}
                      className={`flex border-b border-gray-800 ${getLineColor(line.type)}`}
                    >
                      <div className="w-12 px-2 py-1 bg-gray-800/30 text-right text-gray-600 flex-shrink-0">
                        {line.oldLineNumber}
                      </div>
                      <div className="w-6 px-1 flex-shrink-0 flex items-center justify-center">
                        {getSideIcon(line.type)}
                      </div>
                      <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                        {line.content}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* New Content */}
            <div className="flex-1">
              <div className="bg-gray-800 text-gray-400 px-2 py-1 border-b border-gray-700 sticky top-0">
                Modified
              </div>
              <div>
                {diffLines.map((line, idx) => {
                  if (line.type === "removed") return null
                  return (
                    <div
                      key={`new-${idx}`}
                      className={`flex border-b border-gray-800 ${getLineColor(line.type)}`}
                    >
                      <div className="w-12 px-2 py-1 bg-gray-800/30 text-right text-gray-600 flex-shrink-0">
                        {line.newLineNumber}
                      </div>
                      <div className="w-6 px-1 flex-shrink-0 flex items-center justify-center">
                        {getSideIcon(line.type)}
                      </div>
                      <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                        {line.content}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-800 text-gray-400 px-4 py-2 border-b border-gray-700 sticky top-0">
              {currentDiff.filename}
            </div>
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex border-b border-gray-800 ${getLineColor(line.type)}`}
              >
                <div className="w-12 px-2 py-1 bg-gray-800/30 text-right text-gray-600 flex-shrink-0">
                  {line.oldLineNumber || line.newLineNumber}
                </div>
                <div className="w-6 px-1 flex-shrink-0 flex items-center justify-center">
                  {getSideIcon(line.type)}
                </div>
                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                  {line.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
