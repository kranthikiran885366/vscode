"use client"

import { useState, useRef, useCallback } from "react"
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  FileText,
  Code,
  ImageIcon,
  Settings,
  Trash2,
  Edit3,
  Copy,
  Scissors,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEditor, type FileItem } from "../lib/editor-context"

export function FileExplorer() {
  const { state, dispatch } = useEditor()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src", "/public"]))
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState("")
  const [filterQuery, setFilterQuery] = useState("")
  const [showHiddenFiles, setShowHiddenFiles] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample file structure
  const files: FileItem[] = [
    {
      id: "1",
      name: "src",
      path: "/src",
      type: "folder",
      children: [
        {
          id: "2",
          name: "components",
          path: "/src/components",
          type: "folder",
          children: [
            {
              id: "3",
              name: "App.tsx",
              path: "/src/components/App.tsx",
              type: "file",
              language: "typescript",
              size: 2048,
              modified: new Date(),
            },
            {
              id: "4",
              name: "Header.tsx",
              path: "/src/components/Header.tsx",
              type: "file",
              language: "typescript",
              size: 1024,
              modified: new Date(),
              isDirty: true,
            },
            {
              id: "5",
              name: "Sidebar.tsx",
              path: "/src/components/Sidebar.tsx",
              type: "file",
              language: "typescript",
              size: 3072,
              modified: new Date(),
            },
          ],
        },
        {
          id: "6",
          name: "hooks",
          path: "/src/hooks",
          type: "folder",
          children: [
            {
              id: "7",
              name: "useEditor.ts",
              path: "/src/hooks/useEditor.ts",
              type: "file",
              language: "typescript",
              size: 1536,
              modified: new Date(),
            },
          ],
        },
        {
          id: "8",
          name: "utils",
          path: "/src/utils",
          type: "folder",
          children: [
            {
              id: "9",
              name: "helpers.ts",
              path: "/src/utils/helpers.ts",
              type: "file",
              language: "typescript",
              size: 512,
              modified: new Date(),
            },
            {
              id: "10",
              name: "constants.ts",
              path: "/src/utils/constants.ts",
              type: "file",
              language: "typescript",
              size: 256,
              modified: new Date(),
            },
          ],
        },
        {
          id: "11",
          name: "styles",
          path: "/src/styles",
          type: "folder",
          children: [
            {
              id: "12",
              name: "globals.css",
              path: "/src/styles/globals.css",
              type: "file",
              language: "css",
              size: 1024,
              modified: new Date(),
            },
            {
              id: "13",
              name: "components.css",
              path: "/src/styles/components.css",
              type: "file",
              language: "css",
              size: 2048,
              modified: new Date(),
            },
          ],
        },
        {
          id: "14",
          name: "index.tsx",
          path: "/src/index.tsx",
          type: "file",
          language: "typescript",
          size: 1536,
          modified: new Date(),
        },
      ],
    },
    {
      id: "15",
      name: "public",
      path: "/public",
      type: "folder",
      children: [
        {
          id: "16",
          name: "index.html",
          path: "/public/index.html",
          type: "file",
          language: "html",
          size: 2048,
          modified: new Date(),
        },
        {
          id: "17",
          name: "favicon.ico",
          path: "/public/favicon.ico",
          type: "file",
          size: 1024,
          modified: new Date(),
        },
        {
          id: "18",
          name: "logo.svg",
          path: "/public/logo.svg",
          type: "file",
          language: "svg",
          size: 4096,
          modified: new Date(),
        },
      ],
    },
    {
      id: "19",
      name: "node_modules",
      path: "/node_modules",
      type: "folder",
      children: [],
    },
    {
      id: "20",
      name: ".vscode",
      path: "/.vscode",
      type: "folder",
      children: [
        {
          id: "21",
          name: "settings.json",
          path: "/.vscode/settings.json",
          type: "file",
          language: "json",
          size: 512,
          modified: new Date(),
        },
        {
          id: "22",
          name: "launch.json",
          path: "/.vscode/launch.json",
          type: "file",
          language: "json",
          size: 1024,
          modified: new Date(),
        },
      ],
    },
    {
      id: "23",
      name: "package.json",
      path: "/package.json",
      type: "file",
      language: "json",
      size: 1024,
      modified: new Date(),
    },
    {
      id: "24",
      name: "package-lock.json",
      path: "/package-lock.json",
      type: "file",
      language: "json",
      size: 102400,
      modified: new Date(),
    },
    {
      id: "25",
      name: "tsconfig.json",
      path: "/tsconfig.json",
      type: "file",
      language: "json",
      size: 512,
      modified: new Date(),
    },
    {
      id: "26",
      name: "README.md",
      path: "/README.md",
      type: "file",
      language: "markdown",
      size: 2048,
      modified: new Date(),
    },
    {
      id: "27",
      name: ".gitignore",
      path: "/.gitignore",
      type: "file",
      size: 256,
      modified: new Date(),
    },
  ]

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }, [])

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") {
      return expandedFolders.has(file.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      )
    }

    const ext = file.name.split(".").pop()?.toLowerCase()
    const iconMap: Record<string, { icon: any; color: string }> = {
      js: { icon: Code, color: "text-yellow-500" },
      jsx: { icon: Code, color: "text-blue-400" },
      ts: { icon: Code, color: "text-blue-600" },
      tsx: { icon: Code, color: "text-blue-400" },
      py: { icon: Code, color: "text-green-500" },
      java: { icon: Code, color: "text-red-500" },
      html: { icon: Code, color: "text-orange-500" },
      css: { icon: Code, color: "text-blue-500" },
      json: { icon: Settings, color: "text-yellow-600" },
      md: { icon: FileText, color: "text-gray-600" },
      png: { icon: ImageIcon, color: "text-purple-500" },
      jpg: { icon: ImageIcon, color: "text-purple-500" },
      svg: { icon: ImageIcon, color: "text-green-500" },
      ico: { icon: ImageIcon, color: "text-gray-500" },
    }

    const fileType = iconMap[ext || ""] || { icon: File, color: "text-gray-500" }
    const IconComponent = fileType.icon

    return <IconComponent className={`w-4 h-4 ${fileType.color}`} />
  }

  const handleFileSelect = (file: FileItem) => {
    if (file.type === "folder") {
      toggleFolder(file.path)
    } else {
      // Add tab logic here
      const newTab = {
        id: file.id,
        name: file.name,
        path: file.path,
        content: `// Content of ${file.name}\n// This would be loaded from the file system`,
        language: file.language || "plaintext",
        isDirty: false,
      }
      dispatch({ type: "ADD_TAB", payload: newTab })
    }
  }

  const handleRename = (file: FileItem) => {
    setRenamingFile(file.path)
    setNewFileName(file.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const confirmRename = () => {
    if (renamingFile && newFileName.trim()) {
      // Handle rename logic here
      console.log("Rename", renamingFile, "to", newFileName.trim())
    }
    setRenamingFile(null)
    setNewFileName("")
  }

  const cancelRename = () => {
    setRenamingFile(null)
    setNewFileName("")
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  const filterFiles = (items: FileItem[]): FileItem[] => {
    return items
      .filter((file) => {
        if (!showHiddenFiles && file.name.startsWith(".")) return false
        if (filterQuery && !file.name.toLowerCase().includes(filterQuery.toLowerCase())) return false
        return true
      })
      .map((file) => ({
        ...file,
        children: file.children ? filterFiles(file.children) : undefined,
      }))
  }

  const renderFileTree = (items: FileItem[], depth = 0) => {
    const filteredItems = filterFiles(items)

    return filteredItems.map((file) => (
      <div key={file.path}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`group flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm transition-colors duration-150 ${
                file.isDirty ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => handleFileSelect(file)}
            >
              {file.type === "folder" && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {expandedFolders.has(file.path) ? (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  )}
                </span>
              )}

              {getFileIcon(file)}

              {renamingFile === file.path ? (
                <Input
                  ref={inputRef}
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename()
                    if (e.key === "Escape") cancelRename()
                  }}
                  onBlur={confirmRename}
                  className="h-5 text-xs flex-1 min-w-0"
                />
              ) : (
                <>
                  <span className="truncate flex-1 min-w-0">{file.name}</span>
                  {file.isDirty && <span className="text-orange-500 text-xs">●</span>}
                  {file.size && (
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </>
              )}
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-56">
            <ContextMenuItem onClick={() => console.log("New File")}>
              <Plus className="w-4 h-4 mr-2" />
              New File
            </ContextMenuItem>
            <ContextMenuItem onClick={() => console.log("New Folder")}>
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleRename(file)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </ContextMenuItem>
            <ContextMenuItem>
              <Scissors className="w-4 h-4 mr-2" />
              Cut
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Download as ZIP</ContextMenuItem>
                <ContextMenuItem>Download File</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {file.type === "folder" && expandedFolders.has(file.path) && file.children && (
          <div className="animate-in slide-in-from-top-1 duration-200">{renderFileTree(file.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Explorer</span>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="New File">
            <Plus className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowHiddenFiles(!showHiddenFiles)}>
                <Filter className="w-4 h-4 mr-2" />
                {showHiddenFiles ? "Hide" : "Show"} Hidden Files
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filter */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Filter files..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="h-7 pl-7 pr-7 text-xs"
          />
          {filterQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0"
              onClick={() => setFilterQuery("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="overflow-auto h-full pb-4">
        <div className="py-2">{renderFileTree(files)}</div>
      </div>
    </div>
  )
}
