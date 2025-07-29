export interface FileItem {
  id: string
  name: string
  path: string
  type: "file" | "folder"
  children?: FileItem[]
  content?: string
  language?: string
  isOpen?: boolean
  isDirty?: boolean
}

export interface Tab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty: boolean
}

export interface EditorState {
  files: FileItem[]
  openTabs: Tab[]
  activeTabId: string | null
  sidebarVisible: boolean
  terminalVisible: boolean
  currentPanel: "explorer" | "search" | "git" | "debug" | "extensions"
  theme: "light" | "dark"
}

export interface Extension {
  id: string
  name: string
  description: string
  version: string
  author: string
  installed: boolean
  enabled: boolean
}
