"use client"

import { GitBranch, AlertCircle, CheckCircle, Zap, Wifi, Bell, Settings, Activity, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusBarProps {
  activeFile?: string
  language?: string
  line?: number
  column?: number
  selection?: string
  errors?: number
  warnings?: number
  gitBranch?: string
  gitStatus?: "clean" | "dirty" | "syncing"
  liveShare?: boolean
  copilotStatus?: "ready" | "disabled" | "loading"
}

export function StatusBar({
  activeFile,
  language = "plaintext",
  line = 1,
  column = 1,
  selection,
  errors = 0,
  warnings = 0,
  gitBranch = "main",
  gitStatus = "clean",
  liveShare = false,
  copilotStatus = "ready",
}: StatusBarProps) {
  const getGitStatusColor = () => {
    switch (gitStatus) {
      case "dirty":
        return "text-orange-400"
      case "syncing":
        return "text-blue-400"
      default:
        return "text-green-400"
    }
  }

  const getCopilotIcon = () => {
    switch (copilotStatus) {
      case "loading":
        return <Activity className="w-3 h-3 animate-pulse" />
      case "disabled":
        return <Zap className="w-3 h-3 text-gray-500" />
      default:
        return <Zap className="w-3 h-3 text-green-400" />
    }
  }

  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-3 select-none">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Git Status */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <div className={`flex items-center space-x-1 ${getGitStatusColor()}`}>
            <GitBranch className="w-3 h-3" />
            <span>{gitBranch}</span>
            {gitStatus === "syncing" && <Activity className="w-3 h-3 animate-spin" />}
          </div>
        </Button>

        {/* Problems */}
        {(errors > 0 || warnings > 0) && (
          <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
            <div className="flex items-center space-x-2">
              {errors > 0 && (
                <div className="flex items-center space-x-1 text-red-300">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors}</span>
                </div>
              )}
              {warnings > 0 && (
                <div className="flex items-center space-x-1 text-yellow-300">
                  <AlertCircle className="w-3 h-3" />
                  <span>{warnings}</span>
                </div>
              )}
            </div>
          </Button>
        )}

        {/* Status Indicator */}
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-green-300" />
          <span>Ready</span>
        </div>

        {/* Live Share */}
        {liveShare && (
          <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
            <div className="flex items-center space-x-1 text-purple-300">
              <Users className="w-3 h-3" />
              <span>Live Share</span>
            </div>
          </Button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Selection Info */}
        {selection && <span className="text-blue-200">({selection} selected)</span>}

        {/* Cursor Position */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <span>
            Ln {line}, Col {column}
          </span>
        </Button>

        {/* Language */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <span className="capitalize">{language}</span>
        </Button>

        {/* Encoding */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <span>UTF-8</span>
        </Button>

        {/* Line Endings */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <span>LF</span>
        </Button>

        {/* Connection Status */}
        <div className="flex items-center space-x-1 text-green-300">
          <Wifi className="w-3 h-3" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <Bell className="w-3 h-3" />
        </Button>

        {/* Copilot */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <div className="flex items-center space-x-1">
            {getCopilotIcon()}
            <span>Copilot</span>
          </div>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="h-5 px-2 text-xs hover:bg-blue-700">
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { 
  GitBranch, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Wifi, 
  WifiOff,
  Users,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEditor } from "../lib/editor-store"

export function StatusBar() {
  const { state, dispatch } = useEditor()
  const [isConnected, setIsConnected] = useState(true)
  const [gitBranch] = useState("main")
  const [collaborators] = useState(3)

  const getExecutionStatusIcon = () => {
    switch (state.executionStatus) {
      case "running":
        return <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return <CheckCircle className="w-3 h-3 text-gray-500" />
    }
  }

  const getExecutionStatusText = () => {
    switch (state.executionStatus) {
      case "running":
        return "Running..."
      case "completed":
        return "Ready"
      case "error":
        return "Error"
      default:
        return "Ready"
    }
  }

  return (
    <div className="h-6 bg-blue-600 text-white text-xs flex items-center justify-between px-3">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Git branch */}
        <div className="flex items-center space-x-1">
          <GitBranch className="w-3 h-3" />
          <span>{gitBranch}</span>
        </div>

        {/* Connection status */}
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-400" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-400" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Collaborators */}
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{collaborators} users</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Execution status */}
        <div className="flex items-center space-x-1">
          {getExecutionStatusIcon()}
          <span>{getExecutionStatusText()}</span>
        </div>

        {/* Active tab info */}
        {state.activeTabId && (
          <div className="flex items-center space-x-2">
            <span>
              {state.openTabs.find(tab => tab.id === state.activeTabId)?.language || "plaintext"}
            </span>
            {state.openTabs.find(tab => tab.id === state.activeTabId)?.isDirty && (
              <Badge variant="secondary" className="h-4 px-1 text-xs">
                Unsaved
              </Badge>
            )}
          </div>
        )}

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-white hover:bg-blue-700"
        >
          <Settings className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}
