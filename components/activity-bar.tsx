"use client"

import { Files, Search, GitBranch, Bug, Package, Settings, TestTube, Users, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditor } from "../lib/editor-context"

export function ActivityBar() {
  const { state, dispatch } = useEditor()

  const panels = [
    {
      id: "explorer",
      icon: Files,
      label: "Explorer",
      shortcut: "⌘⇧E",
      badge: null,
    },
    {
      id: "search",
      icon: Search,
      label: "Search",
      shortcut: "⌘⇧F",
      badge: state.searchResults.length > 0 ? state.searchResults.length : null,
    },
    {
      id: "git",
      icon: GitBranch,
      label: "Source Control",
      shortcut: "⌃⇧G",
      badge: state.gitFiles.length > 0 ? state.gitFiles.length : null,
    },
    {
      id: "debug",
      icon: Bug,
      label: "Run and Debug",
      shortcut: "⌘⇧D",
      badge: state.breakpoints.length > 0 ? state.breakpoints.length : null,
    },
    {
      id: "extensions",
      icon: Package,
      label: "Extensions",
      shortcut: "⌘⇧X",
      badge: null,
    },
    {
      id: "testing",
      icon: TestTube,
      label: "Testing",
      shortcut: "⌘;",
      badge: null,
    },
  ]

  const bottomPanels = [
    {
      id: "live-share",
      icon: Users,
      label: "Live Share",
      badge: null,
    },
    {
      id: "remote",
      icon: Monitor,
      label: "Remote Explorer",
      badge: null,
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      shortcut: "⌘,",
      badge: null,
    },
  ]

  const handlePanelClick = (panelId: string) => {
    dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: panelId })
  }

  const renderPanel = (panel: any) => (
    <Tooltip key={panel.id}>
      <TooltipTrigger asChild>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 mx-1 mb-1 p-0 rounded-md transition-all duration-200 relative ${
              state.activeLeftPanel === panel.id && state.sidebarVisible
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => handlePanelClick(panel.id)}
          >
            <panel.icon className="w-5 h-5" />
          </Button>
          {panel.badge && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {panel.badge > 99 ? "99+" : panel.badge}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>{panel.label}</span>
        {panel.shortcut && <kbd className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{panel.shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <TooltipProvider>
      <div className="w-12 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Top Panels */}
        <div className="flex flex-col py-2">{panels.map(renderPanel)}</div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Panels */}
        <div className="flex flex-col pb-2">{bottomPanels.map(renderPanel)}</div>
      </div>
    </TooltipProvider>
  )
}
