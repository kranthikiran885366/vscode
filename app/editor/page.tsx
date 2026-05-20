'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { MonacoEditor } from '@/components/monaco-editor'
import { FileExplorer } from '@/components/file-explorer'
import { Terminal } from '@/components/terminal'
import { ActivityBar } from '@/components/activity-bar'
import { MenuBar } from '@/components/menu-bar'
import { TabBar } from '@/components/tab-bar'
import { StatusBar } from '@/components/status-bar'
import { LivePreview } from '@/components/live-preview'
import { AIAssistant } from '@/components/ai-assistant'
import { CollaborationPanel } from '@/components/collaboration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play, Save, GitBranch, Code2, Terminal as TerminalIcon } from 'lucide-react'

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

interface EditorState {
  currentFile: File | null
  openTabs: File[]
  activeTab: string
  sidebarVisible: boolean
  bottomPanelVisible: boolean
  rightSidebarVisible: boolean
  activePanel: 'files' | 'search' | 'git'
  isExecuting: boolean
  terminalOutput: string
  collaborators: any[]
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  const socketRef = useRef<Socket | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<EditorState>({
    currentFile: null,
    openTabs: [],
    activeTab: '',
    sidebarVisible: true,
    bottomPanelVisible: false,
    rightSidebarVisible: false,
    activePanel: 'files',
    isExecuting: false,
    terminalOutput: '',
    collaborators: [],
  })

