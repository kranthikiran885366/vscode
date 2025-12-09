"use client"

import { useState } from "react"
import { Settings, Download, Upload, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FormatterConfig {
  indent: number
  indentType: "spaces" | "tabs"
  lineLength: number
  semiColons: boolean
  trailingComma: "none" | "es5" | "all"
  bracketSpacing: boolean
  arrowParens: "always" | "avoid"
  printWidth: number
  useTabs: boolean
  tabWidth: number
  endOfLine: "auto" | "lf" | "crlf" | "cr"
}

const defaultConfigs: Record<string, FormatterConfig> = {
  prettier: {
    indent: 2,
    indentType: "spaces",
    lineLength: 80,
    semiColons: true,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "always",
    printWidth: 80,
    useTabs: false,
    tabWidth: 2,
    endOfLine: "lf",
  },
  eslint: {
    indent: 2,
    indentType: "spaces",
    lineLength: 100,
    semiColons: true,
    trailingComma: "none",
    bracketSpacing: true,
    arrowParens: "avoid",
    printWidth: 100,
    useTabs: false,
    tabWidth: 2,
    endOfLine: "lf",
  },
  google: {
    indent: 2,
    indentType: "spaces",
    lineLength: 80,
    semiColons: true,
    trailingComma: "none",
    bracketSpacing: false,
    arrowParens: "avoid",
    printWidth: 80,
    useTabs: false,
    tabWidth: 2,
    endOfLine: "lf",
  },
  airbnb: {
    indent: 2,
    indentType: "spaces",
    lineLength: 100,
    semiColons: true,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    printWidth: 100,
    useTabs: false,
    tabWidth: 2,
    endOfLine: "lf",
  },
}

export function AdvancedFormatter() {
  const [selectedPreset, setSelectedPreset] = useState("prettier")
  const [config, setConfig] = useState<FormatterConfig>(defaultConfigs.prettier)
  const [customName, setCustomName] = useState("")
  const [savedConfigs, setSavedConfigs] = useState<Record<string, FormatterConfig>>({})

  const formatCode = (code: string): string => {
    let formatted = code

    // Apply indentation
    const indentStr = config.indentType === "tabs" ? "\t" : " ".repeat(config.indent)
    const lines = formatted.split("\n")

    // Basic formatting
    formatted = lines
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ""

        // Add proper indentation based on brackets
        const depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
        return indentStr.repeat(Math.max(0, depth)) + trimmed
      })
      .join("\n")

    // Add semicolons if enabled
    if (config.semiColons) {
      formatted = formatted.replace(/([^;{}\n])\n/g, "$1;\n")
    }

    // Handle trailing commas
    if (config.trailingComma !== "none") {
      formatted = formatted.replace(/,(\s*[}\]])/g, "$1")
      if (config.trailingComma === "all") {
        formatted = formatted.replace(/([^,{}\n])\n(\s*[}\]])/g, "$1,\n$2")
      }
    }

    // Line length enforcement
    if (config.lineLength > 0) {
      const formattedLines = formatted.split("\n").map((line) => {
        if (line.length > config.lineLength) {
          return line.substring(0, config.lineLength)
        }
        return line
      })
      formatted = formattedLines.join("\n")
    }

    return formatted
  }

  const handleSaveConfig = () => {
    if (!customName.trim()) {
      alert("Please enter a config name")
      return
    }
    setSavedConfigs((prev) => ({
      ...prev,
      [customName]: config,
    }))
    setCustomName("")
  }

  const handleLoadConfig = (name: string) => {
    if (savedConfigs[name]) {
      setConfig(savedConfigs[name])
    }
  }

  const handleDeleteConfig = (name: string) => {
    setSavedConfigs((prev) => {
      const newConfigs = { ...prev }
      delete newConfigs[name]
      return newConfigs
    })
  }

  const handleExportConfig = () => {
    const data = JSON.stringify(config, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedPreset}-config.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportConfig = async (file: File) => {
    const text = await file.text()
    try {
      const imported = JSON.parse(text)
      setConfig(imported)
    } catch (error) {
      alert("Failed to import config")
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Code Formatter
      </h2>

      <Tabs defaultValue="presets" className="flex-1 flex flex-col">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="custom">Custom Configs</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="flex-1 overflow-auto">
          <div className="space-y-3">
            {Object.entries(defaultConfigs).map(([name, cfg]) => (
              <button
                key={name}
                onClick={() => {
                  setSelectedPreset(name)
                  setConfig(cfg)
                }}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedPreset === name
                    ? "bg-blue-600 border-blue-500"
                    : "bg-gray-800 border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="font-semibold capitalize">{name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {cfg.tabWidth} spaces • {cfg.printWidth}ch width
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 overflow-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Indent Size</label>
              <Input
                type="number"
                min="1"
                max="8"
                value={config.indent}
                onChange={(e) => setConfig({ ...config, indent: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Line Width</label>
              <Input
                type="number"
                min="40"
                max="200"
                value={config.lineLength}
                onChange={(e) => setConfig({ ...config, lineLength: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.semiColons}
                onChange={(e) => setConfig({ ...config, semiColons: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Require semicolons</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bracketSpacing}
                onChange={(e) => setConfig({ ...config, bracketSpacing: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Bracket spacing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useTabs}
                onChange={(e) => setConfig({ ...config, useTabs: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Use tabs instead of spaces</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trailing Commas</label>
            <select
              value={config.trailingComma}
              onChange={(e) =>
                setConfig({ ...config, trailingComma: e.target.value as any })
              }
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="none">None</option>
              <option value="es5">ES5 style</option>
              <option value="all">All</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Arrow Function Parentheses</label>
            <select
              value={config.arrowParens}
              onChange={(e) =>
                setConfig({ ...config, arrowParens: e.target.value as any })
              }
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="always">Always</option>
              <option value="avoid">Avoid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End of Line</label>
            <select
              value={config.endOfLine}
              onChange={(e) =>
                setConfig({ ...config, endOfLine: e.target.value as any })
              }
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
            >
              <option value="auto">Auto</option>
              <option value="lf">LF</option>
              <option value="crlf">CRLF</option>
              <option value="cr">CR</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Config name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={handleSaveConfig}>Save</Button>
            </div>

            <div className="space-y-2">
              {Object.keys(savedConfigs).map((name) => (
                <div
                  key={name}
                  className="bg-gray-800 rounded p-3 flex items-center justify-between border border-gray-700"
                >
                  <span className="text-sm">{name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadConfig(name)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConfig(name)}
                      className="text-red-400"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-700">
        <Button variant="outline" size="sm" onClick={handleExportConfig} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
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
            onChange={(e) => e.target.files?.[0] && handleImportConfig(e.target.files[0])}
            className="hidden"
          />
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setConfig(defaultConfigs.prettier)
            setSelectedPreset("prettier")
          }}
          className="gap-2 ml-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
