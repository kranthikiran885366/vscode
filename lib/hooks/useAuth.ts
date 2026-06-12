'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api, { apiClient } from '@/lib/api-client'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role?: string
  createdAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.auth.me()
        if (response.data) {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load user',
        })
      }
    }

    loadUser()
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const response = await api.auth.signup({ name, email, password })
        if (response.data) {
          const { user, tokens } = response.data
          apiClient.setToken(tokens.accessToken)
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          router.push('/dashboard')
          return { success: true }
        }
        throw new Error(response.message || 'Signup failed')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Signup failed'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
        return { success: false, error: errorMsg }
      }
    },
    [router]
  )

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const response = await api.auth.login({ email, password })
        if (response.data) {
          const { user, tokens } = response.data
          apiClient.setToken(tokens.accessToken)
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          router.push('/dashboard')
          return { success: true }
        }
        throw new Error(response.message || 'Login failed')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Login failed'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
        return { success: false, error: errorMsg }
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    apiClient.clearToken()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    router.push('/auth/login')
  }, [router])

  const updateProfile = useCallback(
    async (name: string, bio: string, avatar?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const response = await api.auth.updateProfile({ name, bio, avatar })
        if (response.data) {
          setState((prev) => ({
            ...prev,
            user: response.data.user,
            isLoading: false,
            error: null,
          }))
          return { success: true }
        }
        throw new Error(response.message || 'Failed to update profile')
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update profile'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string, confirmPassword: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const response = await api.auth.changePassword({
          oldPassword,
          newPassword,
          confirmPassword,
        })
        setState((prev) => ({ ...prev, isLoading: false, error: null }))
        return { success: true }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to change password'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  return {
    ...state,
    signup,
    login,
    logout,
    updateProfile,
    changePassword,
  }
}
