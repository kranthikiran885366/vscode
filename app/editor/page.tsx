'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MenuBar } from '@/components/menu-bar'
import { ActivityBar } from '@/components/activity-bar'
import { FileExplorer } from '@/components/file-explorer'
import { SearchPanel } from '@/components/search-panel'
import { AIAssistant } from '@/components/ai-assistant'
import { CollaborationPanel } from '@/components/collaboration'
import { LivePreview } from '@/components/live-preview'
import { TabBar } from '@/components/tab-bar'
import { Terminal } from '@/components/terminal'
import { StatusBar } from '@/components/status-bar'
import { CommandPalette } from '@/components/command-palette'
import { EditorProvider, useEditor } from '@/lib/editor-store'
import { Button } from '@/components/ui/button'
import { Code2, Loader } from 'lucide-react'

function EditorContent() {
  const router = useRouter()
  const { state, dispatch } = useEditor()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        // Fetch user data
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('token')
          router.push('/auth/login')
          return
        }

        const data = await response.json()
        setUser(data.user)

        // Load projects
        const projectsResponse = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData.projects || [])

          // Load first project's files if available
          if (projectsData.projects && projectsData.projects.length > 0) {
            const firstProject = projectsData.projects[0]
            loadProjectFiles(firstProject._id, token)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadProjectFiles = async (projectId: string, token: string) => {
    try {
      const response = await fetch(`/api/files/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Load files into editor
        data.files.forEach((file: any) => {
          dispatch({
            type: 'ADD_TAB',
            payload: {
              id: file._id,
              name: file.name,
              path: file.path,
              content: file.content,
              language: file.language,
              isDirty: false,
            },
          })
        })
      }
    } catch (error) {
      console.error('Load files error:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading ZenCode...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Menu Bar */}
      <MenuBar
        onCommandPalette={() => setShowCommandPalette(true)}
        onQuickOpen={() => {}}
      />

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        {state.sidebarVisible && <ActivityBar />}

        {/* Left Sidebar */}
        {state.sidebarVisible && (
          <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {state.activeLeftPanel === 'explorer' && <FileExplorer />}
            {state.activeLeftPanel === 'search' && <SearchPanel />}
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {state.openTabs.length > 0 && <TabBar />}

          {/* Editor Content */}
          <div className="flex-1 bg-white dark:bg-gray-900">
            {state.openTabs.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <Code2 className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Welcome to ZenCode AI
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    {user ? `Welcome, ${user.name}! ` : ''}Open a file from the explorer to get started.
                  </p>

                  <div className="space-y-4">
                    <Button
                      onClick={() => dispatch({ type: 'SET_ACTIVE_LEFT_PANEL', payload: 'explorer' })}
                      className="w-full md:w-auto"
                    >
                      Open File Explorer
                    </Button>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="ml-2"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full p-4">
                {state.openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`h-full ${
                      state.activeTabId === tab.id ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="h-full bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-4 overflow-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {tab.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        {state.rightSidebarVisible && (
          <div className="w-64 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            {state.activeRightPanel === 'collaboration' && <CollaborationPanel />}
            {state.activeRightPanel === 'preview' && <LivePreview />}
            {state.activeRightPanel === 'ai-chat' && <AIAssistant />}
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      {state.bottomPanelVisible && (
        <div className="h-48 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {state.activeBottomPanel === 'terminal' && <Terminal />}
        </div>
      )}

      {/* Status Bar */}
      <StatusBar />

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  )
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  )
}
