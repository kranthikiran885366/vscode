"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  cursor?: {
    x: number
    y: number
    color: string
  }
}

export interface FileItem {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  children?: FileItem[]
  content?: string
  language?: string
  size?: number
  modified?: Date
  isDirty?: boolean
  isOpen?: boolean
  version?: number
}

export interface Tab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
  isPinned?: boolean
  isPreview?: boolean
  aiSuggestions?: AISuggestion[]
}

export interface AISuggestion {
  id: string
  text: string
  position: { line: number; column: number }
  confidence: number
  type: "completion" | "refactor" | "fix" | "test"
}

export interface ChatMessage {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  codeContext?: string
}

export interface LivePreview {
  url: string
  status: "loading" | "ready" | "error"
  port: number
}

export interface EditorState {
  // User & Auth
  user: User | null
  collaborators: User[]

  // Layout
  sidebarVisible: boolean
  rightSidebarVisible: boolean
  bottomPanelVisible: boolean
  activeLeftPanel: string
  activeRightPanel: string
  activeBottomPanel: string
  zenMode: boolean

  // Theme & Settings
  theme: "light" | "dark"
  fontSize: number
  lineHeight: number
  minimap: boolean
  wordWrap: boolean

  // Files and Tabs
  files: FileItem[]
  openTabs: Tab[]
  activeTabId: string | null

  // AI Features
  aiEnabled: boolean
  aiChatOpen: boolean
  chatMessages: ChatMessage[]
  aiSuggestions: AISuggestion[]
  aiContext: string

  // Collaboration
  isCollaborating: boolean
  shareLink: string | null

  // Cloud & Execution
  projectId: string | null
  isCloudSynced: boolean
  executionStatus: "idle" | "running" | "error"
  livePreview: LivePreview | null

  // Terminal & Output
  terminalOutput: string[]
  problems: any[]

  // Search & Navigation
  searchQuery: string
  searchResults: any[]
  commandPaletteOpen: boolean
  quickOpenOpen: boolean
}

type EditorAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "ADD_COLLABORATOR"; payload: User }
  | { type: "REMOVE_COLLABORATOR"; payload: string }
  | { type: "SET_SIDEBAR_VISIBLE"; payload: boolean }
  | { type: "SET_RIGHT_SIDEBAR_VISIBLE"; payload: boolean }
  | { type: "SET_BOTTOM_PANEL_VISIBLE"; payload: boolean }
  | { type: "SET_ACTIVE_LEFT_PANEL"; payload: string }
  | { type: "SET_ACTIVE_RIGHT_PANEL"; payload: string }
  | { type: "SET_ACTIVE_BOTTOM_PANEL"; payload: string }
  | { type: "TOGGLE_ZEN_MODE" }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_FONT_SIZE"; payload: number }
  | { type: "ADD_TAB"; payload: Tab }
  | { type: "CLOSE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "UPDATE_TAB_CONTENT"; payload: { id: string; content: string } }
  | { type: "SET_AI_ENABLED"; payload: boolean }
  | { type: "TOGGLE_AI_CHAT" }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_AI_SUGGESTIONS"; payload: AISuggestion[] }
  | { type: "SET_COLLABORATION"; payload: boolean }
  | { type: "SET_SHARE_LINK"; payload: string | null }
  | { type: "SET_LIVE_PREVIEW"; payload: LivePreview | null }
  | { type: "SET_EXECUTION_STATUS"; payload: "idle" | "running" | "error" }
  | { type: "ADD_TERMINAL_OUTPUT"; payload: string }
  | { type: "SET_COMMAND_PALETTE_OPEN"; payload: boolean }
  | { type: "SET_QUICK_OPEN_OPEN"; payload: boolean }

const initialState: EditorState = {
  user: null,
  collaborators: [],
  sidebarVisible: true,
  rightSidebarVisible: false,
  bottomPanelVisible: true,
  activeLeftPanel: "explorer",
  activeRightPanel: "ai-chat",
  activeBottomPanel: "terminal",
  zenMode: false,
  theme: "dark",
  fontSize: 14,
  lineHeight: 1.5,
  minimap: true,
  wordWrap: true,
  files: [],
  openTabs: [],
  activeTabId: null,
  aiEnabled: true,
  aiChatOpen: false,
  chatMessages: [],
  aiSuggestions: [],
  aiContext: "",
  isCollaborating: false,
  shareLink: null,
  projectId: null,
  isCloudSynced: false,
  executionStatus: "idle",
  livePreview: null,
  terminalOutput: [],
  problems: [],
  searchQuery: "",
  searchResults: [],
  commandPaletteOpen: false,
  quickOpenOpen: false,
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "ADD_COLLABORATOR":
      return {
        ...state,
        collaborators: [...state.collaborators.filter((c) => c.id !== action.payload.id), action.payload],
      }
    case "REMOVE_COLLABORATOR":
      return {
        ...state,
        collaborators: state.collaborators.filter((c) => c.id !== action.payload),
      }
    case "SET_SIDEBAR_VISIBLE":
      return { ...state, sidebarVisible: action.payload }
    case "SET_ACTIVE_LEFT_PANEL":
      return {
        ...state,
        activeLeftPanel: action.payload,
        sidebarVisible: state.activeLeftPanel === action.payload ? !state.sidebarVisible : true,
      }
    case "TOGGLE_ZEN_MODE":
      return {
        ...state,
        zenMode: !state.zenMode,
        sidebarVisible: state.zenMode ? true : false,
        rightSidebarVisible: state.zenMode ? false : false,
        bottomPanelVisible: state.zenMode ? true : false,
      }
    case "SET_THEME":
      return { ...state, theme: action.payload }
    case "ADD_TAB":
      return {
        ...state,
        openTabs: [...state.openTabs, action.payload],
        activeTabId: action.payload.id,
      }
    case "CLOSE_TAB":
      const newTabs = state.openTabs.filter((tab) => tab.id !== action.payload)
      const newActiveId =
        state.activeTabId === action.payload
          ? newTabs.length > 0
            ? newTabs[newTabs.length - 1].id
            : null
          : state.activeTabId
      return {
        ...state,
        openTabs: newTabs,
        activeTabId: newActiveId,
      }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.payload }
    case "UPDATE_TAB_CONTENT":
      return {
        ...state,
        openTabs: state.openTabs.map((tab) =>
          tab.id === action.payload.id ? { ...tab, content: action.payload.content, isDirty: true } : tab,
        ),
      }
    case "TOGGLE_AI_CHAT":
      return {
        ...state,
        aiChatOpen: !state.aiChatOpen,
        rightSidebarVisible: !state.aiChatOpen ? true : state.rightSidebarVisible,
        activeRightPanel: !state.aiChatOpen ? "ai-chat" : state.activeRightPanel,
      }
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      }
    case "SET_AI_SUGGESTIONS":
      return { ...state, aiSuggestions: action.payload }
    case "SET_COLLABORATION":
      return { ...state, isCollaborating: action.payload }
    case "SET_SHARE_LINK":
      return { ...state, shareLink: action.payload }
    case "SET_LIVE_PREVIEW":
      return { ...state, livePreview: action.payload }
    case "SET_EXECUTION_STATUS":
      return { ...state, executionStatus: action.payload }
    case "ADD_TERMINAL_OUTPUT":
      return {
        ...state,
        terminalOutput: [...state.terminalOutput, action.payload],
      }
    case "SET_COMMAND_PALETTE_OPEN":
      return { ...state, commandPaletteOpen: action.payload }
    case "SET_QUICK_OPEN_OPEN":
      return { ...state, quickOpenOpen: action.payload }
    default:
      return state
  }
}

const EditorContext = createContext<{
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
} | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark")
  }, [state.theme])

  // Simulate real-time collaboration
  useEffect(() => {
    if (state.isCollaborating) {
      const interval = setInterval(() => {
        // Simulate collaborator cursor movements
        const mockCollaborator: User = {
          id: "collab-1",
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          cursor: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            color: "#3b82f6",
          },
        }
        dispatch({ type: "ADD_COLLABORATOR", payload: mockCollaborator })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [state.isCollaborating])

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
