"use client"

import { useState, useEffect } from "react"
import { MenuBar } from "../components/menu-bar"
import { ActivityBar } from "../components/activity-bar"
import { FileExplorer } from "../components/file-explorer"
import { SearchPanel } from "../components/search-panel"
import { AIAssistant } from "../components/ai-assistant"
import { CollaborationPanel } from "../components/collaboration"
import { LivePreview } from "../components/live-preview"
import { TabBar } from "../components/tab-bar"
import { Terminal } from "../components/terminal"
import { StatusBar } from "../components/status-bar"
import { CommandPalette } from "../components/command-palette"
import { EditorProvider, useEditor } from "../lib/editor-store"
import { Layout, Code2, Sparkles, Users, Monitor, Bot, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

function EditorContent() {
  const { state, dispatch } = useEditor()
  const [showWelcome, setShowWelcome] = useState(true)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showQuickOpen, setShowQuickOpen] = useState(false)

  // Initialize with sample files
  useEffect(() => {
    const sampleTab = {
      id: "welcome",
      name: "Welcome.md",
      path: "/Welcome.md",
      content: `# Welcome to Advanced Code Editor

This is a powerful, AI-enhanced code editor that combines the best features of:

- **VS Code**: Professional IDE experience
- **Cursor**: AI-powered coding assistance  
- **Replit**: Cloud collaboration and live preview
- **Bolt**: Minimalistic, distraction-free design

## Features

### 🤖 AI-Powered Development
- Intelligent code completion
- AI chat assistant for code help
- Automatic refactoring suggestions
- Test generation from code

### 👥 Real-time Collaboration
- Live multi-user editing
- Shared cursors and selections
- Project sharing with links
- Integrated chat and comments

### ☁️ Cloud-Native
- Auto-save and sync
- Containerized code execution
- Live preview for web apps
- Environment management

### 🎨 Modern Interface
- Dark/Light themes
- Zen mode for focus
- Responsive design
- Customizable layout

Get started by exploring the features or opening a file from the explorer!
`,
      language: "markdown",
      isDirty: false,
    }

    dispatch({ type: "ADD_TAB", payload: sampleTab })
    setShowWelcome(false)
  }, [dispatch])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Menu Bar */}
      <MenuBar 
        onCommandPalette={() => setShowCommandPalette(true)}
        onQuickOpen={() => setShowQuickOpen(true)}
      />

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        {state.sidebarVisible && <ActivityBar />}

        {/* Left Sidebar */}
        {state.sidebarVisible && (
          <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {state.activeLeftPanel === "explorer" && <FileExplorer />}
            {state.activeLeftPanel === "search" && <SearchPanel />}
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {state.openTabs.length > 0 && <TabBar />}

          {/* Editor Content */}
          <div className="flex-1 bg-white dark:bg-gray-900">
            {showWelcome && state.openTabs.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="mb-8">
                    <Code2 className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                      Welcome to Advanced Code Editor
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      A powerful, AI-enhanced IDE that combines the best features of modern development tools
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Bot className="w-8 h-8 mb-3 text-purple-500" />
                      <h3 className="font-semibold mb-2">AI-Powered</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Intelligent code completion, AI assistance, and automated refactoring
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Users className="w-8 h-8 mb-3 text-green-500" />
                      <h3 className="font-semibold mb-2">Collaborative</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Real-time editing with team members and shared workspaces
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Monitor className="w-8 h-8 mb-3 text-blue-500" />
                      <h3 className="font-semibold mb-2">Live Preview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Instant preview of web applications and real-time updates
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Zap className="w-8 h-8 mb-3 text-yellow-500" />
                      <h3 className="font-semibold mb-2">Fast & Modern</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lightning-fast performance with modern development tools
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })}
                      className="w-full md:w-auto"
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      Open File Explorer
                    </Button>
                    <p className="text-sm text-gray-500">
                      Or use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘P</kbd> to quickly open files
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state.openTabs.length > 0 && (
              <div className="h-full p-4">
                {state.openTabs.map((tab) => (
                  <div 
                    key={tab.id}
                    className={`h-full ${state.activeTabId === tab.id ? 'block' : 'hidden'}`}
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
            {state.activeRightPanel === "collaboration" && <CollaborationPanel />}
            {state.activeRightPanel === "preview" && <LivePreview />}
            {state.activeRightPanel === "ai-chat" && <AIAssistant />}
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      {state.bottomPanelVisible && (
        <div className="h-48 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {state.activeBottomPanel === "terminal" && <Terminal />}
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

export default function AdvancedCodeEditor() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  )
}