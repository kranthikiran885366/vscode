
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  FileText,
  Search,
  GitBranch,
  Play,
  Package,
  Settings,
  Bot,
  Users,
  Monitor,
  Terminal,
  Zap,
  Layers,
} from "lucide-react"
import { useEditor } from "../lib/editor-store"

export function ActivityBar() {
  const { state, dispatch } = useEditor()

  const activityItems = [
    {
      id: "explorer",
      icon: FileText,
      label: "Explorer",
      shortcut: "⌘⇧E",
      panel: "explorer",
    },
    {
      id: "search",
      icon: Search,
      label: "Search",
      shortcut: "⌘⇧F",
      panel: "search",
    },
    {
      id: "git",
      icon: GitBranch,
      label: "Source Control",
      shortcut: "⌃⇧G",
      panel: "git",
    },
    {
      id: "debug",
      icon: Play,
      label: "Run and Debug",
      shortcut: "⌘⇧D",
      panel: "debug",
    },
    {
      id: "extensions",
      icon: Package,
      label: "Extensions",
      shortcut: "⌘⇧X",
      panel: "extensions",
    },
    {
      id: "ai",
      icon: Bot,
      label: "AI Assistant",
      shortcut: "⌘⇧A",
      panel: "ai",
    },
  ]

  const bottomItems = [
    {
      id: "collaboration",
      icon: Users,
      label: "Collaboration",
      action: () => {
        dispatch({ type: "SET_ACTIVE_RIGHT_PANEL", payload: "collaboration" })
        dispatch({ type: "SET_RIGHT_SIDEBAR_VISIBLE", payload: true })
      },
    },
    {
      id: "preview",
      icon: Monitor,
      label: "Live Preview",
      action: () => {
        dispatch({ type: "SET_ACTIVE_RIGHT_PANEL", payload: "preview" })
        dispatch({ type: "SET_RIGHT_SIDEBAR_VISIBLE", payload: true })
      },
    },
    {
      id: "terminal",
      icon: Terminal,
      label: "Terminal",
      action: () => {
        dispatch({ type: "SET_ACTIVE_BOTTOM_PANEL", payload: "terminal" })
        dispatch({ type: "SET_BOTTOM_PANEL_VISIBLE", payload: true })
      },
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "settings" }),
    },
  ]

  return (
    <TooltipProvider>
      <div className="w-12 bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 flex flex-col items-center py-2">
        {/* Main Activity Items */}
        <div className="flex flex-col space-y-1">
          {activityItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={state.activeLeftPanel === item.panel ? "default" : "ghost"}
                  size="icon"
                  className={`w-10 h-10 ${
                    state.activeLeftPanel === item.panel
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                  onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: item.panel })}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {item.label}
                  {item.shortcut && <span className="ml-2 text-xs opacity-60">{item.shortcut}</span>}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Items */}
        <div className="flex flex-col space-y-1">
          {bottomItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  onClick={item.action}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
