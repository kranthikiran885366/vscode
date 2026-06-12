'use client'

import { useState, useCallback, useEffect } from 'react'
import api from '@/lib/api-client'

export interface Project {
  _id: string
  name: string
  description: string
  language: string
  owner: { id: string; name: string; email: string }
  collaborators: Array<{ id: string; email: string; role: string }>
  createdAt: string
  lastModified: string
  filesCount?: number
  isShared?: boolean
}

export interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
}

export function useProjects() {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    isLoading: true,
    error: null,
  })

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.projects.list()
        if (response.data) {
          setState({
            projects: response.data.projects || [],
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          projects: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load projects',
        })
      }
    }

    loadProjects()
  }, [])

  const createProject = useCallback(
    async (name: string, description: string, language: string = 'javascript') => {
      try {
        const response = await api.projects.create({ name, description, language })
        if (response.data) {
          setState((prev) => ({
            ...prev,
            projects: [response.data, ...prev.projects],
          }))
          return { success: true, project: response.data }
        }
        throw new Error(response.message || 'Failed to create project')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create project'
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  const updateProject = useCallback(
    async (projectId: string, data: Partial<Project>) => {
      try {
        const response = await api.projects.update(projectId, data)
        if (response.data) {
          setState((prev) => ({
            ...prev,
            projects: prev.projects.map((p) =>
              p._id === projectId ? response.data : p
            ),
          }))
          return { success: true, project: response.data }
        }
        throw new Error(response.message || 'Failed to update project')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update project'
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await api.projects.delete(projectId)
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p._id !== projectId),
      }))
      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete project'
      return { success: false, error: errorMsg }
    }
  }, [])

  const addCollaborator = useCallback(
    async (projectId: string, email: string, role: string = 'viewer') => {
      try {
        const response = await api.projects.addCollaborator(projectId, { email, role })
        if (response.data) {
          setState((prev) => ({
            ...prev,
            projects: prev.projects.map((p) =>
              p._id === projectId ? response.data : p
            ),
          }))
          return { success: true }
        }
        throw new Error(response.message || 'Failed to add collaborator')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to add collaborator'
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  return {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    addCollaborator,
  }
}
