"use client"

import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { EditorProvider, useEditor } from "@/lib/editor-store"
import dynamic from "next/dynamic"
import { EnhancedTerminal } from "@/components/enhanced-terminal"
import { MenuBar } from "@/components/menu-bar"
import { StatusBar } from "@/components/status-bar"
import { AIAssistant } from "@/components/ai-assistant"
import { ProblemsPanel } from "@/components/problems-panel"
import { AdvancedDebugger } from "@/components/advanced-debugger"
import { ExtensionsPanel } from "@/components/extensions-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { EnhancedGitPanel } from "@/components/enhanced-git-panel"
import { SnippetsManager } from "@/components/snippets-manager"
import { CommandPalette } from "@/components/command-palette"
import { AdvancedSearch } from "@/components/advanced-search"
import { ActivityBar } from "@/components/activity-bar"
import { Button } from "@/components/ui/button"
import { api, getToken, languageFromFileName } from "@/lib/api"
import { Play, Save, FileCode, FilePlus, Trash2, X, ArrowLeft, Sparkles } from "lucide-react"
import { ZenMode } from "@/components/zen-mode"

const MonacoEditor = dynamic(() => import("@/components/monaco-editor").then((m) => m.MonacoEditor), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-400">Loading editor...</div>,
})
import { AdvancedFormatter } from "@/components/advanced-formatter"
import { ThemesManager } from "@/components/themes-manager"
import { OutlineNavigator } from "@/components/outline-navigator"
import { RunDebugConfig } from "@/components/run-debug-config"

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
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <EditorProvider>
        <EnhancedEditor />
      </EditorProvider>
    </Suspense>
  )
}

