'use client'

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * App-wide state management with Zustand
 */

// User state
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin' | 'enterprise'
  preferences?: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    codeFont: string
    tabSize: number
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null

  setUser: (user: User) => void
  setToken: (token: string, refreshToken?: string) => void
  clearAuth: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token, refreshToken) => set({ token, refreshToken }),
        clearAuth: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),
      }),
      {
        name: 'auth-store',
      }
    )
  )
)

// Project state
export interface Project {
  _id: string
  name: string
  description?: string
  language: string
  owner: string
  members: Array<{
    userId: string
    role: 'owner' | 'editor' | 'viewer'
  }>
  createdAt: Date
  updatedAt: Date
  visibility: 'private' | 'public'
  stars: number
  forks: number
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
  filter: 'all' | 'owned' | 'shared' | 'starred'

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  removeProject: (projectId: string) => void
  setCurrentProject: (project: Project | null) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  setFilter: (filter: 'all' | 'owned' | 'shared' | 'starred') => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set) => ({
        projects: [],
        currentProject: null,
        loading: false,
        error: null,
        filter: 'all',

        setProjects: (projects) => set({ projects }),
        addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
        removeProject: (projectId) =>
          set((state) => ({
            projects: state.projects.filter((p) => p._id !== projectId),
          })),
        setCurrentProject: (project) => set({ currentProject: project }),
        updateProject: (projectId, updates) =>
          set((state) => ({
            projects: state.projects.map((p) =>
              p._id === projectId ? { ...p, ...updates } : p
            ),
          })),
        setFilter: (filter) => set({ filter }),
        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),
      }),
      {
        name: 'project-store',
      }
    )
  )
)

// File state
export interface File {
  _id: string
  projectId: string
  name: string
  language: string
  content: string
  size: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  version: number
  isDirty: boolean
}

export interface FileState {
  files: File[]
  currentFile: File | null
  openTabs: File[]
  loading: boolean
  error: string | null
  unsavedChanges: Map<string, string>

  setFiles: (files: File[]) => void
  addFile: (file: File) => void
  removeFile: (fileId: string) => void
  setCurrentFile: (file: File | null) => void
  openFile: (file: File) => void
  closeFile: (fileId: string) => void
  markDirty: (fileId: string, content: string) => void
  clearDirty: (fileId: string) => void
  updateFile: (fileId: string, content: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useFileStore = create<FileState>()(
  devtools((set, get) => ({
    files: [],
    currentFile: null,
    openTabs: [],
    loading: false,
    error: null,
    unsavedChanges: new Map(),

    setFiles: (files) => set({ files }),
    addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
    removeFile: (fileId) =>
      set((state) => ({
        files: state.files.filter((f) => f._id !== fileId),
        openTabs: state.openTabs.filter((f) => f._id !== fileId),
      })),
    setCurrentFile: (file) => set({ currentFile: file }),
    openFile: (file) =>
      set((state) => ({
        openTabs: state.openTabs.find((f) => f._id === file._id)
          ? state.openTabs
          : [...state.openTabs, file],
        currentFile: file,
      })),
    closeFile: (fileId) =>
      set((state) => {
        const remaining = state.openTabs.filter((f) => f._id !== fileId)
        return {
          openTabs: remaining,
          currentFile:
            state.currentFile?._id === fileId ? remaining[remaining.length - 1] || null : state.currentFile,
        }
      }),
    markDirty: (fileId, content) =>
      set((state) => {
        const changes = new Map(state.unsavedChanges)
        changes.set(fileId, content)
        return { unsavedChanges: changes }
      }),
    clearDirty: (fileId) =>
      set((state) => {
        const changes = new Map(state.unsavedChanges)
        changes.delete(fileId)
        return { unsavedChanges: changes }
      }),
    updateFile: (fileId, content) =>
      set((state) => ({
        files: state.files.map((f) =>
          f._id === fileId ? { ...f, content, updatedAt: new Date() } : f
        ),
        openTabs: state.openTabs.map((f) =>
          f._id === fileId ? { ...f, content, updatedAt: new Date() } : f
        ),
      })),
    setError: (error) => set({ error }),
    setLoading: (loading) => set({ loading }),
  }))
)

// Collaboration state
export interface CollaborativePresence {
  userId: string
  userName: string
  email: string
  status: 'online' | 'idle' | 'offline'
  currentFile?: string
  cursorPosition?: { line: number; column: number }
}

export interface CollaborationState {
  presences: CollaborativePresence[]
  activities: any[]
  connections: Map<string, any>

  setPresences: (presences: CollaborativePresence[]) => void
  addPresence: (presence: CollaborativePresence) => void
  removePresence: (userId: string) => void
  updatePresence: (userId: string, updates: Partial<CollaborativePresence>) => void
  addActivity: (activity: any) => void
  clearActivities: () => void
}

export const useCollaborationStore = create<CollaborationState>()(
  devtools((set) => ({
    presences: [],
    activities: [],
    connections: new Map(),

    setPresences: (presences) => set({ presences }),
    addPresence: (presence) =>
      set((state) => ({
        presences: [...state.presences.filter((p) => p.userId !== presence.userId), presence],
      })),
    removePresence: (userId) =>
      set((state) => ({
        presences: state.presences.filter((p) => p.userId !== userId),
      })),
    updatePresence: (userId, updates) =>
      set((state) => ({
        presences: state.presences.map((p) =>
          p.userId === userId ? { ...p, ...updates } : p
        ),
      })),
    addActivity: (activity) =>
      set((state) => ({
        activities: [activity, ...state.activities].slice(0, 100),
      })),
    clearActivities: () => set({ activities: [] }),
  }))
)

// UI state
export interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'auto'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: Date
  }>

  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  addNotification: (type: string, message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'auto',
        notifications: [],

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        addNotification: (type, message) =>
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                id: `${Date.now()}`,
                type,
                message,
                timestamp: new Date(),
              },
            ],
          })),
        removeNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'ui-store',
      }
    )
  )
)
