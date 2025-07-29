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
"use client"

import { useState, useEffect, useRef } from "react"
import { Terminal as TerminalIcon, X, Plus, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditor } from "../lib/editor-store"

interface TerminalSession {
  id: string
  name: string
  isActive: boolean
  output: string[]
}

export function Terminal() {
  const { state, dispatch } = useEditor()
  const [terminals, setTerminals] = useState<TerminalSession[]>([
    {
      id: "1",
      name: "Terminal 1",
      isActive: true,
      output: [
        "Welcome to Advanced Code Editor Terminal",
        "Type 'help' for available commands",
        "$ ",
      ],
    },
  ])
  const [activeTerminal, setActiveTerminal] = useState("1")
  const [input, setInput] = useState("")
  const [isMaximized, setIsMaximized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Auto-focus input when terminal is visible
    if (state.terminalVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state.terminalVisible])

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminals])

  const handleCommand = (command: string) => {
    if (!command.trim()) return

    const currentTerminal = terminals.find(t => t.id === activeTerminal)
    if (!currentTerminal) return

    // Add command to output
    const newOutput = [...currentTerminal.output]
    newOutput[newOutput.length - 1] = `$ ${command}`
    
    // Process command and add response
    const response = processCommand(command)
    newOutput.push(...response)
    newOutput.push("$ ")

    // Update terminal
    setTerminals(prev => prev.map(t => 
      t.id === activeTerminal 
        ? { ...t, output: newOutput }
        : t
    ))

    setInput("")
  }

  const processCommand = (command: string): string[] => {
    const cmd = command.trim().toLowerCase()
    
    switch (cmd) {
      case "help":
        return [
          "Available commands:",
          "  help     - Show this help message",
          "  clear    - Clear terminal output",
          "  ls       - List files in current directory",
          "  pwd      - Print working directory",
          "  date     - Show current date and time",
          "  echo     - Echo text back",
          "  npm run dev - Start development server",
        ]
      
      case "clear":
        setTerminals(prev => prev.map(t => 
          t.id === activeTerminal 
            ? { ...t, output: ["$ "] }
            : t
        ))
        return []
      
      case "ls":
        return [
          "src/",
          "public/",
          "components/",
          "package.json",
          "README.md",
          ".gitignore",
        ]
      
      case "pwd":
        return ["/workspace/project"]
      
      case "date":
        return [new Date().toString()]
      
      case "npm run dev":
        dispatch({ type: "SET_EXECUTION_STATUS", payload: "running" })
        return [
          "Starting development server...",
          "✓ Server started on http://localhost:3000",
        ]
      
      default:
        if (cmd.startsWith("echo ")) {
          return [cmd.substring(5)]
        }
        return [`Command not found: ${command}`]
    }
  }

  const createNewTerminal = () => {
    const newId = (terminals.length + 1).toString()
    const newTerminal: TerminalSession = {
      id: newId,
      name: `Terminal ${newId}`,
      isActive: true,
      output: [
        "Welcome to Advanced Code Editor Terminal",
        "$ ",
      ],
    }

    setTerminals(prev => [...prev, newTerminal])
    setActiveTerminal(newId)
  }

  const closeTerminal = (terminalId: string) => {
    setTerminals(prev => {
      const filtered = prev.filter(t => t.id !== terminalId)
      
      // If we closed the active terminal, switch to the first available
      if (terminalId === activeTerminal && filtered.length > 0) {
        setActiveTerminal(filtered[0].id)
      }
      
      return filtered
    })
  }

  if (!state.terminalVisible) return null

  return (
    <div className={`bg-black text-green-400 border-t border-gray-700 font-mono text-sm transition-all duration-200 ${
      isMaximized ? "fixed inset-0 z-50" : "h-64"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-xs font-semibold text-gray-300">Terminal</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={createNewTerminal}
          >
            <Plus className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => dispatch({ type: "TOGGLE_TERMINAL" })}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      {terminals.length > 1 ? (
        <Tabs value={activeTerminal} onValueChange={setActiveTerminal} className="h-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none w-full justify-start">
            {terminals.map((terminal) => (
              <TabsTrigger
                key={terminal.id}
                value={terminal.id}
                className="relative group data-[state=active]:bg-black data-[state=active]:text-green-400"
              >
                {terminal.name}
                {terminals.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTerminal(terminal.id)
                    }}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {terminals.map((terminal) => (
            <TabsContent key={terminal.id} value={terminal.id} className="flex-1 m-0">
              <TerminalContent
                terminal={terminal}
                input={input}
                setInput={setInput}
                onCommand={handleCommand}
                terminalRef={terminalRef}
                inputRef={inputRef}
                isActive={terminal.id === activeTerminal}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <TerminalContent
          terminal={terminals[0]}
          input={input}
          setInput={setInput}
          onCommand={handleCommand}
          terminalRef={terminalRef}
          inputRef={inputRef}
          isActive={true}
        />
      )}
    </div>
  )
}

interface TerminalContentProps {
  terminal: TerminalSession
  input: string
  setInput: (value: string) => void
  onCommand: (command: string) => void
  terminalRef: React.RefObject<HTMLDivElement>
  inputRef: React.RefObject<HTMLInputElement>
  isActive: boolean
}

function TerminalContent({ 
  terminal, 
  input, 
  setInput, 
  onCommand, 
  terminalRef, 
  inputRef,
  isActive 
}: TerminalContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 space-y-1"
      >
        {terminal.output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
        {/* Input line */}
        <div className="flex items-center">
          <span className="mr-1">$</span>
          <input
            ref={isActive ? inputRef : null}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCommand(input)
              }
            }}
            className="flex-1 bg-transparent outline-none border-none text-green-400 caret-green-400"
            autoFocus={isActive}
          />
        </div>
      </div>
    </div>
  )
}
