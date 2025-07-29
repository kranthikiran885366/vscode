"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { TerminalIcon, X, Plus, Maximize2, Minimize2, ChevronDown, Copy, Trash2, Split } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Terminal {
  id: string
  name: string
  shell: "bash" | "cmd" | "powershell" | "zsh"
  output: string[]
  cwd: string
}

interface TerminalProps {
  visible: boolean
  onToggle: () => void
  height?: number
  onHeightChange?: (height: number) => void
}

export function Terminal({ visible, onToggle, height = 300, onHeightChange }: TerminalProps) {
  const [terminals, setTerminals] = useState<Terminal[]>([
    {
      id: "1",
      name: "Terminal 1",
      shell: "bash",
      output: ["Welcome to Zet Code Studio Terminal", "$ "],
      cwd: "/workspace",
    },
  ])
  const [activeTerminal, setActiveTerminal] = useState("1")
  const [input, setInput] = useState("")
  const [isMaximized, setIsMaximized] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const shellPrompts = {
    bash: "$ ",
    zsh: "% ",
    cmd: "C:\\> ",
    powershell: "PS> ",
  }

  const executeCommand = (command: string) => {
    const terminal = terminals.find((t) => t.id === activeTerminal)
    if (!terminal) return

    const newOutput = [...terminal.output]
    const prompt = shellPrompts[terminal.shell]

    // Add command to output
    newOutput[newOutput.length - 1] += command

    // Add to command history
    if (command.trim()) {
      setCommandHistory((prev) => [...prev, command.trim()])
    }

    // Simulate command execution
    if (command.trim()) {
      if (command.trim() === "clear") {
        newOutput.length = 0
        newOutput.push(prompt)
      } else if (command.trim() === "ls" || command.trim() === "dir") {
        newOutput.push("", "package.json  src/  public/  README.md  node_modules/", prompt)
      } else if (command.trim().startsWith("echo ")) {
        const text = command.trim().substring(5)
        newOutput.push("", text, prompt)
      } else if (command.trim() === "pwd") {
        newOutput.push("", terminal.cwd, prompt)
      } else if (command.trim() === "date") {
        newOutput.push("", new Date().toString(), prompt)
      } else if (command.trim() === "whoami") {
        newOutput.push("", "developer", prompt)
      } else if (command.trim().startsWith("cd ")) {
        const path = command.trim().substring(3)
        newOutput.push("", prompt)
        // Update cwd (simplified)
        setTerminals((prev) =>
          prev.map((t) =>
            t.id === activeTerminal ? { ...t, cwd: path.startsWith("/") ? path : `${t.cwd}/${path}` } : t,
          ),
        )
      } else if (command.trim() === "npm start") {
        newOutput.push("", "Starting development server...", "Local: http://localhost:3000", prompt)
      } else {
        newOutput.push("", `Command '${command.trim()}' not found`, prompt)
      }
    } else {
      newOutput.push("", prompt)
    }

    setTerminals((prev) => prev.map((t) => (t.id === activeTerminal ? { ...t, output: newOutput } : t)))
    setInput("")
    setHistoryIndex(-1)
  }

  const addTerminal = (shell: "bash" | "cmd" | "powershell" | "zsh" = "bash") => {
    const newId = (terminals.length + 1).toString()
    const newTerminal: Terminal = {
      id: newId,
      name: `Terminal ${newId}`,
      shell,
      output: [`Welcome to Zet Code Studio Terminal (${shell})`, shellPrompts[shell]],
      cwd: "/workspace",
    }
    setTerminals((prev) => [...prev, newTerminal])
    setActiveTerminal(newId)
  }

  const closeTerminal = (id: string) => {
    if (terminals.length === 1) return
    setTerminals((prev) => prev.filter((t) => t.id !== id))
    if (activeTerminal === id) {
      const remainingTerminals = terminals.filter((t) => t.id !== id)
      setActiveTerminal(remainingTerminals[0]?.id || "")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "")
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "")
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible, activeTerminal])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [terminals])

  if (!visible) return null

  const currentTerminal = terminals.find((t) => t.id === activeTerminal)

  return (
    <div
      className={`bg-gray-900 text-green-400 border-t border-gray-700 ${isMaximized ? "fixed inset-0 z-50" : ""}`}
      style={{ height: isMaximized ? "100vh" : `${height}px` }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-300">TERMINAL</span>
          </div>

          {/* Terminal Tabs */}
          <div className="flex gap-1">
            {terminals.map((terminal) => (
              <div
                key={terminal.id}
                className={`flex items-center gap-2 px-3 py-1 text-xs cursor-pointer rounded transition-colors ${
                  activeTerminal === terminal.id
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
                onClick={() => setActiveTerminal(terminal.id)}
              >
                <span>{terminal.name}</span>
                <span className="text-xs text-gray-500">({terminal.shell})</span>
                {terminals.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-3 h-3 p-0 hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTerminal(terminal.id)
                    }}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Plus className="w-4 h-4" />
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => addTerminal("bash")}>
                <TerminalIcon className="w-4 h-4 mr-2" />
                New Bash Terminal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTerminal("zsh")}>
                <TerminalIcon className="w-4 h-4 mr-2" />
                New Zsh Terminal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTerminal("powershell")}>
                <TerminalIcon className="w-4 h-4 mr-2" />
                New PowerShell Terminal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTerminal("cmd")}>
                <TerminalIcon className="w-4 h-4 mr-2" />
                New Command Prompt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Split className="w-4 h-4 mr-2" />
                Split Terminal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Copy className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Trash2 className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onToggle}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex flex-col h-full">
        <div
          ref={outputRef}
          className="flex-1 p-3 overflow-auto font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-600"
        >
          {currentTerminal?.output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-blue-400 mr-2">{currentTerminal?.cwd}</span>
            <span className="text-green-400">{shellPrompts[currentTerminal?.shell || "bash"]}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 text-green-400 ml-1"
              placeholder=""
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
