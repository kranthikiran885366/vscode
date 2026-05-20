"use client"

import { useState } from "react"
import { Palette, Plus, Download, Upload, Trash2, Edit, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ThemeColor {
  background: string
  foreground: string
  accent: string
  error: string
  warning: string
  info: string
  success: string
}

interface Theme {
  id: string
  name: string
  type: "light" | "dark" | "high-contrast"
  colors: ThemeColor
  isCustom: boolean
}

const defaultThemes: Theme[] = [
  {
    id: "1",
    name: "Dark (Default)",
    type: "dark",
    colors: {
      background: "#1e1e1e",
      foreground: "#d4d4d4",
      accent: "#007acc",
      error: "#f48771",
      warning: "#dcdcaa",
      info: "#4ec9b0",
      success: "#6a9955",
    },
    isCustom: false,
  },
  {
    id: "2",
    name: "Light",
    type: "light",
    colors: {
      background: "#ffffff",
      foreground: "#333333",
      accent: "#0066cc",
      error: "#e31c23",
      warning: "#d4a000",
      info: "#0098aa",
      success: "#008000",
    },
    isCustom: false,
  },
  {
    id: "3",
    name: "High Contrast",
    type: "high-contrast",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      accent: "#ffff00",
      error: "#ff0000",
      warning: "#ff8000",
      info: "#00ffff",
      success: "#00ff00",
    },
    isCustom: false,
  },
  {
    id: "4",
    name: "Nord",
    type: "dark",
    colors: {
      background: "#2e3440",
      foreground: "#eceff4",
      accent: "#88c0d0",
      error: "#bf616a",
      warning: "#ebcb8b",
      info: "#81a1c1",
      success: "#a3be8c",
    },
    isCustom: false,
  },
  {
    id: "5",
    name: "Dracula",
    type: "dark",
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      accent: "#8be9fd",
      error: "#ff5555",
      warning: "#f1fa8c",
      info: "#8be9fd",
      success: "#50fa7b",
    },
    isCustom: false,
  },
  {
    id: "6",
    name: "Solarized Dark",
    type: "dark",
    colors: {
      background: "#002b36",
      foreground: "#839496",
      accent: "#268bd2",
      error: "#dc322f",
      warning: "#b58900",
      info: "#2aa198",
      success: "#859900",
    },
    isCustom: false,
  },
]

export function ThemesManager() {
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(defaultThemes[0])
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    type: "dark",
    colors: {},
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateTheme = () => {
    if (!newTheme.name) {
      alert("Please enter a theme name")
      return
    }

    if (editingTheme) {
      setThemes((prev) =>
        prev.map((t) =>
          t.id === editingTheme.id
            ? { ...newTheme as Theme, id: editingTheme.id }
            : t
        )
      )
      setEditingTheme(null)
    } else {
      const theme: Theme = {
        id: Date.now().toString(),
        name: newTheme.name || "",
        type: (newTheme.type as any) || "dark",
        colors: newTheme.colors || defaultThemes[0].colors,
        isCustom: true,
      }
      setThemes((prev) => [...prev, theme])
    }

    setNewTheme({ type: "dark" })
    setIsDialogOpen(false)
  }

  const handleDeleteTheme = (id: string) => {
    if (!themes.find((t) => t.id === id)?.isCustom) {
      alert("Cannot delete built-in themes")
      return
    }
    setThemes((prev) => prev.filter((t) => t.id !== id))
  }

  const handleEditTheme = (theme: Theme) => {
    if (!theme.isCustom) {
      alert("Cannot edit built-in themes. Create a copy instead.")
      return
    }
    setEditingTheme(theme)
    setNewTheme(theme)
    setIsDialogOpen(true)
  }

  const handleExportTheme = (theme: Theme) => {
    const data = JSON.stringify(theme, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${theme.name.replace(/\s+/g, "-").toLowerCase()}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTheme = async (file: File) => {
    const text = await file.text()
    try {
      const imported = JSON.parse(text)
      imported.id = Date.now().toString()
      imported.isCustom = true
      setThemes((prev) => [...prev, imported])
    } catch (error) {
      alert("Failed to import theme")
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Themes
      </h2>

      <div className="flex gap-2 mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTheme(null)
                setNewTheme({
                  type: "dark",
                  colors: { ...defaultThemes[0].colors },
                })
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTheme ? "Edit Theme" : "Create New Theme"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={newTheme.name || ""}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, name: e.target.value })
                  }
                  placeholder="Theme name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newTheme.type || ""}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, type: e.target.value as any })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="high-contrast">High Contrast</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "background",
                  "foreground",
                  "accent",
                  "error",
                  "warning",
                  "info",
                  "success",
                ].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {key}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={
                          (newTheme.colors?.[key as keyof ThemeColor] as string) ||
                          "#000000"
                        }
                        onChange={(e) =>
                          setNewTheme({
                            ...newTheme,
                            colors: {
                              ...(newTheme.colors || {}),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={
                          (newTheme.colors?.[key as keyof ThemeColor] as string) ||
                          ""
                        }
                        onChange={(e) =>
                          setNewTheme({
                            ...newTheme,
                            colors: {
                              ...(newTheme.colors || {}),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTheme} className="gap-2">
                  <Check className="w-4 h-4" />
                  {editingTheme ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <span>
              <Upload className="w-4 h-4" />
              Import
            </span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={(e) =>
              e.target.files?.[0] && handleImportTheme(e.target.files[0])
            }
            className="hidden"
          />
        </label>
      </div>

      <div className="flex-1 overflow-auto space-y-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedTheme.id === theme.id
                ? "bg-gray-800 border-blue-500"
                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{theme.name}</h3>
                <span className="text-xs text-gray-400 capitalize">
                  {theme.type} • {theme.isCustom ? "Custom" : "Built-in"}
                </span>
              </div>
              <div className="flex gap-2">
                {theme.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditTheme(theme)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExportTheme(theme)
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                {theme.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTheme(theme.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[
                "background",
                "foreground",
                "accent",
                "error",
                "warning",
                "info",
                "success",
              ].map((key) => (
                <div
                  key={key}
                  className="flex flex-col items-center"
                  title={key}
                >
                  <div
                    className="w-8 h-8 rounded border border-gray-600"
                    style={{
                      backgroundColor:
                        theme.colors[key as keyof ThemeColor],
                    }}
                  />
                  <span className="text-xs text-gray-500 mt-1 capitalize">
                    {key.substring(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
