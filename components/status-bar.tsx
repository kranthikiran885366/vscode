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