function EnhancedEditor() {
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
  const [outputVisible, setOutputVisible] = useState(false)

  // Fetch project and files
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("No project selected")
        return
      }

      try {
        if (!getToken()) {
          router.push("/auth/login")
          return
        }
        const data = await api<{ project: Project }>(`/projects/${projectId}`)
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
  }, [projectId, router])

  // Initialize WebSocket
  useEffect(() => {
    if (!projectId) return

    const token = getToken()
    if (!token) return

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || `${window.location.protocol}//${window.location.hostname}:5000`
    const socket = io(wsUrl, {
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
    setOpenTabs((prev) => prev.map((t) => (t._id === currentFile._id ? { ...t, content, isDirty: true } : t)))

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
      await api(`/files/${currentFile._id}`, { method: "PUT", json: { content: currentFile.content } })

      const saved = { ...currentFile, isDirty: false }
      setCurrentFile(saved)
      setOpenTabs((prev) => prev.map((t) => (t._id === saved._id ? saved : t)))
      setProject((prev) =>
        prev ? { ...prev, files: prev.files.map((f) => (f._id === saved._id ? saved : f)) } : prev
      )

      if (socketRef.current) {
        socketRef.current.emit("file-save", {
          fileId: currentFile._id,
          content: currentFile.content,
        })
      }
    } catch (err: any) {
      setTerminalOutput(`Save failed: ${err.message}\n`)
      setOutputVisible(true)
    }
  }, [currentFile])

  const handleExecuteCode = useCallback(async () => {
    if (!currentFile) return

    setIsExecuting(true)
    setOutputVisible(true)
    setTerminalOutput(`$ run ${currentFile.name}\n`)

    try {
      const result = await api<{ output: string; error: string; duration: number }>("/execute", {
        method: "POST",
        json: { code: currentFile.content, language: currentFile.language },
      })
      setTerminalOutput(
        (prev) =>
          `${prev}${result.output || ""}${result.error ? `${result.error}\n` : ""}\n[finished in ${result.duration}ms]`
      )
      setIsExecuting(false)

      if (socketRef.current) {
        socketRef.current.emit("execute-code", {
          fileId: currentFile._id,
          language: currentFile.language,
        })
      }
    } catch (err: any) {
      setTerminalOutput((prev) => `${prev}Error: ${err.message}`)
      setIsExecuting(false)
    }
  }, [currentFile])

  const handleCreateNewFile = useCallback(async () => {
    const fileName = prompt("Enter file name:")
    if (!fileName || !projectId) return

    try {
      const { file } = await api<{ file: File }>("/files", {
        method: "POST",
        json: { projectId, name: fileName, language: languageFromFileName(fileName), content: "" },
      })
      setProject((prev) => {
        if (!prev) return null
        return { ...prev, files: [...prev.files, file] }
      })
      handleFileSelect(file)
    } catch (err: any) {
      alert(err.message)
    }
  }, [projectId, handleFileSelect])

  const handleDeleteFile = useCallback(
    async (file: File) => {
      if (!confirm(`Delete ${file.name}?`)) return
      try {
        await api(`/files/${file._id}`, { method: "DELETE" })
        setProject((prev) => (prev ? { ...prev, files: prev.files.filter((f) => f._id !== file._id) } : prev))
        setOpenTabs((prev) => prev.filter((t) => t._id !== file._id))
        if (currentFile?._id === file._id) {
          setCurrentFile(null)
          setActiveTab("")
        }
      } catch (err: any) {
        alert(err.message)
      }
    },
    [currentFile]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K + Z: Toggle Zen Mode
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        const nextKeyPromise = new Promise<KeyboardEvent>((resolve) => {
          const handleNextKey = (event: KeyboardEvent) => {
            document.removeEventListener("keydown", handleNextKey)
            resolve(event)
          }
          document.addEventListener("keydown", handleNextKey)
        })
        nextKeyPromise.then((event) => {
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

  const renderExplorer = () => (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 truncate">
                {project.name}
              </span>
              <button
                onClick={handleCreateNewFile}
                title="New file"
                aria-label="New file"
                className="p-1 rounded hover:bg-gray-700"
              >
                <FilePlus className="w-4 h-4" />
              </button>
            </div>
            <ul className="py-1">
              {project.files.map((file) => (
                <li
                  key={file._id}
                  className={`group flex items-center gap-2 px-3 py-1 text-sm cursor-pointer hover:bg-gray-700 ${
                    activeTab === file._id ? "bg-gray-700 text-white" : "text-gray-300"
                  }`}
                  onClick={() => handleFileSelect(openTabs.find((t) => t._id === file._id) || file)}
                >
                  <FileCode className="w-4 h-4 shrink-0 text-blue-400" />
                  <span className="truncate flex-1">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(file)
                    }}
                    title="Delete file"
                    aria-label={`Delete ${file.name}`}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )

  const renderLeftPanel = () => {
    switch (state.activeLeftPanel) {
      case "explorer":
        return renderExplorer()
      case "search":
        return <AdvancedSearch />
      case "git":
        return <EnhancedGitPanel />
      case "debug":
        return <AdvancedDebugger />
      case "extensions":
        return <ExtensionsPanel />
      case "settings":
        return <SettingsPanel />
      case "outline":
        return <OutlineNavigator />
      default:
        return renderExplorer()
    }
  }

  const renderBottomPanel = () => {
    switch (state.activeBottomPanel) {
      case "terminal":
        return <EnhancedTerminal />
      case "problems":
        return <ProblemsPanel />
      case "output":
        return <div className="p-4 text-gray-400">Output panel</div>
      default:
        return <EnhancedTerminal />
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
            <div className="h-9 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto">
              {openTabs.map((tab) => (
                <div
                  key={tab._id}
                  onClick={() => {
                    setActiveTab(tab._id)
                    setCurrentFile(tab)
                  }}
                  className={`group h-full flex items-center gap-2 px-3 text-sm cursor-pointer border-r border-gray-700 ${
                    activeTab === tab._id ? "bg-gray-900 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="truncate">{tab.name}</span>
                  {tab.isDirty && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                  <button
                    aria-label={`Close ${tab.name}`}
                    className="opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      const remaining = openTabs.filter((t) => t._id !== tab._id)
                      setOpenTabs(remaining)
                      if (activeTab === tab._id) {
                        setActiveTab(remaining[0]?._id || "")
                        setCurrentFile(remaining[0] || null)
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden">
              {currentFile ? (
                <MonacoEditor
                  value={currentFile.content}
                  language={currentFile.language}
                  theme={state.theme === "dark" ? "vs-dark" : "vs-light"}
                  onChange={handleFileChange}
                  onSave={handleSaveFile}
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

        {outputVisible && (
          <div className="h-48 bg-gray-950 border-t border-gray-700 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 text-xs uppercase text-gray-400">
              <span>Output</span>
              <button onClick={() => setOutputVisible(false)} aria-label="Close output" className="p-1 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <pre data-testid="execution-output" className="flex-1 overflow-auto p-3 text-sm font-mono text-green-300 whitespace-pre-wrap">
              {terminalOutput}
            </pre>
          </div>
        )}

        {/* Bottom Panel - Terminal/Problems */}
        {(state.terminalVisible || state.problemsPanelVisible) && (
          <div className="h-64 bg-gray-800 border-t border-gray-700 overflow-auto">
            {renderBottomPanel()}
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
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
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
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: "TOGGLE_AI_CHAT" })}
            className="flex items-center gap-2 ml-auto"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
        </div>
      </div>
    </ZenMode>
  )
}
