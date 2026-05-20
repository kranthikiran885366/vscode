'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiClient, ApiResponse, ApiError } from '../api-client'

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
}

/**
 * Custom hook for API calls
 */
export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiState<T> & { execute: () => Promise<ApiResponse<T>> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { immediate = false, onSuccess, onError } = options

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null })

    try {
      const response = await apiCall()
      setState({ data: response.data || null, loading: false, error: null })
      onSuccess?.(response.data)
      return response
    } catch (err: any) {
      const error: ApiError = {
        success: false,
        message: err.message || 'An error occurred',
        code: err.code || 'UNKNOWN_ERROR',
        details: err.details,
      }
      setState({ data: null, loading: false, error })
      onError?.(error)
      throw error
    }
  }, [apiCall, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return { ...state, execute }
}

/**
 * Hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/auth/me')
        if (response.success) {
          setUser(response.data?.user)
        }
      } catch (err) {
        setError('Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/auth/login', { email, password })
      if (response.data?.tokens?.accessToken) {
        apiClient.setToken(response.data.tokens.accessToken)
        setUser(response.data.user)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const response = await apiClient.post('/auth/signup', { name, email, password })
      if (response.data?.tokens?.accessToken) {
        apiClient.setToken(response.data.tokens.accessToken)
        setUser(response.data.user)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {})
      apiClient.clearToken()
      setUser(null)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const updateProfile = useCallback(async (updates: any) => {
    try {
      const response = await apiClient.put('/auth/profile', updates)
      if (response.data?.user) {
        setUser(response.data.user)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  }
}

/**
 * Hook for projects
 */
export function useProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (limit?: number, offset?: number) => {
    try {
      setLoading(true)
      const response = await apiClient.get(
        `/projects${limit ? `?limit=${limit}&offset=${offset || 0}` : ''}`
      )
      if (response.data?.projects) {
        setProjects(response.data.projects)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = useCallback(
    async (name: string, description?: string, language?: string) => {
      try {
        const response = await apiClient.post('/projects', { name, description, language })
        if (response.data?.project) {
          setProjects((prev) => [response.data.project, ...prev])
        }
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await apiClient.delete(`/projects/${projectId}`)
      setProjects((prev) => prev.filter((p) => p._id !== projectId))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  }
}

/**
 * Hook for files
 */
export function useFiles(projectId?: string) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async (pId?: string) => {
    if (!pId && !projectId) return

    try {
      setLoading(true)
      const response = await apiClient.get(`/files/project/${pId || projectId}`)
      if (response.data?.files) {
        setFiles(response.data.files)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const createFile = useCallback(
    async (name: string, language?: string, content?: string) => {
      if (!projectId) throw new Error('Project ID is required')

      try {
        const response = await apiClient.post('/files', {
          projectId,
          name,
          language,
          content,
        })
        if (response.data?.file) {
          setFiles((prev) => [...prev, response.data.file])
        }
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [projectId]
  )

  const updateFile = useCallback(async (fileId: string, content: string, message?: string) => {
    try {
      const response = await apiClient.put(`/files/${fileId}`, { content, message })
      if (response.data?.file) {
        setFiles((prev) =>
          prev.map((f) => (f._id === fileId ? response.data.file : f))
        )
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await apiClient.delete(`/files/${fileId}`)
      setFiles((prev) => prev.filter((f) => f._id !== fileId))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    files,
    loading,
    error,
    fetchFiles,
    createFile,
    updateFile,
    deleteFile,
  }
}
