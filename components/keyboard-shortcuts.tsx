"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Shortcut {
  command: string
  mac: string
  windows: string
  linux: string
  description: string
  category: string
}

interface KeyboardShortcutsProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [platform, setPlatform] = useState<"mac" | "windows" | "linux">("windows")

  const shortcuts: Shortcut[] = [
    // Editor
    {
      command: "Save",
      mac: "⌘S",
      windows: "Ctrl+S",
      linux: "Ctrl+S",
      description: "Save the current file",
      category: "Editor",
    },
    {
      command: "Save All",
      mac: "⌘K ⌘S",
      windows: "Ctrl+K Ctrl+S",
      linux: "Ctrl+K Ctrl+S",
      description: "Save all open files",
      category: "Editor",
    },
    {
      command: "Close Editor",
      mac: "⌘W",
      windows: "Ctrl+W",
      linux: "Ctrl+W",
      description: "Close the active editor",
      category: "Editor",
    },
    {
      command: "Toggle Sidebar",
      mac: "⌘B",
      windows: "Ctrl+B",
      linux: "Ctrl+B",
      description: "Toggle the sidebar visibility",
      category: "Editor",
    },
    {
      command: "Word Wrap",
      mac: "⌥Z",
      windows: "Alt+Z",
      linux: "Alt+Z",
      description: "Toggle word wrapping",
      category: "Editor",
    },

    // View
    {
      command: "Command Palette",
      mac: "⌘⇧P",
      windows: "Ctrl+Shift+P",
      linux: "Ctrl+Shift+P",
      description: "Show all available commands",
      category: "View",
    },
    {
      command: "Explorer",
      mac: "⌘⇧E",
      windows: "Ctrl+Shift+E",
      linux: "Ctrl+Shift+E",
      description: "Open file explorer",
      category: "View",
    },
    {
      command: "Search",
      mac: "⌘⇧F",
      windows: "Ctrl+Shift+F",
      linux: "Ctrl+Shift+F",
      description: "Open search panel",
      category: "View",
    },
    {
      command: "Source Control",
      mac: "⌃⇧G",
      windows: "Ctrl+Shift+G",
      linux: "Ctrl+Shift+G",
      description: "Open git panel",
      category: "View",
    },
    {
      command: "Debug",
      mac: "⌘⇧D",
      windows: "Ctrl+Shift+D",
      linux: "Ctrl+Shift+D",
      description: "Open debug panel",
      category: "View",
    },
    {
      command: "Extensions",
      mac: "⌘⇧X",
      windows: "Ctrl+Shift+X",
      linux: "Ctrl+Shift+X",
      description: "Open extensions",
      category: "View",
    },
    {
      command: "Terminal",
      mac: "⌃`",
      windows: "Ctrl+`",
      linux: "Ctrl+`",
      description: "Open terminal",
      category: "View",
    },
    {
      command: "Problems",
      mac: "⌘⇧M",
      windows: "Ctrl+Shift+M",
      linux: "Ctrl+Shift+M",
      description: "Show problems panel",
      category: "View",
    },
    {
      command: "Zen Mode",
      mac: "⌘K Z",
      windows: "Ctrl+K Z",
      linux: "Ctrl+K Z",
      description: "Toggle zen mode",
      category: "View",
    },

    // Edit
    {
      command: "Undo",
      mac: "⌘Z",
      windows: "Ctrl+Z",
      linux: "Ctrl+Z",
      description: "Undo last action",
      category: "Edit",
    },
    {
      command: "Redo",
      mac: "⌘⇧Z",
      windows: "Ctrl+Shift+Z",
      linux: "Ctrl+Shift+Z",
      description: "Redo last action",
      category: "Edit",
    },
    {
      command: "Cut",
      mac: "⌘X",
      windows: "Ctrl+X",
      linux: "Ctrl+X",
      description: "Cut selection",
      category: "Edit",
    },
    {
      command: "Copy",
      mac: "⌘C",
      windows: "Ctrl+C",
      linux: "Ctrl+C",
      description: "Copy selection",
      category: "Edit",
    },
    {
      command: "Paste",
      mac: "⌘V",
      windows: "Ctrl+V",
      linux: "Ctrl+V",
      description: "Paste from clipboard",
      category: "Edit",
    },
    {
      command: "Find",
      mac: "⌘F",
      windows: "Ctrl+F",
      linux: "Ctrl+F",
      description: "Open find dialog",
      category: "Edit",
    },
    {
      command: "Replace",
      mac: "⌘⌥F",
      windows: "Ctrl+H",
      linux: "Ctrl+H",
      description: "Open find and replace",
      category: "Edit",
    },

    // Run
    {
      command: "Run Code",
      mac: "⌃⌘R",
      windows: "Ctrl+Alt+N",
      linux: "Ctrl+Alt+N",
      description: "Execute the current file",
      category: "Run",
    },
    {
      command: "Start Debugging",
      mac: "F5",
      windows: "F5",
      linux: "F5",
      description: "Start debugging session",
      category: "Run",
    },
    {
      command: "Toggle Breakpoint",
      mac: "F9",
      windows: "F9",
      linux: "F9",
      description: "Toggle breakpoint on current line",
      category: "Run",
    },

    // Navigation
    {
      command: "Go to Line",
      mac: "⌃G",
      windows: "Ctrl+G",
      linux: "Ctrl+G",
      description: "Go to a specific line",
      category: "Navigation",
    },
    {
      command: "Go to File",
      mac: "⌘P",
      windows: "Ctrl+P",
      linux: "Ctrl+P",
      description: "Quick file opener",
      category: "Navigation",
    },
    {
      command: "Go to Symbol",
      mac: "⌘⇧O",
      windows: "Ctrl+Shift+O",
      linux: "Ctrl+Shift+O",
      description: "Go to symbol in file",
      category: "Navigation",
    },
    {
      command: "Next Tab",
      mac: "⌥⌘→",
      windows: "Ctrl+Tab",
      linux: "Ctrl+Tab",
      description: "Switch to next tab",
      category: "Navigation",
    },
    {
      command: "Previous Tab",
      mac: "⌥⌘←",
      windows: "Ctrl+Shift+Tab",
      linux: "Ctrl+Shift+Tab",
      description: "Switch to previous tab",
      category: "Navigation",
    },
  ]

  const filteredShortcuts = shortcuts.filter(
    (s) =>
      s.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedShortcuts = filteredShortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    },
    {} as Record<string, Shortcut[]>
  )

  const getKeyboardKey = (shortcut: Shortcut) => {
    switch (platform) {
      case "mac":
        return shortcut.mac
      case "windows":
        return shortcut.windows
      case "linux":
        return shortcut.linux
      default:
        return shortcut.windows
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Platform Selector */}
        <div className="px-6 py-3 border-b border-gray-700 flex items-center gap-4">
          <span className="text-sm text-gray-400">Platform:</span>
          <div className="flex gap-2">
            {["mac", "windows", "linux"].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={platform === p ? "default" : "outline"}
                onClick={() => setPlatform(p as any)}
                className="h-7 px-3 text-xs"
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              placeholder="Search shortcuts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-xs bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {Object.keys(groupedShortcuts).length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p className="text-sm">No shortcuts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <div className="sticky top-0 bg-gray-800 px-6 py-2 z-10">
                    <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                      {category}
                    </h3>
                  </div>
                  {items.map((shortcut) => (
                    <div
                      key={shortcut.command}
                      className="px-6 py-3 hover:bg-gray-800 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="text-gray-200">{shortcut.command}</p>
                        <p className="text-xs text-gray-500">{shortcut.description}</p>
                      </div>
                      <kbd className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs font-mono">
                        {getKeyboardKey(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
