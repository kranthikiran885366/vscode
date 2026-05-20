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
    if (state.terminalVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state.terminalVisible])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminals])

  const handleCommand = (command: string) => {
    if (!command.trim()) return

    const currentTerminal = terminals.find(t => t.id === activeTerminal)
    if (!currentTerminal) return

    const newOutput = [...currentTerminal.output]
    newOutput[newOutput.length - 1] = `$ ${command}`
    
    const response = processCommand(command)
    newOutput.push(...response)
    newOutput.push("$ ")

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
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 space-y-1"
      >
        {terminal.output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        
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
