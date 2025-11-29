"use client"

import { useState } from "react"
import {
  X,
  ChevronDown,
  ChevronRight,
  Search,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditor } from "../lib/editor-store"

interface SettingCategory {
  id: string
  name: string
  icon: string
  settings: Setting[]
}

interface Setting {
  id: string
  name: string
  description: string
  type: "toggle" | "select" | "number" | "text" | "color"
  value: any
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
}

export function SettingsPanel() {
  const { state, dispatch } = useEditor()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("editor")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["editor", "files", "terminal"])
  )

  const [settings, setSettings] = useState<Record<string, SettingCategory>>({
    editor: {
      id: "editor",
      name: "Editor",
      icon: "code",
      settings: [
        {
          id: "font-family",
          name: "Font Family",
          description: "Font used in the editor",
          type: "select",
          value: "Fira Code",
          options: [
            { label: "Fira Code", value: "Fira Code" },
            { label: "Consolas", value: "Consolas" },
            { label: "Monaco", value: "Monaco" },
            { label: "Courier New", value: "Courier New" },
          ],
        },
        {
          id: "font-size",
          name: "Font Size",
          description: "Font size in pixels",
          type: "number",
          value: 14,
          min: 8,
          max: 32,
        },
        {
          id: "line-height",
          name: "Line Height",
          description: "Line height multiplier",
          type: "number",
          value: 1.5,
          min: 1,
          max: 3,
        },
        {
          id: "word-wrap",
          name: "Word Wrap",
          description: "Enable word wrapping",
          type: "toggle",
          value: true,
        },
        {
          id: "minimap",
          name: "Minimap",
          description: "Show minimap in editor",
          type: "toggle",
          value: true,
        },
        {
          id: "line-numbers",
          name: "Line Numbers",
          description: "Show line numbers",
          type: "toggle",
          value: true,
        },
        {
          id: "indent-size",
          name: "Indent Size",
          description: "Number of spaces for indentation",
          type: "number",
          value: 2,
          min: 1,
          max: 8,
        },
        {
          id: "insert-spaces",
          name: "Insert Spaces",
          description: "Use spaces instead of tabs",
          type: "toggle",
          value: true,
        },
        {
          id: "format-on-save",
          name: "Format on Save",
          description: "Automatically format code on save",
          type: "toggle",
          value: true,
        },
      ],
    },
    theme: {
      id: "theme",
      name: "Theme",
      icon: "palette",
      settings: [
        {
          id: "theme",
          name: "Color Theme",
          description: "Choose color theme",
          type: "select",
          value: "dark",
          options: [
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
            { label: "High Contrast", value: "high-contrast" },
          ],
        },
        {
          id: "bracket-matching",
          name: "Bracket Pair Colorization",
          description: "Colorize matching brackets",
          type: "toggle",
          value: true,
        },
        {
          id: "cursor-smooth",
          name: "Smooth Cursor Animation",
          description: "Enable smooth cursor animation",
          type: "toggle",
          value: true,
        },
      ],
    },
    files: {
      id: "files",
      name: "Files",
      icon: "files",
      settings: [
        {
          id: "auto-save",
          name: "Auto Save",
          description: "Automatically save files",
          type: "toggle",
          value: false,
        },
        {
          id: "auto-save-delay",
          name: "Auto Save Delay",
          description: "Delay in milliseconds",
          type: "number",
          value: 1000,
          min: 100,
          max: 10000,
        },
        {
          id: "exclude-dirs",
          name: "Exclude Directories",
          description: "Directories to exclude from explorer",
          type: "text",
          value: "node_modules, .git, .vscode",
        },
      ],
    },
    terminal: {
      id: "terminal",
      name: "Terminal",
      icon: "terminal",
      settings: [
        {
          id: "shell",
          name: "Default Shell",
          description: "Default shell to use",
          type: "select",
          value: "bash",
          options: [
            { label: "Bash", value: "bash" },
            { label: "Zsh", value: "zsh" },
            { label: "Fish", value: "fish" },
            { label: "PowerShell", value: "powershell" },
          ],
        },
        {
          id: "terminal-font-size",
          name: "Font Size",
          description: "Terminal font size",
          type: "number",
          value: 12,
          min: 8,
          max: 24,
        },
        {
          id: "cursor-blinking",
          name: "Cursor Blinking",
          description: "Enable cursor blinking",
          type: "toggle",
          value: true,
        },
      ],
    },
  })

  const categories = Object.values(settings)

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const updateSetting = (categoryId: string, settingId: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        settings: prev[categoryId].settings.map((s) =>
          s.id === settingId ? { ...s, value } : s
        ),
      },
    }))
  }

  const filteredCategories = categories.filter((category) =>
    category.settings.some((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const renderSettingInput = (
    setting: Setting,
    categoryId: string
  ) => {
    switch (setting.type) {
      case "toggle":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) =>
                updateSetting(categoryId, setting.id, e.target.checked)
              }
              className="w-4 h-4 rounded"
            />
          </label>
        )
      case "number":
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) =>
              updateSetting(categoryId, setting.id, parseFloat(e.target.value))
            }
            min={setting.min}
            max={setting.max}
            step={setting.type === "number" && setting.id.includes("height") ? "0.1" : "1"}
            className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        )
      case "text":
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) =>
              updateSetting(categoryId, setting.id, e.target.value)
            }
            className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          />
        )
      case "select":
        return (
          <Select value={setting.value} onValueChange={(value) =>
            updateSetting(categoryId, setting.id, value)
          }>
            <SelectTrigger className="w-40 h-8 bg-gray-800 border-gray-700 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {setting.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "color":
        return (
          <input
            type="color"
            value={setting.value}
            onChange={(e) =>
              updateSetting(categoryId, setting.id, e.target.value)
            }
            className="w-12 h-8 rounded cursor-pointer"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold">Settings</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No settings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <button
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                  onClick={() => toggleCategory(category.id)}
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm">{category.name}</span>
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="divide-y divide-gray-800 bg-gray-800/30">
                    {category.settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="px-8 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-200">{setting.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {setting.description}
                          </p>
                        </div>
                        <div className="ml-4">
                          {renderSettingInput(setting, category.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="px-4 py-3 border-t border-gray-700">
        <Button variant="outline" className="w-full h-8 text-xs flex items-center justify-center gap-1">
          <RotateCcw className="w-3 h-3" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