  // Fetch project and files
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError('No project selected')
        return
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to load project')
        }

        const data = await response.json()
        setProject(data.project)

        // Open first file by default
        if (data.project.files && data.project.files.length > 0) {
          const firstFile = data.project.files[0]
          setEditor((prev) => ({
            ...prev,
            currentFile: firstFile,
            openTabs: [firstFile],
            activeTab: firstFile._id,
          }))
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  // Initialize WebSocket for real-time collaboration
  useEffect(() => {
    if (!projectId) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Not authenticated')
      return
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
      auth: { token },
    })

    socket.on('connect', () => {
      console.log('✅ Connected to collaboration server')
      socket.emit('join-project', projectId)
    })

    socket.on('editor-update', (data) => {
      // Receive real-time updates from other collaborators
      console.log('📝 Editor update:', data)
      // Update local state with collaborative changes
    })

    socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data)
      setEditor((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, data],
      }))
    })

    socket.on('user-left', (data) => {
      console.log('👤 User left:', data)
      setEditor((prev) => ({
        ...prev,
        collaborators: prev.collaborators.filter((c) => c.socketId !== data.socketId),
      }))
    })

    socket.on('terminal-output', (data) => {
      setEditor((prev) => ({
        ...prev,
        terminalOutput: prev.terminalOutput + data.output + '\n',
      }))
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  const handleFileSelect = useCallback((file: File) => {
    setEditor((prev) => {
      const isAlreadyOpen = prev.openTabs.some((f) => f._id === file._id)
      const openTabs = isAlreadyOpen ? prev.openTabs : [...prev.openTabs, file]

      return {
        ...prev,
        currentFile: file,
        openTabs,
        activeTab: file._id,
      }
    })
  }, [])

  const handleFileChange = useCallback((content: string) => {
    if (!editor.currentFile) return

    setEditor((prev) => ({
      ...prev,
      currentFile: prev.currentFile ? { ...prev.currentFile, content, isDirty: true } : null,
    }))

    // Broadcast to collaborators via WebSocket
    if (socketRef.current) {
      socketRef.current.emit('editor-update', {
        fileId: editor.currentFile._id,
        content,
      })
    }
  }, [editor.currentFile])

  const handleSaveFile = useCallback(async () => {
    if (!editor.currentFile) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/files/${editor.currentFile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editor.currentFile.content }),
      })

      if (!response.ok) {
        throw new Error('Failed to save file')
      }

      setEditor((prev) => ({
        ...prev,
        currentFile: prev.currentFile ? { ...prev.currentFile, isDirty: false } : null,
      }))

      // Notify collaborators
      if (socketRef.current) {
        socketRef.current.emit('file-save', {
          fileId: editor.currentFile._id,
          content: editor.currentFile.content,
        })
      }
    } catch (err: any) {
      console.error('Save error:', err)
    }
  }, [editor.currentFile])

  const handleExecuteCode = useCallback(async () => {
    if (!editor.currentFile) return

    setEditor((prev) => ({ ...prev, isExecuting: true, terminalOutput: 'Executing...\n' }))

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          code: editor.currentFile.content,
          language: editor.currentFile.language,
        }),
      })

      const result = await response.json()

      setEditor((prev) => ({
        ...prev,
        terminalOutput: `${prev.terminalOutput}${result.output || result.error}\nExecution time: ${result.duration}ms`,
        isExecuting: false,
      }))

      // Broadcast to collaborators
      if (socketRef.current) {
        socketRef.current.emit('execute-code', {
          fileId: editor.currentFile._id,
          language: editor.currentFile.language,
        })
      }
    } catch (err: any) {
      setEditor((prev) => ({
        ...prev,
        terminalOutput: `${prev.terminalOutput}Error: ${err.message}`,
        isExecuting: false,
      }))
    }
  }, [editor.currentFile])

  const handleCreateNewFile = useCallback(async () => {
    const fileName = prompt('Enter file name:')
    if (!fileName || !projectId) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name: fileName,
          language: 'plaintext',
          content: '',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create file')
      }

      const { file } = await response.json()
      setProject((prev) => {
        if (!prev) return null
        return { ...prev, files: [...prev.files, file] }
      })
    } catch (err: any) {
      console.error('Create file error:', err)
    }
  }, [projectId])

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
          <p className="text-lg text-red-400 mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Menu Bar */}
      <MenuBar onCommandPalette={() => {}} onQuickOpen={() => {}} />

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        {editor.sidebarVisible && (
          <div className="w-14 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4">
            <button
              onClick={() =>
                setEditor((prev) => ({ ...prev, activePanel: 'files' }))
              }
              className={`p-2 rounded ${editor.activePanel === 'files' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Code2 className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setEditor((prev) => ({ ...prev, bottomPanelVisible: !prev.bottomPanelVisible }))
              }
              className="p-2 rounded hover:bg-gray-700 mt-4"
            >
              <TerminalIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded hover:bg-gray-700 mt-4">
              <GitBranch className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* File Explorer */}
        {editor.sidebarVisible && editor.activePanel === 'files' && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-auto">
            <div className="p-4">
              <h2 className="font-bold mb-4">{project.name}</h2>
              <Button onClick={handleCreateNewFile} className="w-full mb-4">
                New File
              </Button>
              <div className="space-y-2">
                {project.files.map((file) => (
                  <div
                    key={file._id}
                    onClick={() => handleFileSelect(file)}
                    className={`p-2 rounded cursor-pointer ${
                      editor.activeTab === file._id ? 'bg-blue-600' : 'hover:bg-gray-700'
                    }`}
                  >
                    <p className="text-sm">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {editor.openTabs.length > 0 && (
            <div className="bg-gray-800 border-b border-gray-700 flex items-center h-10">
              {editor.openTabs.map((tab) => (
                <button
                  key={tab._id}
                  onClick={() => handleFileSelect(tab)}
                  className={`px-4 h-full border-r border-gray-700 ${
                    editor.activeTab === tab._id ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">{tab.name}</span>
                  {tab.isDirty && <span className="ml-1">●</span>}
                </button>
              ))}
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {editor.currentFile ? (
              <MonacoEditor
                value={editor.currentFile.content}
                language={editor.currentFile.language}
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

        {/* Right Sidebar - Collaboration & Preview */}
        {editor.rightSidebarVisible && (
          <div className="w-64 bg-gray-800 border-l border-gray-700 overflow-auto">
            <div className="p-4">
              <h3 className="font-bold mb-4">Collaborators</h3>
              <div className="space-y-2">
                {editor.collaborators.map((collab) => (
                  <div key={collab.socketId} className="p-2 bg-gray-700 rounded">
                    <p className="text-sm">{collab.userId}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel - Terminal */}
      {editor.bottomPanelVisible && (
        <div className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-auto">
          <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {editor.terminalOutput || 'Terminal ready...'}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 flex gap-4">
        <Button
          onClick={handleSaveFile}
          disabled={!editor.currentFile?.isDirty}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
        <Button
          onClick={handleExecuteCode}
          disabled={editor.isExecuting}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {editor.isExecuting ? 'Executing...' : 'Execute'}
        </Button>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}
