'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Code2,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Chrome,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Form validation
  const validateForm = (): boolean => {
    let isValid = true
    setEmailError('')
    setPasswordError('')

    if (!formData.email.trim()) {
      setEmailError('Email is required')
      isValid = false
    } else if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address')
      isValid = false
    }

    if (!formData.password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    }

    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear errors on change
    if (name === 'email') {
      setEmailError('')
    } else if (name === 'password') {
      setPasswordError('')
    }
    setLocalError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    const result = await auth.login(formData.email, formData.password)

    if (!result.success) {
      setLocalError(result.error || 'Failed to log in')
      return
    }

    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true')
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-12 group transition-all duration-300"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ZenCode AI
            </span>
            <span className="text-xs text-gray-500">by MVK Solutions</span>
          </div>
        </Link>

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:border-slate-600 transition-all duration-300">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your ZenCode account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className={`w-full pl-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${
                    emailError ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
              </div>
              {emailError && (
                <div className="flex items-start gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`w-full pl-10 pr-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${
                    passwordError ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="flex items-start gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer group-hover:border-blue-400 transition-colors duration-300"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg text-green-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
                success
                  ? 'bg-green-600 hover:bg-green-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Logged In</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-slate-800/50 text-gray-400 text-sm font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 group"
            >
              <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="hidden sm:inline">Google</span>
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-8">
          <Shield className="w-4 h-4" />
          <span>Protected by industry-leading security standards</span>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }

        .fade-in {
          opacity: 1;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
