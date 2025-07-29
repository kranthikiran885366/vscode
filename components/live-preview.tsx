"use client"

import { useState, useEffect } from "react"
import {
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  ExternalLink,
  Settings,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEditor } from "../lib/editor-store"

export function LivePreview() {
  const { state, dispatch } = useEditor()
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [previewUrl, setPreviewUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simulate preview URL generation
    if (state.livePreview) {
      setPreviewUrl(state.livePreview.url)
    } else {
      const mockUrl = `https://preview-${Math.random().toString(36).substr(2, 9)}.dev`
      setPreviewUrl(mockUrl)
      dispatch({
        type: "SET_LIVE_PREVIEW",
        payload: {
          url: mockUrl,
          status: "ready",
          port: 3000,
        },
      })
    }
  }, [state.livePreview, dispatch])

  const handleStartPreview = () => {
    setIsLoading(true)
    dispatch({ type: "SET_EXECUTION_STATUS", payload: "running" })

    setTimeout(() => {
      dispatch({
        type: "SET_LIVE_PREVIEW",
        payload: {
          url: previewUrl,
          status: "ready",
          port: 3000,
        },
      })
      dispatch({ type: "SET_EXECUTION_STATUS", payload: "idle" })
      setIsLoading(false)
    }, 2000)
  }

  const handleStopPreview = () => {
    dispatch({
      type: "SET_LIVE_PREVIEW",
      payload: {
        url: previewUrl,
        status: "error",
        port: 3000,
      },
    })
    dispatch({ type: "SET_EXECUTION_STATUS", payload: "idle" })
  }

  const handleRefresh = () => {
    if (state.livePreview?.status === "ready") {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case "mobile":
        return { width: "375px", height: "667px" }
      case "tablet":
        return { width: "768px", height: "1024px" }
      default:
        return { width: "100%", height: "100%" }
    }
  }

  const getStatusIcon = () => {
    if (isLoading || state.executionStatus === "running") {
      return <Loader className="w-4 h-4 animate-spin text-blue-500" />
    }

    switch (state.livePreview?.status) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Monitor className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (isLoading || state.executionStatus === "running") {
      return "Starting..."
    }

    switch (state.livePreview?.status) {
      case "ready":
        return `Running on port ${state.livePreview.port}`
      case "error":
        return "Preview stopped"
      default:
        return "Not running"
    }
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-green-500" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleRefresh}
            disabled={state.livePreview?.status !== "ready"}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <div className="flex items-center gap-1">
            {state.livePreview?.status === "ready" ? (
              <Button variant="outline" size="sm" onClick={handleStopPreview} className="h-6 text-xs bg-transparent">
                <Square className="w-3 h-3 mr-1" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartPreview}
                disabled={isLoading}
                className="h-6 text-xs bg-transparent"
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            )}
          </div>
        </div>

        {/* URL */}
        {state.livePreview?.status === "ready" && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={previewUrl}
              readOnly
              className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"
            />
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => window.open(previewUrl, "_blank")}>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Viewport Controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2">Viewport:</span>
          {[
            { id: "desktop", icon: Monitor, label: "Desktop" },
            { id: "tablet", icon: Tablet, label: "Tablet" },
            { id: "mobile", icon: Smartphone, label: "Mobile" },
          ].map((viewport) => (
            <Button
              key={viewport.id}
              variant={viewportSize === viewport.id ? "default" : "outline"}
              size="sm"
              className="h-6 px-2"
              onClick={() => setViewportSize(viewport.id as any)}
            >
              <viewport.icon className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 p-3">
        {state.livePreview?.status === "ready" ? (
          <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={getViewportDimensions()}
            >
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading preview...</p>
                  </div>
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-none"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Preview Running</h3>
              <p className="text-sm text-gray-500 mb-4">Start your application to see a live preview</p>
              <Button onClick={handleStartPreview} disabled={isLoading}>
                <Play className="w-4 h-4 mr-2" />
                Start Preview
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Console Output */}
      {state.terminalOutput.length > 0 && (
        <>
          <Separator />
          <div className="p-3 max-h-32 overflow-auto bg-gray-50 dark:bg-gray-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Console Output</div>
            <div className="space-y-1">
              {state.terminalOutput.slice(-5).map((output, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {output}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
