"use client"

import { useState } from "react"
import { X, ChevronRight, MoreHorizontal, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Tab {
  id: string
  name: string
  path: string
  language: string
  isDirty: boolean
  isPinned?: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onTabPin?: (tabId: string) => void
  onTabSave?: (tabId: string) => void
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onTabPin, onTabSave }: TabBarProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null)

  const getFileIcon = (language: string) => {
    const iconMap: Record<string, string> = {
      javascript: "🟨",
      typescript: "🔷",
      python: "🐍",
      java: "☕",
      html: "🌐",
      css: "🎨",
      json: "📋",
      markdown: "📝",
      cpp: "⚙️",
      c: "🔧",
    }
    return iconMap[language] || "📄"
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  if (tabs.length === 0) {
    return null
  }

  const renderBreadcrumbs = () => {
    if (!activeTab) return null

    const pathParts = activeTab.path.split("/").filter(Boolean)

    return (
      <div className="flex items-center px-4 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <span className="text-blue-600 dark:text-blue-400">workspace</span>
        {pathParts.map((part, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-3 h-3 mx-1" />
            <span className={index === pathParts.length - 1 ? "text-gray-900 dark:text-gray-100 font-medium" : ""}>
              {part}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Breadcrumbs */}
      {renderBreadcrumbs()}

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`group flex items-center gap-2 px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 max-w-xs transition-all duration-200 ${
              activeTabId === tab.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-b-2 border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            } ${tab.isPinned ? "border-l-2 border-l-blue-400" : ""}`}
            onClick={() => onTabSelect(tab.id)}
            draggable
            onDragStart={() => setDraggedTab(tab.id)}
            onDragEnd={() => setDraggedTab(null)}
            onDragOver={(e) => e.preventDefault()}
          >
            <span className="text-sm flex-shrink-0">{getFileIcon(tab.language)}</span>

            <span className="text-sm truncate min-w-0 flex-1">{tab.name}</span>

            {tab.isDirty && (
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" title="Unsaved changes" />
            )}

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {tab.isDirty && onTabSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-4 h-4 p-0 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabSave(tab.id)
                  }}
                  title="Save"
                >
                  <Save className="w-3 h-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                title="Close"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {/* Tab overflow menu */}
        {tabs.length > 8 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 py-2 border-r">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {tabs.map((tab) => (
                <DropdownMenuItem key={tab.id} onClick={() => onTabSelect(tab.id)} className="flex items-center gap-2">
                  <span>{getFileIcon(tab.language)}</span>
                  <span className="truncate">{tab.name}</span>
                  {tab.isDirty && <span className="text-orange-500">●</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
