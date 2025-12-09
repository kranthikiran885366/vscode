"use client"

import { useState, useRef, useEffect } from "react"
import {
  Terminal as TerminalIcon,
  X,
  Plus,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface TerminalSession {
  id: string
  name: string
  output: string[]
  isActive: boolean
}

const builtInCommands: Record<string, (args: string[]) => string> = {
  help: () =>
    `Available commands:
  help      - Show this help message
  clear     - Clear terminal
  ls        - List files
  pwd       - Print working directory
  cd        - Change directory
  cat       - Display file contents
  echo      - Print text
  date      - Show current date/time
  whoami    - Show current user
  npm       - Node package manager
  yarn      - Yarn package manager
  git       - Git commands`,
  clear: () => "",
  pwd: () => "/home/user/project",
  ls: () => `src/
components/
public/
package.json
README.md`,
  whoami: () => "developer",
  date: () => new Date().toString(),
  echo: (args: string[]) => args.join(" "),
  cat: (args: string[]) => {
    if (args[0] === "package.json") {
      return `{
  "name": "vs-code-ide",
  "version": "1.0.0",
  "description": "VS Code-like IDE"
}`;
    }
    return `cat: ${args[0]}: No such file or directory`;
  },
}

export function EnhancedTerminal() {
  const [terminals, setTerminals] = useState<TerminalSession[]>([
    {
      id: "1",
      name: "bash",
      output: [
        "Welcome to Advanced Terminal",
        "Type 'help' for available commands",
        "$ ",
      ],
      isActive: true,
    },
  ])
  const [activeTerminal, setActiveTerminal] = useState("1")
  const [command, setCommand] = useState("")
  const [isMaximized, setIsMaximized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminals])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeTerminal])

  const executeCommand = (cmd: string) => {
    const [commandName, ...args] = cmd.trim().split(/\s+/)
    const handler = builtInCommands[commandName]
    const output = handler ? handler(args) : `Command not found: ${commandName}`
    return output
  }

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return
    e.preventDefault()

    const currentTerminal = terminals.find((t) => t.id === activeTerminal)
    if (!currentTerminal) return

    const newOutput = [...currentTerminal.output]
    newOutput[newOutput.length - 1] = `$ ${command}`

    if (command.trim() === "clear") {
      newOutput.length = 0
    } else if (command.trim()) {
      const result = executeCommand(command)
      if (result) {
        newOutput.push(result)
      }
    }

    newOutput.push("$ ")

    setTerminals((prev) =>
      prev.map((t) =>
        t.id === activeTerminal ? { ...t, output: newOutput } : t
      )
    )
    setCommand("")
  }

  const handleCreateTerminal = () => {
    const newId = Date.now().toString()
    const newTerminal: TerminalSession = {
      id: newId,
      name: `Terminal ${terminals.length + 1}`,
      output: [
        "Welcome to Advanced Terminal",
        "Type 'help' for available commands",
        "$ ",
      ],
      isActive: true,
    }
    setTerminals((prev) => [...prev, newTerminal])
    setActiveTerminal(newId)
  }

  const handleCloseTerminal = (id: string) => {
    const remaining = terminals.filter((t) => t.id !== id)
    if (remaining.length === 0) {
      handleCreateTerminal()
    } else {
      setTerminals(remaining)
      setActiveTerminal(remaining[0].id)
    }
  }

  const currentTerminal = terminals.find((t) => t.id === activeTerminal)

  const handleCopyTerminalContent = () => {
    const text = currentTerminal?.output.join("\n") || ""
    navigator.clipboard.writeText(text)
  }

  const handleClearTerminal = () => {
    setTerminals((prev) =>
      prev.map((t) =>
        t.id === activeTerminal
          ? { ...t, output: ["$ "] }
          : t
      )
    )
  }

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col border-t border-gray-700 ${
        isMaximized ? "fixed inset-0 z-50" : "h-64"
      }`}
    >
      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
        <Tabs
          value={activeTerminal}
          onValueChange={setActiveTerminal}
          className="flex-1"
        >
          <TabsList className="bg-gray-800 rounded-none border-0 m-0 w-full justify-start">
            {terminals.map((terminal) => (
              <div key={terminal.id} className="flex items-center relative">
                <TabsTrigger
                  value={terminal.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                >
                  <TerminalIcon className="w-4 h-4 mr-2" />
                  {terminal.name}
                </TabsTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCloseTerminal(terminal.id)}
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1 px-2 border-l border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateTerminal}
            title="New Terminal"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTerminalContent}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearTerminal}
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm"
      >
        {currentTerminal?.output.map((line, index) => (
          <div
            key={index}
            className={line.startsWith("$") ? "text-green-400" : "text-gray-300"}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 flex items-center px-3 py-2">
        <span className="text-green-400 mr-2 font-mono">$</span>
        <Input
          ref={inputRef}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleCommand}
          className="bg-gray-800 border-0 text-white font-mono text-sm p-0"
          placeholder="Type command..."
        />
      </div>

      {isMaximized && (
        <Button
          variant="outline"
          onClick={() => setIsMaximized(false)}
          className="absolute top-4 right-4"
        >
          Close
        </Button>
      )}
    </div>
  )
}
