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
import { EditorProvider, useEditor } from "../lib/editor-context"
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
            {showWelcome && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Welcome to Advanced Code Editor</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Open a file to get started or explore the features
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        {state.rightSidebarVisible && (
          <div className="w-64 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            {state.activeRightPanel === "collaboration" && <CollaborationPanel />}
            {state.activeRightPanel === "preview" && <LivePreview />}
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