"use client"

import { useState } from "react"
import { Files, Search, GitBranch, Bug, Package, Settings } from "lucide-react"
import { FileExplorer } from "./file-explorer"
import type { FileItem, Extension } from "../types/editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SidebarProps {
  visible: boolean
  currentPanel: string
  files: FileItem[]
  onPanelChange: (panel: string) => void
  onFileSelect: (file: FileItem) => void
  onFileCreate: (parentPath: string, name: string, type: "file" | "folder") => void
  onFileDelete: (path: string) => void
  onFileRename: (path: string, newName: string) => void
  onThemeChange: (theme: "light" | "dark") => void
  theme: "light" | "dark"
}

export function Sidebar({
  visible,
  currentPanel,
  files,
  onPanelChange,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onThemeChange,
  theme,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [extensions] = useState<Extension[]>([
    {
      id: "1",
      name: "Prettier",
      description: "Code formatter",
      version: "9.0.0",
      author: "Prettier",
      installed: true,
      enabled: true,
    },
    {
      id: "2",
      name: "ESLint",
      description: "JavaScript linter",
      version: "2.4.0",
      author: "Microsoft",
      installed: true,
      enabled: true,
    },
    {
      id: "3",
      name: "GitLens",
      description: "Git supercharged",
      version: "13.0.0",
      author: "GitKraken",
      installed: false,
      enabled: false,
    },
    {
      id: "4",
      name: "Live Server",
      description: "Launch development server",
      version: "5.7.9",
      author: "Ritwick Dey",
      installed: false,
      enabled: false,
    },
  ])

  const panels = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Bug, label: "Debug" },
    { id: "extensions", icon: Package, label: "Extensions" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  if (!visible) return null

  const renderPanelContent = () => {
    switch (currentPanel) {
      case "explorer":
        return (
          <FileExplorer
            files={files}
            onFileSelect={onFileSelect}
            onFileCreate={onFileCreate}
            onFileDelete={onFileDelete}
            onFileRename={onFileRename}
          />
        )

      case "search":
        return (
          <div className="p-4">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            <div className="text-sm text-gray-500">
              {searchQuery ? `Searching for "${searchQuery}"...` : "Enter search term"}
            </div>
          </div>
        )

      case "git":
        return (
          <div className="p-4">
            <h3 className="font-medium mb-4">SOURCE CONTROL</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Changes (2)</div>
                <div className="ml-4 text-green-600">+ src/components/editor.tsx</div>
                <div className="ml-4 text-orange-600">M src/types/editor.ts</div>
              </div>
              <Input placeholder="Commit message" className="mt-4" />
              <Button className="w-full">Commit</Button>
            </div>
          </div>
        )

      case "debug":
        return (
          <div className="p-4">
            <h3 className="font-medium mb-4">DEBUG</h3>
            <div className="space-y-2">
              <Button className="w-full">Start Debugging</Button>
              <div className="text-sm">
                <div className="font-medium">Breakpoints</div>
                <div className="text-gray-500 text-xs">No breakpoints set</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Call Stack</div>
                <div className="text-gray-500 text-xs">Not debugging</div>
              </div>
            </div>
          </div>
        )

      case "extensions":
        return (
          <div className="p-4">
            <h3 className="font-medium mb-4">EXTENSIONS</h3>
            <Input placeholder="Search extensions..." className="mb-4" />
            <div className="space-y-3">
              {extensions.map((ext) => (
                <div key={ext.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{ext.name}</div>
                      <div className="text-xs text-gray-500">{ext.description}</div>
                      <div className="text-xs text-gray-400">by {ext.author}</div>
                    </div>
                    <Button size="sm" variant={ext.installed ? "secondary" : "default"}>
                      {ext.installed ? "Installed" : "Install"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="p-4">
            <h3 className="font-medium mb-4">SETTINGS</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => onThemeChange("light")}
                  >
                    Light
                  </Button>
                  <Button
                    size="sm"
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => onThemeChange("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Font Size</label>
                <Input type="number" defaultValue="14" className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Tab Size</label>
                <Input type="number" defaultValue="2" className="mt-2" />
              </div>
            </div>
          </div>
        )

      default:
        return <div className="p-4">Panel content</div>
    }
  }

  return (
    <div className="flex h-full">
      {/* Activity Bar */}
      <div className="w-12 bg-gray-800 flex flex-col items-center py-2 space-y-2">
        {panels.map((panel) => (
          <Button
            key={panel.id}
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 ${currentPanel === panel.id ? "bg-gray-700" : ""}`}
            onClick={() => onPanelChange(panel.id)}
            title={panel.label}
          >
            <panel.icon className="w-5 h-5 text-gray-300" />
          </Button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="w-80 bg-gray-50 dark:bg-gray-900">{renderPanelContent()}</div>
    </div>
  )
}
