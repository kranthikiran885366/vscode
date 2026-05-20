/**
 * Centralized API client for frontend
 * Handles authentication, error handling, and request/response formatting
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  code?: string
  details?: any
  pagination?: {
    limit: number
    offset: number
    total: number
  }
}

export interface ApiError {
  success: false
  message: string
  code: string
  details?: any
}

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * Make API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: { retries?: number } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const { retries = 3 } = options
    let lastError: any

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const fetchOptions: RequestInit = {
          method,
          headers: this.getHeaders(),
        }

        if (data) {
          fetchOptions.body = JSON.stringify(data)
        }

        const response = await fetch(url, fetchOptions)

        // Handle 401 - Token expired
        if (response.status === 401) {
          this.clearToken()
          throw new Error('Authentication expired')
        }

        const responseData = await response.json()

        if (!response.ok) {
          throw {
            status: response.status,
            ...responseData,
          }
        }

        return responseData as T
      } catch (error: any) {
        lastError = error

        // Don't retry on client errors (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error
        }

        // Retry on server errors (5xx) or network errors
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
          continue
        }
      }
    }

    throw lastError
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data, options)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: any): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient()

/**
 * API service methods
 */
export const api = {
  // Auth endpoints
  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      apiClient.post('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),

    me: () => apiClient.get('/auth/me'),

    logout: () => apiClient.post('/auth/logout'),

    updateProfile: (data: any) => apiClient.put('/auth/profile', data),

    changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) =>
      apiClient.post('/auth/change-password', data),

    forgotPassword: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }),

    resetPassword: (data: { resetToken: string; newPassword: string; confirmPassword: string }) =>
      apiClient.post('/auth/reset-password', data),
  },

  // Project endpoints
  projects: {
    list: (limit?: number, offset?: number) => {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (offset) params.append('offset', offset.toString())
      return apiClient.get(`/projects${params.size > 0 ? '?' + params : ''}`)
    },

    get: (id: string) => apiClient.get(`/projects/${id}`),

    create: (data: { name: string; description?: string; language?: string }) =>
      apiClient.post('/projects', data),

    update: (id: string, data: any) => apiClient.put(`/projects/${id}`, data),

    delete: (id: string) => apiClient.delete(`/projects/${id}`),

    addCollaborator: (id: string, data: { email: string; role?: string }) =>
      apiClient.post(`/projects/${id}/collaborators`, data),

    updateCollaborator: (id: string, collaboratorId: string, data: { role: string }) =>
      apiClient.put(`/projects/${id}/collaborators/${collaboratorId}`, data),

    removeCollaborator: (id: string, collaboratorId: string) =>
      apiClient.delete(`/projects/${id}/collaborators/${collaboratorId}`),
  },

  // File endpoints
  files: {
    listByProject: (projectId: string) =>
      apiClient.get(`/files/project/${projectId}`),

    get: (id: string) => apiClient.get(`/files/${id}`),

    create: (data: { projectId: string; name: string; language?: string; content?: string }) =>
      apiClient.post('/files', data),

    update: (id: string, data: { content: string; message?: string }) =>
      apiClient.put(`/files/${id}`, data),

    delete: (id: string) => apiClient.delete(`/files/${id}`),

    rename: (id: string, newName: string) =>
      apiClient.patch(`/files/${id}/rename`, { newName }),

    getVersions: (id: string) => apiClient.get(`/files/${id}/versions`),

    restoreVersion: (id: string, versionNumber: number) =>
      apiClient.post(`/files/${id}/restore/${versionNumber}`, {}),
  },

  // AI endpoints
  ai: {
    chat: (data: any) => apiClient.post('/ai/chat', data),
    completion: (data: any) => apiClient.post('/ai/completion', data),
    generate: (data: any) => apiClient.post('/ai/generate', data),
    refactor: (data: any) => apiClient.post('/ai/refactor', data),
  },

  // Execution endpoints
  execute: {
    run: (data: any) => apiClient.post('/execute', data),
  },

  // Git endpoints
  git: {
    status: (projectId: string) => apiClient.get(`/git/status/${projectId}`),
    commit: (projectId: string, data: any) => apiClient.post(`/git/commit/${projectId}`, data),
    push: (projectId: string) => apiClient.post(`/git/push/${projectId}`, {}),
    pull: (projectId: string) => apiClient.post(`/git/pull/${projectId}`, {}),
    branch: (projectId: string, data: any) => apiClient.post(`/git/branch/${projectId}`, data),
    diff: (projectId: string) => apiClient.get(`/git/diff/${projectId}`),
  },

  // Formatter endpoints
  formatter: {
    format: (data: any) => apiClient.post('/formatter', data),
  },

  // Snippets endpoints
  snippets: {
    list: () => apiClient.get('/snippets'),
    get: (id: string) => apiClient.get(`/snippets/${id}`),
    create: (data: any) => apiClient.post('/snippets', data),
    update: (id: string, data: any) => apiClient.put(`/snippets/${id}`, data),
    delete: (id: string) => apiClient.delete(`/snippets/${id}`),
  },

  // Health check
  health: () => apiClient.get('/health'),
}

export default api
