"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { useEditor } from "@/lib/editor-store"
import { MonacoEditor } from "@/components/monaco-editor"
import { FileExplorer } from "@/components/file-explorer"
import { Terminal } from "@/components/terminal"
import { MenuBar } from "@/components/menu-bar"
import { TabBar } from "@/components/tab-bar"
import { StatusBar } from "@/components/status-bar"
import { AIAssistant } from "@/components/ai-assistant"
import { ProblemsPanel } from "@/components/problems-panel"
import { DebugPanel } from "@/components/debug-panel"
import { ExtensionsPanel } from "@/components/extensions-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { GitPanel } from "@/components/git-panel"
import { SymbolNavigator } from "@/components/symbol-navigator"
import { DiffViewer } from "@/components/diff-viewer"
import { ZenMode } from "@/components/zen-mode"
import { CommandPalette } from "@/components/command-palette"
import { SearchPanel } from "@/components/search-panel"
import { ActivityBar } from "@/components/activity-bar"
import { Button } from "@/components/ui/button"
import { Play, Save, GitBranch, Code2 } from "lucide-react"

interface File {
  _id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
}

interface Project {
  _id: string
  name: string
  description: string
  owner: string
  collaborators: string[]
  files: File[]
  language: string
}

export default function EnhancedEditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const { state, dispatch } = useEditor()
  const socketRef = useRef<Socket | null>(null)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [openTabs, setOpenTabs] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState("")

  // Fetch project and files
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("No project selected")
        return
      }

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error("Failed to load project")
        }

        const data = await response.json()
        setProject(data.project)

        if (data.project.files && data.project.files.length > 0) {
          const firstFile = data.project.files[0]
          setCurrentFile(firstFile)
          setOpenTabs([firstFile])
          setActiveTab(firstFile._id)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  // Initialize WebSocket
  useEffect(() => {
    if (!projectId) return

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Not authenticated")
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000", {
      auth: { token },
    })

    socket.on("connect", () => {
      console.log("✅ Connected to collaboration server")
      socket.emit("join-project", projectId)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  const handleFileSelect = useCallback((file: File) => {
    setCurrentFile(file)
    const isAlreadyOpen = openTabs.some((f) => f._id === file._id)
    if (!isAlreadyOpen) {
      setOpenTabs((prev) => [...prev, file])
    }
    setActiveTab(file._id)
  }, [openTabs])

  const handleFileChange = useCallback((content: string) => {
    if (!currentFile) return

    setCurrentFile((prev) => prev ? { ...prev, content, isDirty: true } : null)

    if (socketRef.current) {
      socketRef.current.emit("editor-update", {
        fileId: currentFile._id,
        content,
      })
    }
  }, [currentFile])

  const handleSaveFile = useCallback(async () => {
    if (!currentFile) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/files/${currentFile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: currentFile.content }),
      })

      if (!response.ok) {
        throw new Error("Failed to save file")
      }

      setCurrentFile((prev) => prev ? { ...prev, isDirty: false } : null)

      if (socketRef.current) {
        socketRef.current.emit("file-save", {
          fileId: currentFile._id,
          content: currentFile.content,
        })
      }
    } catch (err: any) {
      console.error("Save error:", err)
    }
  }, [currentFile])

  const handleExecuteCode = useCallback(async () => {
    if (!currentFile) return

    setIsExecuting(true)
    setTerminalOutput("Executing...\n")

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
        }),
      })

      const result = await response.json()
      setTerminalOutput(
        `${terminalOutput}${result.output || result.error}\nExecution time: ${result.duration}ms`
      )
      setIsExecuting(false)

      if (socketRef.current) {
        socketRef.current.emit("execute-code", {
          fileId: currentFile._id,
          language: currentFile.language,
        })
      }
    } catch (err: any) {
      setTerminalOutput(`${terminalOutput}Error: ${err.message}`)
      setIsExecuting(false)
    }
  }, [currentFile, terminalOutput])

  const handleCreateNewFile = useCallback(async () => {
    const fileName = prompt("Enter file name:")
    if (!fileName || !projectId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name: fileName,
          language: "plaintext",
          content: "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create file")
      }

      const { file } = await response.json()
      setProject((prev) => {
        if (!prev) return null
        return { ...prev, files: [...prev.files, file] }
      })
    } catch (err: any) {
      console.error("Create file error:", err)
    }
  }, [projectId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K + Z: Toggle Zen Mode
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        const nextKey = new Promise<KeyboardEvent>((resolve) => {
          const handleNextKey = (event: KeyboardEvent) => {
            document.removeEventListener("keydown", handleNextKey)
            resolve(event)
          }
          document.addEventListener("keydown", handleNextKey)
        })
        nextKey.then((event) => {
          if (event.key === "z") {
            dispatch({ type: "TOGGLE_ZEN_MODE" })
          }
        })
      }

      // Ctrl/Cmd + Shift + P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault()
        dispatch({ type: "TOGGLE_COMMAND_PALETTE" })
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSaveFile()
      }

      // Ctrl/Cmd + Shift + E: Explorer
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault()
        dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })
      }

      // Ctrl/Cmd + Shift + F: Search
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault()
        dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "search" })
      }

      // Ctrl/Cmd + Shift + G: Git
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
        e.preventDefault()
        dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "git" })
      }

      // Ctrl/Cmd + `: Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault()
        dispatch({ type: "TOGGLE_TERMINAL" })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [dispatch, handleSaveFile])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400 mb-4">{error || "Project not found"}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const renderLeftPanel = () => {
    switch (state.activeLeftPanel) {
      case "explorer":
        return <FileExplorer />
      case "search":
        return <SearchPanel />
      case "git":
        return <GitPanel />
      case "debug":
        return <DebugPanel />
      case "extensions":
        return <ExtensionsPanel />
      case "settings":
        return <SettingsPanel />
      case "outline":
        return <SymbolNavigator />
      default:
        return <FileExplorer />
    }
  }

  const renderBottomPanel = () => {
    switch (state.activeBottomPanel) {
      case "terminal":
        return <Terminal />
      case "problems":
        return <ProblemsPanel />
      case "output":
        return <div className="p-4 text-gray-400">Output panel coming soon</div>
      default:
        return <Terminal />
    }
  }

  return (
    <ZenMode isActive={state.zenModeActive}>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* Menu Bar */}
        <MenuBar onCommandPalette={() => dispatch({ type: "TOGGLE_COMMAND_PALETTE" })} onQuickOpen={() => {}} />

        {/* Main Editor Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Activity Bar + Left Sidebar */}
          <ActivityBar />

          {state.sidebarVisible && (
            <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-auto flex flex-col">
              {renderLeftPanel()}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            <TabBar
              tabs={openTabs}
              activeTab={activeTab}
              onTabClick={(fileId) => {
                setActiveTab(fileId)
                const tab = openTabs.find((t) => t._id === fileId)
                if (tab) setCurrentFile(tab)
              }}
              onTabClose={(fileId) => {
                setOpenTabs((prev) => prev.filter((t) => t._id !== fileId))
                if (activeTab === fileId) {
                  const remaining = openTabs.filter((t) => t._id !== fileId)
                  if (remaining.length > 0) {
                    setActiveTab(remaining[0]._id)
                    setCurrentFile(remaining[0])
                  } else {
                    setActiveTab("")
                    setCurrentFile(null)
                  }
                }
              }}
            />

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              {currentFile ? (
                <MonacoEditor
                  value={currentFile.content}
                  language={currentFile.language}
                  theme="vs-dark"
                  onChange={handleFileChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Select a file to start editing</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - AI Chat */}
          {state.chatVisible && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-auto">
              <AIAssistant />
            </div>
          )}
        </div>

        {/* Bottom Panel - Terminal/Problems */}
        {(state.terminalVisible || state.problemsPanelVisible) && (
          <div className="h-64 bg-gray-800 border-t border-gray-700 overflow-auto">
            {renderBottomPanel()}
          </div>
        )}

        {/* Diff Viewer */}
        {state.diffViewerVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-gray-900 rounded-lg w-5/6 h-5/6 flex flex-col border border-gray-700">
              <DiffViewer />
            </div>
          </div>
        )}

        {/* Command Palette */}
        <CommandPalette
          open={state.commandPaletteOpen}
          onClose={() => dispatch({ type: "TOGGLE_COMMAND_PALETTE" })}
        />

        {/* Status Bar */}
        <StatusBar />

        {/* Toolbar */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex gap-4">
          <Button
            onClick={handleSaveFile}
            disabled={!currentFile?.isDirty}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            onClick={handleExecuteCode}
            disabled={isExecuting}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? "Executing..." : "Execute"}
          </Button>
        </div>
      </div>
    </ZenMode>
  )
}
