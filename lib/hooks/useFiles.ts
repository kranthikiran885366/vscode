'use client'

import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api-client'

export interface FileItem {
  _id: string
  name: string
  language: string
  content: string
  projectId: string
  createdAt: string
  lastModified: string
  createdBy: { id: string; name: string; email: string }
  size?: number
  versions?: number
}

export interface FilesState {
  files: FileItem[]
  currentFile: FileItem | null
  isLoading: boolean
  error: string | null
}

export function useFiles(projectId?: string) {
  const [state, setState] = useState<FilesState>({
    files: [],
    currentFile: null,
    isLoading: !!projectId,
    error: null,
  })

  // Load files on mount or when projectId changes
  useEffect(() => {
    if (!projectId) return

    const loadFiles = async () => {
      try {
        const response = await api.files.listByProject(projectId)
        if (response.data) {
          setState((prev) => ({
            ...prev,
            files: response.data.files || [],
            isLoading: false,
            error: null,
          }))
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load files',
        }))
      }
    }

    loadFiles()
  }, [projectId])

  const createFile = useCallback(
    async (name: string, language: string = 'javascript', content: string = '') => {
      if (!projectId) return { success: false, error: 'No project selected' }

      try {
        const response = await api.files.create({ projectId, name, language, content })
        if (response.data) {
          setState((prev) => ({
            ...prev,
            files: [...prev.files, response.data],
            currentFile: response.data,
          }))
          return { success: true, file: response.data }
        }
        throw new Error(response.message || 'Failed to create file')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create file'
        return { success: false, error: errorMsg }
      }
    },
    [projectId]
  )

  const updateFile = useCallback(
    async (fileId: string, content: string, message?: string) => {
      try {
        const response = await api.files.update(fileId, { content, message })
        if (response.data) {
          setState((prev) => ({
            ...prev,
            files: prev.files.map((f) =>
              f._id === fileId ? response.data : f
            ),
            currentFile: prev.currentFile?._id === fileId ? response.data : prev.currentFile,
          }))
          return { success: true, file: response.data }
        }
        throw new Error(response.message || 'Failed to update file')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update file'
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await api.files.delete(fileId)
      setState((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f._id !== fileId),
        currentFile: prev.currentFile?._id === fileId ? null : prev.currentFile,
      }))
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete file'
      return { success: false, error: errorMsg }
    }
  }, [])

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    try {
      const response = await api.files.rename(fileId, newName)
      if (response.data) {
        setState((prev) => ({
          ...prev,
          files: prev.files.map((f) =>
            f._id === fileId ? response.data : f
          ),
          currentFile: prev.currentFile?._id === fileId ? response.data : prev.currentFile,
        }))
        return { success: true, file: response.data }
      }
      throw new Error(response.message || 'Failed to rename file')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to rename file'
      return { success: false, error: errorMsg }
    }
  }, [])

  const setCurrentFile = useCallback((file: FileItem | null) => {
    setState((prev) => ({ ...prev, currentFile: file }))
  }, [])

  return {
    ...state,
    createFile,
    updateFile,
    deleteFile,
    renameFile,
    setCurrentFile,
  }
}
