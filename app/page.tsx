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

  // Mock user authentication
  useEffect(() => {
    // Simulate user login
    setTimeout(() => {
      dispatch({
        type: "SET_USER",
        payload: {
          id: "user-current",
          name: "John Developer",
          email: "john@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      })
    }, 1000)
  }, [dispatch])

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
- Customizable layouts

## Getting Started

1. **Open a file** from the Explorer panel
2. **Start coding** with AI assistance
3. **Share your project** for collaboration
4. **Preview your app** in real-time

Happy coding! 🚀`,
      language: "markdown",
      isDirty: false,
    }

    dispatch({ type: "ADD_TAB", payload: sampleTab })
  }, [dispatch])

  const renderLeftPanel = () => {
    switch (state.activeLeftPanel) {
      case "explorer":
        return <FileExplorer />
      case "search":
        return <SearchPanel />
      case "git":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">SOURCE CONTROL</h3>
            <p className="text-sm text-gray-500">Git integration coming soon...</p>
          </div>
        )
      case "debug":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">RUN AND DEBUG</h3>
            <p className="text-sm text-gray-500">Debug functionality coming soon...</p>
          </div>
        )
      case "extensions":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">EXTENSIONS</h3>
            <p className="text-sm text-gray-500">Extensions marketplace coming soon...</p>
          </div>
        )
      case "testing":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">TESTING</h3>
            <p className="text-sm text-gray-500">Test explorer coming soon...</p>
          </div>
        )
      case "settings":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">SETTINGS</h3>
            <p className="text-sm text-gray-500">Settings panel coming soon...</p>
          </div>
        )
      default:
        return <FileExplorer />
    }
  }

  const renderRightPanel = () => {
    switch (state.activeRightPanel) {
      case "ai-chat":
        return <AIAssistant />
      case "collaboration":
        return <CollaborationPanel />
      case "live-preview":
        return <LivePreview />
      case "outline":
        return (
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-4">OUTLINE</h3>
            <p className="text-sm text-gray-500">Code outline coming soon...</p>
          </div>
        )
      default:
        return <AIAssistant />
    }
  }

  const activeTab = state.openTabs.find((tab) => tab.id === state.activeTabId)

  const renderWelcomeScreen = () => (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Code2 className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Advanced Code Editor
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          AI-powered development with real-time collaboration and cloud execution
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get intelligent code suggestions, explanations, and refactoring help
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Collaboration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Code together in real-time with shared cursors and chat
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Preview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See your changes instantly with containerized execution
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Smart Features</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Auto-completion, error detection, and intelligent refactoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => {
              dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })
              setShowWelcome(false)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Layout className="w-4 h-4 mr-2" />
            Open Explorer
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              dispatch({ type: "TOGGLE_AI_CHAT" })
              setShowWelcome(false)
            }}
          >
            <Bot className="w-4 h-4 mr-2" />
            Try AI Assistant
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              dispatch({ type: "SET_COLLABORATION", payload: true })
              dispatch({ type: "SET_ACTIVE_RIGHT_PANEL", payload: "collaboration" })
              dispatch({ type: "SET_RIGHT_SIDEBAR_VISIBLE", payload: true })
              setShowWelcome(false)
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Start Collaborating
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">⌘⇧P</kbd> to open command
          palette
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={`h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${state.zenMode ? "zen-mode" : ""}`}
    >
      {/* Menu Bar */}
      {!state.zenMode && (
        <MenuBar
          onCommandPalette={() => dispatch({ type: "SET_COMMAND_PALETTE_OPEN", payload: true })}
          onQuickOpen={() => dispatch({ type: "SET_QUICK_OPEN_OPEN", payload: true })}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        {!state.zenMode && <ActivityBar />}

        {/* Left Sidebar */}
        {state.sidebarVisible && !state.zenMode && (
          <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">{renderLeftPanel()}</div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar */}
          {state.openTabs.length > 0 && (
            <TabBar
              tabs={state.openTabs}
              activeTabId={state.activeTabId}
              onTabSelect={(tabId) => dispatch({ type: "SET_ACTIVE_TAB", payload: tabId })}
              onTabClose={(tabId) => dispatch({ type: "CLOSE_TAB", payload: tabId })}
              onTabSave={(tabId) => {
                console.log("Save tab", tabId)
              }}
            />
          )}

          {/* Editor Content */}
          <div className="flex-1 relative">
            {activeTab ? (
              <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-4xl mx-auto p-8">
                  <Code2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">{activeTab.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">Monaco Editor integration would go here</p>
                  <p className="text-xs text-gray-400 mb-6">
                    Language: {activeTab.language} | Path: {activeTab.path}
                  </p>

                  {/* Content Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-left max-h-96 overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap">{activeTab.content}</pre>
                  </div>

                  {/* AI Suggestions */}
                  {state.aiEnabled && (
                    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          AI Suggestions Available
                        </span>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Press Tab to accept AI completions, or ask the AI assistant for help
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : showWelcome ? (
              renderWelcomeScreen()
            ) : (
              <div className="h-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">No File Open</h2>
                  <p className="text-sm text-gray-500">Open a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          {state.bottomPanelVisible && !state.zenMode && (
            <Terminal
              visible={state.bottomPanelVisible}
              onToggle={() => dispatch({ type: "SET_BOTTOM_PANEL_VISIBLE", payload: !state.bottomPanelVisible })}
            />
          )}
        </div>

        {/* Right Sidebar */}
        {state.rightSidebarVisible && !state.zenMode && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">{renderRightPanel()}</div>
        )}
      </div>

      {/* Status Bar */}
      {!state.zenMode && (
        <StatusBar
          activeFile={activeTab?.name}
          language={activeTab?.language}
          line={42}
          column={15}
          selection="5 lines"
          errors={0}
          warnings={1}
          gitBranch="main"
          gitStatus="clean"
          liveShare={state.isCollaborating}
          copilotStatus="ready"
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        open={state.commandPaletteOpen}
        onClose={() => dispatch({ type: "SET_COMMAND_PALETTE_OPEN", payload: false })}
      />

      {/* Collaboration Cursors */}
      {state.isCollaborating && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {state.collaborators.map(
            (user) =>
              user.cursor && (
                <div
                  key={user.id}
                  className="absolute transition-all duration-100 ease-out"
                  style={{
                    left: user.cursor.x,
                    top: user.cursor.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: user.cursor.color }}
                  />
                  <div
                    className="absolute top-5 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: user.cursor.color }}
                  >
                    {user.name}
                  </div>
                </div>
              ),
          )}
        </div>
      )}

      {/* Zen Mode Toggle */}
      {state.zenMode && (
        <Button
          className="fixed top-4 right-4 z-50 bg-transparent"
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_ZEN_MODE" })}
        >
          Exit Zen Mode
        </Button>
      )}

      {/* Floating Action Buttons */}
      {!state.zenMode && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
          {!state.aiChatOpen && (
            <Button
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => dispatch({ type: "TOGGLE_AI_CHAT" })}
              title="Open AI Assistant"
            >
              <Bot className="w-5 h-5" />
            </Button>
          )}

          {!state.isCollaborating && (
            <Button
              className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={() => {
                dispatch({ type: "SET_COLLABORATION", payload: true })
                dispatch({ type: "SET_ACTIVE_RIGHT_PANEL", payload: "collaboration" })
                dispatch({ type: "SET_RIGHT_SIDEBAR_VISIBLE", payload: true })
              }}
              title="Start Live Share"
            >
              <Users className="w-5 h-5" />
            </Button>
          )}
        </div>
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
