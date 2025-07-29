"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"

export interface FileItem {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  language?: string
  size?: number
  modified?: Date
  isDirty?: boolean
  children?: FileItem[]
}

export interface Tab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
}

export interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
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
  openTabs: Tab[]
  activeTabId: string | null
  sidebarVisible: boolean
  chatVisible: boolean
  terminalVisible: boolean
  previewVisible: boolean
  commandPaletteOpen: boolean
  chatMessages: ChatMessage[]
  livePreview: LivePreview | null
  executionStatus: "idle" | "running" | "completed" | "error"
  theme: "light" | "dark"
}

type EditorAction =
  | { type: "ADD_TAB"; payload: Tab }
  | { type: "CLOSE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string }
  | { type: "UPDATE_TAB_CONTENT"; payload: { id: string; content: string } }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_AI_CHAT" }
  | { type: "TOGGLE_TERMINAL" }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_LIVE_PREVIEW"; payload: LivePreview }
  | { type: "SET_EXECUTION_STATUS"; payload: EditorState["executionStatus"] }
  | { type: "SET_THEME"; payload: "light" | "dark" }

const initialState: EditorState = {
  openTabs: [],
  activeTabId: null,
  sidebarVisible: true,
  chatVisible: false,
  terminalVisible: false,
  previewVisible: false,
  commandPaletteOpen: false,
  chatMessages: [
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI coding assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ],
  livePreview: null,
  executionStatus: "idle",
  theme: "dark",
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "ADD_TAB":
      const existingTab = state.openTabs.find(tab => tab.path === action.payload.path)
      if (existingTab) {
        return {
          ...state,
          activeTabId: existingTab.id,
        }
      }
      return {
        ...state,
        openTabs: [...state.openTabs, action.payload],
        activeTabId: action.payload.id,
      }

    case "CLOSE_TAB":
      const newTabs = state.openTabs.filter(tab => tab.id !== action.payload)
      const newActiveId = state.activeTabId === action.payload
        ? newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        : state.activeTabId
      return {
        ...state,
        openTabs: newTabs,
        activeTabId: newActiveId,
      }

    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTabId: action.payload,
      }

    case "UPDATE_TAB_CONTENT":
      return {
        ...state,
        openTabs: state.openTabs.map(tab =>
          tab.id === action.payload.id
            ? { ...tab, content: action.payload.content, isDirty: true }
            : tab
        ),
      }

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarVisible: !state.sidebarVisible,
      }

    case "TOGGLE_AI_CHAT":
      return {
        ...state,
        chatVisible: !state.chatVisible,
      }

    case "TOGGLE_TERMINAL":
      return {
        ...state,
        terminalVisible: !state.terminalVisible,
      }

    case "TOGGLE_PREVIEW":
      return {
        ...state,
        previewVisible: !state.previewVisible,
      }

    case "TOGGLE_COMMAND_PALETTE":
      return {
        ...state,
        commandPaletteOpen: !state.commandPaletteOpen,
      }

    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      }

    case "SET_LIVE_PREVIEW":
      return {
        ...state,
        livePreview: action.payload,
      }

    case "SET_EXECUTION_STATUS":
      return {
        ...state,
        executionStatus: action.payload,
      }

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      }

    default:
      return state
  }
}

interface EditorContextType {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within EditorProvider")
  }
  return context
}