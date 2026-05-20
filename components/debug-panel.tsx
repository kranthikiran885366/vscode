"use client"

import { useState } from "react"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Trash2,
  Settings,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "../lib/editor-store"

interface Breakpoint {
  id: string
  file: string
  line: number
  condition?: string
  enabled: boolean
}

interface StackFrame {
  id: string
  name: string
  file: string
  line: number
  column: number
}

interface Variable {
  name: string
  value: string
  type: string
  children?: Variable[]
}

export function DebugPanel() {
  const { state, dispatch } = useEditor()
  const [debugStatus, setDebugStatus] = useState<"idle" | "running" | "paused">("idle")
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    { id: "1", file: "src/index.tsx", line: 42, enabled: true },
    { id: "2", file: "src/components/App.tsx", line: 15, enabled: false },
  ])
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([
    {
      id: "1",
      name: "main",
      file: "src/index.tsx",
      line: 42,
      column: 5,
    },
    {
      id: "2",
      name: "handleClick",
      file: "src/components/App.tsx",
      line: 15,
      column: 10,
    },
  ])
  const [variables, setVariables] = useState<Variable[]>([
    { name: "count", value: "42", type: "number" },
    { name: "user", value: "{...}", type: "object", children: [
      { name: "name", value: '"John"', type: "string" },
      { name: "age", value: "30", type: "number" },
    ] },
    { name: "isActive", value: "true", type: "boolean" },
  ])
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set())
  const [newBreakpointFile, setNewBreakpointFile] = useState("")
  const [newBreakpointLine, setNewBreakpointLine] = useState("")

  const handleStartDebug = () => {
    setDebugStatus("running")
  }

  const handlePauseDebug = () => {
    setDebugStatus("paused")
  }

  const handleStopDebug = () => {
    setDebugStatus("idle")
  }

  const toggleVariable = (name: string) => {
    setExpandedVars((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  const toggleBreakpoint = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) =>
        bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
      )
    )
  }

  const removeBreakpoint = (id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id))
  }

  const addBreakpoint = () => {
    if (newBreakpointFile && newBreakpointLine) {
      const newBp: Breakpoint = {
        id: Date.now().toString(),
        file: newBreakpointFile,
        line: parseInt(newBreakpointLine),
        enabled: true,
      }
      setBreakpoints((prev) => [...prev, newBp])
      setNewBreakpointFile("")
      setNewBreakpointLine("")
    }
  }

  const renderVariable = (variable: Variable, depth = 0) => {
    const hasChildren = variable.children && variable.children.length > 0
    const isExpanded = expandedVars.has(variable.name)

    return (
      <div key={variable.name}>
        <div className="flex items-center gap-2 px-4 py-1 hover:bg-gray-800 text-sm">
          {hasChildren ? (
            <button
              onClick={() => toggleVariable(variable.name)}
              className="w-4 h-4 flex items-center justify-center"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <span className="text-blue-400">{variable.name}</span>
          <span className="text-gray-500">: </span>
          <span className="text-green-400">{variable.value}</span>
          <span className="ml-auto text-gray-600 text-xs">{variable.type}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {variable.children?.map((child) =>
              renderVariable(child, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold">Debug</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "TOGGLE_DEBUG_PANEL" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <Button
          size="sm"
          variant={debugStatus !== "idle" ? "default" : "outline"}
          onClick={handleStartDebug}
          disabled={debugStatus !== "idle"}
          className="flex items-center gap-1"
        >
          <Play className="w-3 h-3" />
          Start
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePauseDebug}
          disabled={debugStatus !== "running"}
          className="flex items-center gap-1"
        >
          <Pause className="w-3 h-3" />
          Pause
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStopDebug}
          disabled={debugStatus === "idle"}
          className="flex items-center gap-1"
        >
          <Square className="w-3 h-3" />
          Stop
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={debugStatus === "idle"}
          className="flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Restart
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="variables" className="flex-1 flex flex-col">
        <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none w-full justify-start">
          <TabsTrigger
            value="variables"
            className="rounded-none text-xs"
          >
            Variables
          </TabsTrigger>
          <TabsTrigger
            value="watch"
            className="rounded-none text-xs"
          >
            Watch
          </TabsTrigger>
          <TabsTrigger
            value="breakpoints"
            className="rounded-none text-xs"
          >
            Breakpoints
          </TabsTrigger>
          <TabsTrigger
            value="call-stack"
            className="rounded-none text-xs"
          >
            Call Stack
          </TabsTrigger>
        </TabsList>

        {/* Variables Tab */}
        <TabsContent value="variables" className="flex-1 overflow-auto m-0">
          {variables.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-sm">No variables to display</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {variables.map((variable) => renderVariable(variable))}
            </div>
          )}
        </TabsContent>

        {/* Watch Tab */}
        <TabsContent value="watch" className="flex-1 overflow-auto m-0">
          <div className="p-4">
            <p className="text-sm text-gray-500">Add expressions to watch them during debugging</p>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Expression..."
                className="h-7 text-xs bg-gray-800 border-gray-700"
              />
              <Button size="sm" className="h-7 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Breakpoints Tab */}
        <TabsContent value="breakpoints" className="flex-1 overflow-auto m-0">
          <div className="divide-y divide-gray-700">
            {breakpoints.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p className="text-sm">No breakpoints set</p>
              </div>
            ) : (
              <div>
                {breakpoints.map((bp) => (
                  <div key={bp.id} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={bp.enabled}
                      onChange={() => toggleBreakpoint(bp.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate">{bp.file}</p>
                      <p className="text-xs text-gray-500">Line {bp.line}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => removeBreakpoint(bp.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-gray-700">
              <p className="text-xs font-semibold mb-2">Add Breakpoint</p>
              <div className="space-y-2">
                <Input
                  placeholder="File path..."
                  value={newBreakpointFile}
                  onChange={(e) => setNewBreakpointFile(e.target.value)}
                  className="h-7 text-xs bg-gray-800 border-gray-700"
                />
                <Input
                  placeholder="Line number..."
                  type="number"
                  value={newBreakpointLine}
                  onChange={(e) => setNewBreakpointLine(e.target.value)}
                  className="h-7 text-xs bg-gray-800 border-gray-700"
                />
                <Button onClick={addBreakpoint} className="w-full h-7 text-xs">
                  Add
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Call Stack Tab */}
        <TabsContent value="call-stack" className="flex-1 overflow-auto m-0">
          <div className="divide-y divide-gray-700">
            {stackFrames.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p className="text-sm">No call stack</p>
              </div>
            ) : (
              <div>
                {stackFrames.map((frame) => (
                  <div
                    key={frame.id}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <p className="text-sm text-gray-300">{frame.name}</p>
                    <p className="text-xs text-gray-500">
                      {frame.file}:{frame.line}:{frame.column}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
