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
