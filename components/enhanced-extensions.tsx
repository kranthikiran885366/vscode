"use client"

import { useState } from "react"
import {
  Download,
  Star,
  Users,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Extension {
  id: string
  name: string
  publisher: string
  version: string
  description: string
  rating: number
  downloads: number
  installs: number
  isInstalled: boolean
  isEnabled: boolean
  category: string
  homepage?: string
  repository?: string
  license?: string
}

const marketplaceExtensions: Extension[] = [
  {
    id: "1",
    name: "Python",
    publisher: "Microsoft",
    version: "2023.20.0",
    description: "IntelliSense, linting, debugging, code formatting, refactoring",
    rating: 4.8,
    downloads: 50000000,
    installs: 40000000,
    isInstalled: true,
    isEnabled: true,
    category: "Programming Languages",
    homepage: "https://github.com/microsoft/vscode-python",
  },
  {
    id: "2",
    name: "Prettier - Code formatter",
    publisher: "Prettier",
    version: "10.1.0",
    description: "Code formatter using prettier",
    rating: 4.7,
    downloads: 25000000,
    installs: 20000000,
    isInstalled: true,
    isEnabled: true,
    category: "Formatters",
  },
  {
    id: "3",
    name: "ESLint",
    publisher: "Microsoft",
    version: "2.4.2",
    description: "Integrates ESLint JavaScript into VS Code",
    rating: 4.9,
    downloads: 35000000,
    installs: 30000000,
    isInstalled: false,
    isEnabled: false,
    category: "Linters",
  },
  {
    id: "4",
    name: "Docker",
    publisher: "Microsoft",
    version: "1.26.1",
    description: "Makes it easy to create, manage, and debug containerized applications",
    rating: 4.6,
    downloads: 10000000,
    installs: 8000000,
    isInstalled: false,
    isEnabled: false,
    category: "Other",
  },
  {
    id: "5",
    name: "GitLens",
    publisher: "Eric Amodio",
    version: "14.6.1",
    description: "Supercharge Git inside VS Code",
    rating: 4.8,
    downloads: 15000000,
    installs: 12000000,
    isInstalled: true,
    isEnabled: true,
    category: "Version Control",
  },
  {
    id: "6",
    name: "Copilot",
    publisher: "GitHub",
    version: "1.141.673",
    description: "Your AI pair programmer",
    rating: 4.7,
    downloads: 20000000,
    installs: 15000000,
    isInstalled: false,
    isEnabled: false,
    category: "AI",
  },
]

export function EnhancedExtensions() {
  const [extensions, setExtensions] = useState<Extension[]>(marketplaceExtensions)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showInstalled, setShowInstalled] = useState(false)

  const categories = ["all", ...new Set(extensions.map((e) => e.category))]

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.publisher.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || ext.category === selectedCategory
    const matchesInstalled = !showInstalled || ext.isInstalled

    return matchesSearch && matchesCategory && matchesInstalled
  })

  const installedCount = extensions.filter((e) => e.isInstalled).length

  const handleInstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id
          ? { ...ext, isInstalled: !ext.isInstalled, isEnabled: !ext.isInstalled }
          : ext
      )
    )
  }

  const handleToggleEnable = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, isEnabled: !ext.isEnabled } : ext
      )
    )
  }

  const handleUninstall = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id
          ? { ...ext, isInstalled: false, isEnabled: false }
          : ext
      )
    )
  }

  const formatDownloads = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <Tabs defaultValue="marketplace" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-gray-800 m-0 rounded-none border-b border-gray-700">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">
            Installed ({installedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="flex-1 flex flex-col overflow-hidden p-3">
          {/* Search and Filters */}
          <div className="space-y-3 mb-4 pb-3 border-b border-gray-700">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search extensions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Extensions List */}
          <div className="flex-1 overflow-auto space-y-3">
            {filteredExtensions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No extensions found</p>
              </div>
            ) : (
              filteredExtensions.map((ext) => (
                <div
                  key={ext.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{ext.name}</h3>
                      <p className="text-xs text-gray-400">by {ext.publisher}</p>
                    </div>
                    <div className="text-xs bg-gray-700 px-2 py-1 rounded">
                      v{ext.version}
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{ext.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {ext.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {formatDownloads(ext.downloads)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatDownloads(ext.installs)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!ext.isInstalled ? (
                      <Button
                        size="sm"
                        onClick={() => handleInstall(ext.id)}
                        className="flex-1 gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Install
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={ext.isEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleEnable(ext.id)}
                          className="flex-1 gap-2"
                        >
                          {ext.isEnabled ? (
                            <>
                              <Check className="w-4 h-4" />
                              Enabled
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Disabled
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUninstall(ext.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="flex-1 overflow-auto p-3">
          <div className="space-y-3">
            {extensions
              .filter((e) => e.isInstalled)
              .map((ext) => (
                <div
                  key={ext.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{ext.name}</h3>
                      <p className="text-xs text-gray-400">by {ext.publisher}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleEnable(ext.id)}
                      >
                        {ext.isEnabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUninstall(ext.id)}
                        className="text-red-400"
                      >
                        Uninstall
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{ext.description}</p>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
