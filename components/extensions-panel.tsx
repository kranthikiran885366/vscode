"use client"

import { useState, useMemo } from "react"
import {
  X,
  Search,
  Download,
  Eye,
  Star,
  Zap,
  GripVertical,
  Trash2,
  Settings,
  Filter,
  Unplug,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor } from "../lib/editor-store"

interface Extension {
  id: string
  name: string
  publisher: string
  version: string
  description: string
  downloads: number
  rating: number
  reviews: number
  installed: boolean
  enabled: boolean
  icon?: string
}

export function ExtensionsPanel() {
  const { state, dispatch } = useEditor()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "installed" | "disabled">("all")

  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: "1",
      name: "Prettier - Code Formatter",
      publisher: "Prettier",
      version: "10.4.0",
      description: "Code formatter with support for multiple languages",
      downloads: 50000000,
      rating: 4.8,
      reviews: 5000,
      installed: true,
      enabled: true,
    },
    {
      id: "2",
      name: "ESLint",
      publisher: "Microsoft",
      version: "2.4.4",
      description: "Integrates ESLint into VS Code",
      downloads: 40000000,
      rating: 4.7,
      reviews: 4500,
      installed: true,
      enabled: true,
    },
    {
      id: "3",
      name: "GitHub Copilot",
      publisher: "GitHub",
      version: "1.180.0",
      description: "AI pair programmer that suggests code",
      downloads: 30000000,
      rating: 4.6,
      reviews: 3800,
      installed: false,
      enabled: false,
    },
    {
      id: "4",
      name: "Python",
      publisher: "Microsoft",
      version: "2024.0.0",
      description: "Rich support for the Python language",
      downloads: 35000000,
      rating: 4.9,
      reviews: 6000,
      installed: true,
      enabled: false,
    },
    {
      id: "5",
      name: "Go",
      publisher: "Go Team at Google",
      version: "0.43.0",
      description: "Rich language support for the Go language",
      downloads: 5000000,
      rating: 4.8,
      reviews: 1200,
      installed: false,
      enabled: false,
    },
    {
      id: "6",
      name: "Rust Analyzer",
      publisher: "rust-lang",
      version: "0.4.1705",
      description: "Rust language server",
      downloads: 8000000,
      rating: 4.7,
      reviews: 2100,
      installed: false,
      enabled: false,
    },
  ])

  const filteredExtensions = useMemo(() => {
    return extensions.filter((ext) => {
      if (searchQuery && !ext.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !ext.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      if (filterBy === "installed" && !ext.installed) return false
      if (filterBy === "disabled" && !ext.installed) return false
      if (filterBy === "disabled" && ext.enabled) return false

      return true
    })
  }, [extensions, searchQuery, filterBy])

  const handleInstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: true, enabled: true } : ext))
    )
  }

  const handleUninstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, installed: false, enabled: false } : ext))
    )
  }

  const handleToggleEnable = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    )
  }

  const installedCount = extensions.filter((e) => e.installed).length
  const disabledCount = extensions.filter((e) => e.installed && !e.enabled).length

  const renderExtensionCard = (extension: Extension) => (
    <div
      key={extension.id}
      className="border border-gray-700 rounded p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Icon/Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-200">{extension.name}</h3>
          <p className="text-xs text-gray-500">{extension.publisher}</p>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{extension.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{(extension.downloads / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <span>
                {extension.rating.toFixed(1)} ({extension.reviews.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {extension.installed ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleEnable(extension.id)}
                className="h-7 text-xs"
              >
                {extension.enabled ? "Disable" : "Enable"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleUninstall(extension.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Uninstall
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={() => handleInstall(extension.id)}
              className="h-7 text-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold">Extensions</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "TOGGLE_EXTENSIONS_PANEL" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="flex flex-col flex-1">
        <TabsList className="bg-gray-800 border-b border-gray-700 rounded-none w-full justify-start">
          <TabsTrigger value="all" className="rounded-none text-xs">
            All ({extensions.length})
          </TabsTrigger>
          <TabsTrigger value="installed" className="rounded-none text-xs">
            Installed ({installedCount})
          </TabsTrigger>
          <TabsTrigger value="disabled" className="rounded-none text-xs">
            Disabled ({disabledCount})
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-700 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              placeholder="Search extensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        {/* Content */}
        <TabsContent value="all" className="flex-1 overflow-auto m-0 p-4 space-y-3">
          {filteredExtensions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500">No extensions found</p>
            </div>
          ) : (
            filteredExtensions.map((ext) => renderExtensionCard(ext))
          )}
        </TabsContent>

        <TabsContent value="installed" className="flex-1 overflow-auto m-0 p-4 space-y-3">
          {extensions.filter((e) => e.installed).length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500">No installed extensions</p>
            </div>
          ) : (
            extensions
              .filter((e) => e.installed)
              .map((ext) => renderExtensionCard(ext))
          )}
        </TabsContent>

        <TabsContent value="disabled" className="flex-1 overflow-auto m-0 p-4 space-y-3">
          {extensions.filter((e) => e.installed && !e.enabled).length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-500">No disabled extensions</p>
            </div>
          ) : (
            extensions
              .filter((e) => e.installed && !e.enabled)
              .map((ext) => renderExtensionCard(ext))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
