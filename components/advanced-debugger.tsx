"use client"

import { useState } from "react"
import {
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  StepForward,
  StepBack,
  ChevronDown,
  Plus,
  X,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Breakpoint {
  id: string
  file: string
  line: number
  column: number
  enabled: boolean
  condition?: string
  logMessage?: string
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
  expandable: boolean
  children?: Variable[]
}

interface WatchExpression {
  id: string
  expression: string
  value: string
  type: string
}

export function AdvancedDebugger() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([
    {
      id: "1",
      file: "src/main.ts",
      line: 25,
      column: 0,
      enabled: true,
      condition: "count > 5",
    },
    {
      id: "2",
      file: "src/utils.ts",
      line: 42,
      column: 0,
      enabled: true,
    },
  ])
  const [watchExpressions, setWatchExpressions] = useState<WatchExpression[]>([
    { id: "1", expression: "count", value: "8", type: "number" },
    { id: "2", expression: "name", value: '"test"', type: "string" },
  ])
  const [callStack, setCallStack] = useState<StackFrame[]>([
    {
      id: "1",
      name: "handleClick",
      file: "src/components/Button.tsx",
      line: 18,
      column: 5,
    },
    {
      id: "2",
      name: "onClick",
      file: "src/pages/index.tsx",
      line: 45,
      column: 10,
    },
    {
      id: "3",
      name: "main",
      file: "src/main.ts",
      line: 25,
      column: 0,
    },
  ])
  const [selectedFrame, setSelectedFrame] = useState("1")
  const [variables, setVariables] = useState<Variable[]>([
    {
      name: "this",
      value: "Object",
      type: "object",
      expandable: true,
      children: [
        { name: "props", value: "Object", type: "object", expandable: true },
        { name: "state", value: "Object", type: "object", expandable: true },
      ],
    },
    { name: "event", value: "MouseEvent", type: "object", expandable: true },
  ])
  const [newWatchExpr, setNewWatchExpr] = useState("")
  const [newBreakpointFile, setNewBreakpointFile] = useState("")
  const [newBreakpointLine, setNewBreakpointLine] = useState("")
  const [newBreakpointCondition, setNewBreakpointCondition] = useState("")

  const handleStart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
  }

  const handleRestart = () => {
    setIsRunning(true)
    setIsPaused(false)
  }

  const handleStepOver = () => {
    // Step over logic
  }

  const handleStepInto = () => {
    // Step into logic
  }

  const handleAddWatchExpression = () => {
    if (!newWatchExpr.trim()) return
    const expr: WatchExpression = {
      id: Date.now().toString(),
      expression: newWatchExpr,
      value: "undefined",
      type: "undefined",
    }
    setWatchExpressions((prev) => [...prev, expr])
    setNewWatchExpr("")
  }

  const handleRemoveWatchExpression = (id: string) => {
    setWatchExpressions((prev) => prev.filter((w) => w.id !== id))
  }

  const handleAddBreakpoint = () => {
    if (!newBreakpointFile.trim() || !newBreakpointLine.trim()) return
    const bp: Breakpoint = {
      id: Date.now().toString(),
      file: newBreakpointFile,
      line: parseInt(newBreakpointLine),
      column: 0,
      enabled: true,
      condition: newBreakpointCondition || undefined,
    }
    setBreakpoints((prev) => [...prev, bp])
    setNewBreakpointFile("")
    setNewBreakpointLine("")
    setNewBreakpointCondition("")
  }

  const handleToggleBreakpoint = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) =>
        bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
      )
    )
  }

  const handleRemoveBreakpoint = (id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id))
  }

  const handleDeleteAllBreakpoints = () => {
    setBreakpoints([])
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={handleStart}
          disabled={isRunning}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Start
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handlePause}
          disabled={!isRunning}
          className="gap-2"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStop}
          disabled={!isRunning}
          className="gap-2"
        >
          <StopCircle className="w-4 h-4" />
          Stop
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRestart}
          disabled={!isRunning}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </Button>
        <div className="border-l border-gray-700 mx-2" />
        <Button
          size="sm"
          variant="outline"
          onClick={handleStepOver}
          disabled={!isPaused}
          className="gap-2"
          title="F10"
        >
          <StepBack className="w-4 h-4" />
          Step Over
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleStepInto}
          disabled={!isPaused}
          className="gap-2"
          title="F11"
        >
          <StepForward className="w-4 h-4" />
          Step Into
        </Button>
      </div>

      {/* Status */}
      <div className="bg-gray-800/50 border-b border-gray-700 px-3 py-2 text-xs">
        <span className="text-gray-400">
          Status:{" "}
          <span
            className={`font-semibold ${
              isRunning ? (isPaused ? "text-yellow-400" : "text-green-400") : "text-gray-400"
            }`}
          >
            {isRunning ? (isPaused ? "Paused" : "Running") : "Stopped"}
          </span>
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="variables" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-gray-800 m-0 rounded-none border-b border-gray-700">
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="callstack">Call Stack</TabsTrigger>
          <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
        </TabsList>

        {/* Variables */}
        <TabsContent value="variables" className="flex-1 overflow-auto p-3">
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded p-2 text-sm font-mono"
              >
                <div className="flex items-center gap-2">
                  {variable.expandable && <ChevronDown className="w-4 h-4" />}
                  <span className="text-gray-300">{variable.name}</span>
                  <span className="text-gray-500">:</span>
                  <span className="text-blue-300">{variable.type}</span>
                  <span className="text-gray-500">=</span>
                  <span className="text-green-300">{variable.value}</span>
                </div>
                {variable.expandable && variable.children && (
                  <div className="ml-6 mt-1 text-xs space-y-1">
                    {variable.children.map((child, i) => (
                      <div key={i} className="text-gray-400">
                        {child.name}: <span className="text-green-300">{child.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Watch Expressions */}
        <TabsContent value="watch" className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="Add watch expression"
              value={newWatchExpr}
              onChange={(e) => setNewWatchExpr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddWatchExpression()}
              className="flex-1 text-sm bg-gray-800 border-gray-700 text-white"
            />
            <Button size="sm" onClick={handleAddWatchExpression}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {watchExpressions.map((expr) => (
              <div key={expr.id} className="bg-gray-800/50 rounded p-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono">
                    <span className="text-gray-300">{expr.expression}</span>
                    <span className="text-gray-500">: </span>
                    <span className="text-green-300">{expr.value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWatchExpression(expr.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Call Stack */}
        <TabsContent value="callstack" className="flex-1 overflow-auto p-3">
          <div className="space-y-1">
            {callStack.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`w-full text-left p-2 rounded text-sm transition ${
                  selectedFrame === frame.id
                    ? "bg-blue-600/20 border-l-2 border-blue-500"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <div className="font-mono">
                  <span className="text-yellow-300">{frame.name}</span>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {frame.file}:{frame.line}:{frame.column}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Breakpoints */}
        <TabsContent value="breakpoints" className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="mb-3 space-y-2 pb-3 border-b border-gray-700">
            <div className="text-xs font-semibold text-gray-400">Add Breakpoint</div>
            <div className="flex gap-2">
              <Input
                placeholder="File"
                value={newBreakpointFile}
                onChange={(e) => setNewBreakpointFile(e.target.value)}
                className="flex-1 text-sm bg-gray-800 border-gray-700 text-white"
              />
              <Input
                placeholder="Line"
                type="number"
                value={newBreakpointLine}
                onChange={(e) => setNewBreakpointLine(e.target.value)}
                className="w-20 text-sm bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Input
              placeholder="Condition (optional)"
              value={newBreakpointCondition}
              onChange={(e) => setNewBreakpointCondition(e.target.value)}
              className="text-sm bg-gray-800 border-gray-700 text-white"
            />
            <Button
              size="sm"
              onClick={handleAddBreakpoint}
              className="w-full"
            >
              Add Breakpoint
            </Button>
          </div>

          <div className="flex-1 overflow-auto space-y-1 mb-3">
            {breakpoints.map((bp) => (
              <div
                key={bp.id}
                className="bg-gray-800/50 rounded p-2 text-sm flex items-start justify-between"
              >
                <div className="flex items-start gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={bp.enabled}
                    onChange={() => handleToggleBreakpoint(bp.id)}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <div className="font-mono text-gray-300">
                      {bp.file}:{bp.line}
                    </div>
                    {bp.condition && (
                      <div className="text-xs text-gray-400 mt-1">
                        Condition: {bp.condition}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveBreakpoint(bp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {breakpoints.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllBreakpoints}
              className="text-red-400"
            >
              Clear All Breakpoints
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
