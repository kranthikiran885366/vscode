"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Command,
  Search,
  FileText,
  Folder,
  Settings,
  Palette,
  Terminal,
  GitBranch,
  Bug,
  Package,
  Play,
  Square,
  RefreshCw,
  Users,
  Monitor,
  Bot,
  Code,
  TestTube,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useEditor } from "../lib/editor-store"

interface CommandItem {
  id: string
  label: string
  description?: string
  shortcut?: string
  category: string
  icon: any
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { state, dispatch } = useEditor()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: CommandItem[] = [
    // File Commands
    {
      id: "file.new",
      label: "New File",
      description: "Create a new file",
      shortcut: "⌘N",
      category: "File",
      icon: FileText,
      action: () => console.log("New file"),
      keywords: ["create", "new", "file"],
    },
    {
      id: "file.open",
      label: "Open File",
      description: "Open an existing file",
      shortcut: "⌘O",
      category: "File",
      icon: Folder,
      action: () => console.log("Open file"),
      keywords: ["open", "file"],
    },
    {
      id: "file.save",
      label: "Save File",
      description: "Save the current file",
      shortcut: "⌘S",
      category: "File",
      icon: FileText,
      action: () => console.log("Save file"),
      keywords: ["save", "file"],
    },

    // View Commands
    {
      id: "view.explorer",
      label: "Show Explorer",
      description: "Open the file explorer",
      shortcut: "⌘⇧E",
      category: "View",
      icon: Folder,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" }),
      keywords: ["explorer", "files", "tree"],
    },
    {
      id: "view.search",
      label: "Show Search",
      description: "Open the search panel",
      shortcut: "⌘⇧F",
      category: "View",
      icon: Search,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "search" }),
      keywords: ["search", "find"],
    },
    {
      id: "view.git",
      label: "Show Source Control",
      description: "Open source control panel",
      shortcut: "⌃⇧G",
      category: "View",
      icon: GitBranch,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "git" }),
      keywords: ["git", "source", "control", "version"],
    },
    {
      id: "view.debug",
      label: "Show Debug",
      description: "Open the debug panel",
      shortcut: "⌘⇧D",
      category: "View",
      icon: Bug,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "debug" }),
      keywords: ["debug", "breakpoint"],
    },
    {
      id: "view.extensions",
      label: "Show Extensions",
      description: "Open extensions marketplace",
      shortcut: "⌘⇧X",
      category: "View",
      icon: Package,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "extensions" }),
      keywords: ["extensions", "plugins", "marketplace"],
    },
    {
      id: "view.terminal",
      label: "Show Terminal",
      description: "Open integrated terminal",
      shortcut: "⌃`",
      category: "View",
      icon: Terminal,
      action: () => dispatch({ type: "SET_ACTIVE_BOTTOM_PANEL", payload: "terminal" }),
      keywords: ["terminal", "console", "shell"],
    },

    // AI Commands
    {
      id: "ai.chat",
      label: "Open AI Assistant",
      description: "Start chatting with AI",
      category: "AI",
      icon: Bot,
      action: () => dispatch({ type: "TOGGLE_AI_CHAT" }),
      keywords: ["ai", "assistant", "chat", "help"],
    },
    {
      id: "ai.explain",
      label: "AI: Explain Code",
      description: "Get AI explanation of selected code",
      category: "AI",
      icon: Code,
      action: () => {
        dispatch({ type: "TOGGLE_AI_CHAT" })
        dispatch({
          type: "ADD_CHAT_MESSAGE",
          payload: {
            id: Date.now().toString(),
            type: "user",
            content: "Can you explain this code?",
            timestamp: new Date(),
          },
        })
      },
      keywords: ["explain", "ai", "code", "help"],
    },
    {
      id: "ai.refactor",
      label: "AI: Refactor Code",
      description: "Get AI suggestions for refactoring",
      category: "AI",
      icon: RefreshCw,
      action: () => {
        dispatch({ type: "TOGGLE_AI_CHAT" })
        dispatch({
          type: "ADD_CHAT_MESSAGE",
          payload: {
            id: Date.now().toString(),
            type: "user",
            content: "How can I refactor this code?",
            timestamp: new Date(),
          },
        })
      },
      keywords: ["refactor", "ai", "improve", "optimize"],
    },
    {
      id: "ai.test",
      label: "AI: Generate Tests",
      description: "Generate unit tests with AI",
      category: "AI",
      icon: TestTube,
      action: () => {
        dispatch({ type: "TOGGLE_AI_CHAT" })
        dispatch({
          type: "ADD_CHAT_MESSAGE",
          payload: {
            id: Date.now().toString(),
            type: "user",
            content: "Generate unit tests for this function",
            timestamp: new Date(),
          },
        })
      },
      keywords: ["test", "ai", "unit", "generate"],
    },

    // Collaboration Commands
    {
      id: "collab.start",
      label: "Start Live Share",
      description: "Begin collaborative session",
      category: "Collaboration",
      icon: Users,
      action: () => dispatch({ type: "SET_COLLABORATION", payload: true }),
      keywords: ["collaborate", "share", "live", "team"],
    },
    {
      id: "collab.stop",
      label: "Stop Live Share",
      description: "End collaborative session",
      category: "Collaboration",
      icon: Users,
      action: () => dispatch({ type: "SET_COLLABORATION", payload: false }),
      keywords: ["stop", "end", "collaboration"],
    },

    // Preview Commands
    {
      id: "preview.start",
      label: "Start Live Preview",
      description: "Launch live preview server",
      category: "Preview",
      icon: Play,
      action: () => {
        dispatch({
          type: "SET_LIVE_PREVIEW",
          payload: {
            url: "http://localhost:3000",
            status: "ready",
            port: 3000,
          },
        })
      },
      keywords: ["preview", "start", "server", "live"],
    },
    {
      id: "preview.stop",
      label: "Stop Live Preview",
      description: "Stop preview server",
      category: "Preview",
      icon: Square,
      action: () => {
        dispatch({
          type: "SET_LIVE_PREVIEW",
          payload: {
            url: "",
            status: "error",
            port: 3000,
          },
        })
      },
      keywords: ["preview", "stop", "server"],
    },

    // Theme Commands
    {
      id: "theme.toggle",
      label: "Toggle Theme",
      description: "Switch between light and dark theme",
      category: "Preferences",
      icon: Palette,
      action: () => dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" }),
      keywords: ["theme", "dark", "light", "toggle"],
    },
    {
      id: "zen.toggle",
      label: "Toggle Zen Mode",
      description: "Enter distraction-free mode",
      shortcut: "⌘K Z",
      category: "View",
      icon: Monitor,
      action: () => dispatch({ type: "TOGGLE_ZEN_MODE" }),
      keywords: ["zen", "focus", "distraction", "free"],
    },

    // Settings
    {
      id: "settings.open",
      label: "Open Settings",
      description: "Open user settings",
      shortcut: "⌘,",
      category: "Preferences",
      icon: Settings,
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "settings" }),
      keywords: ["settings", "preferences", "config"],
    },
  ]

  const filteredCommands = commands.filter((command) => {
    if (!query) return true

    const searchText = query.toLowerCase()
    return (
      command.label.toLowerCase().includes(searchText) ||
      command.description?.toLowerCase().includes(searchText) ||
      command.category.toLowerCase().includes(searchText) ||
      command.keywords?.some((keyword) => keyword.toLowerCase().includes(searchText))
    )
  })

  const groupedCommands = filteredCommands.reduce(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = []
      }
      acc[command.category].push(command)
      return acc
    },
    {} as Record<string, CommandItem[]>,
  )

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
        onClose()
      }
    }
  }

  const handleCommandClick = (command: CommandItem) => {
    command.action()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Command className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 border-none shadow-none focus-visible:ring-0 text-lg"
            />
          </div>
        </div>

        {/* Commands */}
        <div className="max-h-80 overflow-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands], categoryIndex) => (
                <div key={category}>
                  {categoryIndex > 0 && <Separator />}
                  <div className="px-4 py-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{category}</div>
                    {categoryCommands.map((command, commandIndex) => {
                      const globalIndex = filteredCommands.indexOf(command)
                      const isSelected = globalIndex === selectedIndex

                      return (
                        <div
                          key={command.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => handleCommandClick(command)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <command.icon className="w-4 h-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{command.label}</div>
                              {command.description && (
                                <div className="text-sm text-gray-500 truncate">{command.description}</div>
                              )}
                            </div>
                          </div>
                          {command.shortcut && (
                            <Badge variant="secondary" className="text-xs font-mono">
                              {command.shortcut}
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <div>{filteredCommands.length} commands</div>
          </div>
        </div>
      </div>
    </div>
  )
}
