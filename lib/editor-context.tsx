"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

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
}

export interface GitFile {
  path: string
  status: "modified" | "added" | "deleted" | "renamed" | "untracked"
  staged: boolean
}

export interface Breakpoint {
  id: string
  file: string
  line: number
  enabled: boolean
  condition?: string
}

export interface Extension {
  id: string
  name: string
  description: string
  version: string
  author: string
  rating: number
  downloads: number
  installed: boolean
  enabled: boolean
  category: string
}

export interface EditorState {
  // Layout
  sidebarVisible: boolean
  rightSidebarVisible: boolean
  bottomPanelVisible: boolean
  activeLeftPanel: string
  activeRightPanel: string
  activeBottomPanel: string

  // Theme
  theme: "light" | "dark"
  fontSize: number
  lineHeight: number

  // Files and Tabs
  files: FileItem[]
  openTabs: Tab[]
  activeTabId: string | null

  // Git
  gitFiles: GitFile[]
  currentBranch: string
  commitMessage: string

  // Debug
  breakpoints: Breakpoint[]
  isDebugging: boolean

  // Extensions
  extensions: Extension[]

  // Search
  searchQuery: string
  searchResults: any[]

  // Settings
  autoSave: boolean
  wordWrap: boolean
  minimap: boolean

  // Workspace
  workspacePath: string
  recentWorkspaces: string[]
}

type EditorAction =
  | { type: "SET_SIDEBAR_VISIBLE"; payload: boolean }
  | { type: "SET_ACTIVE_LEFT_PANEL"; payload: string }
  | { type: "SET_ACTIVE_RIGHT_PANEL"; payload: string }
  | { type: "SET_ACTIVE_BOTTOM_PANEL"; payload: string }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "ADD_TAB"; payload: Tab }
  | { type: "CLOSE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "UPDATE_TAB_CONTENT"; payload: { id: string; content: string } }
  | { type: "SET_GIT_FILES"; payload: GitFile[] }
  | { type: "SET_COMMIT_MESSAGE"; payload: string }
  | { type: "ADD_BREAKPOINT"; payload: Breakpoint }
  | { type: "REMOVE_BREAKPOINT"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FONT_SIZE"; payload: number }

const initialState: EditorState = {
  sidebarVisible: true,
  rightSidebarVisible: false,
  bottomPanelVisible: true,
  activeLeftPanel: "explorer",
  activeRightPanel: "outline",
  activeBottomPanel: "terminal",
  theme: "dark",
  fontSize: 14,
  lineHeight: 1.5,
  files: [],
  openTabs: [],
  activeTabId: null,
  gitFiles: [],
  currentBranch: "main",
  commitMessage: "",
  breakpoints: [],
  isDebugging: false,
  extensions: [],
  searchQuery: "",
  searchResults: [],
  autoSave: true,
  wordWrap: true,
  minimap: true,
  workspacePath: "/workspace",
  recentWorkspaces: [],
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_SIDEBAR_VISIBLE":
      return { ...state, sidebarVisible: action.payload }
    case "SET_ACTIVE_LEFT_PANEL":
      return {
        ...state,
        activeLeftPanel: action.payload,
        sidebarVisible: state.activeLeftPanel === action.payload ? !state.sidebarVisible : true,
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
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.payload }
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

  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}
