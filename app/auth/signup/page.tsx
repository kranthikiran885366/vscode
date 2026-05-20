'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Code2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Check,
  X,
} from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]+/)) strength++
    if (password.match(/[A-Z]+/)) strength++
    if (password.match(/[0-9]+/)) strength++
    if (password.match(/[$@#&!]+/)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordStrengthText =
    passwordStrength <= 1
      ? 'Weak'
      : passwordStrength <= 2
        ? 'Fair'
        : passwordStrength <= 3
          ? 'Good'
          : passwordStrength <= 4
            ? 'Strong'
            : 'Very Strong'

  const passwordStrengthColor =
    passwordStrength <= 1
      ? 'bg-red-500'
      : passwordStrength <= 2
        ? 'bg-orange-500'
        : passwordStrength <= 3
          ? 'bg-yellow-500'
          : passwordStrength <= 4
            ? 'bg-blue-500'
            : 'bg-green-500'

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear errors on change
    if (name === 'name') setNameError('')
    if (name === 'email') setEmailError('')
    if (name === 'password') setPasswordError('')
    if (name === 'confirmPassword') setConfirmPasswordError('')
    setError('')
  }

  // Step 1: Name & Email validation
  const validateStep1 = (): boolean => {
    let isValid = true
    setNameError('')
    setEmailError('')

    if (!formData.name.trim()) {
      setNameError('Full name is required')
      isValid = false
    } else if (formData.name.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      isValid = false
    }

    if (!formData.email.trim()) {
      setEmailError('Email is required')
      isValid = false
    } else if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address')
      isValid = false
    }

    return isValid
  }

  // Step 2: Password validation
  const validateStep2 = (): boolean => {
    let isValid = true
    setPasswordError('')
    setConfirmPasswordError('')

    if (!formData.password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      isValid = false
    }

    if (!formData.confirmPassword) {
      setConfirmPasswordError('Please confirm your password')
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      isValid = false
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      isValid = false
    }

    return isValid
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateStep2()) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.message || 'Failed to sign up. This email may already be registered.'
        )
        return
      }

      localStorage.setItem('token', data.token)
      setSuccess(true)

      // Small delay for success animation
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (err) {
      setError('An error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-10 group transition-all duration-300"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              ZenCode AI
            </span>
            <span className="text-xs text-gray-500">by MVK Solutions</span>
          </div>
        </Link>

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl hover:border-slate-600 transition-all duration-300">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep >= 1
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-slate-700 text-gray-400'
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-6 h-6" /> : '1'}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep >= 1 ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    Account
                  </span>
                </div>
              </div>

              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                  currentStep >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-slate-700'
                }`}
              />

              <div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep >= 2
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-slate-700 text-gray-400'
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-6 h-6" /> : '2'}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep >= 2 ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    Password
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            {currentStep === 1 ? (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
                <p className="text-gray-400">
                  Join thousands of developers using ZenCode AI
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Set Your Password</h1>
                <p className="text-gray-400">
                  Choose a strong password to secure your account
                </p>
              </>
            )}
          </div>

          <form onSubmit={currentStep === 2 ? handleSubmit : undefined} className="space-y-5">
            {/* Step 1: Name & Email */}
            {currentStep === 1 && (
              <>
                {/* Name Field */}
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-300">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" />
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className={`w-full pl-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ${
                        nameError ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <div className="flex items-start gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{nameError}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: '100ms' }}>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-300">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className={`w-full pl-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ${
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

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 mt-8 group"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </>
            )}

            {/* Step 2: Password */}
            {currentStep === 2 && (
              <>
                {/* Password Field */}
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ${
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

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                              i < passwordStrength
                                ? passwordStrengthColor
                                : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Password strength: <span className="font-semibold">{passwordStrengthText}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="space-y-2 mt-4 p-4 bg-slate-700/20 border border-slate-700 rounded-lg">
                    <p className="text-xs font-semibold text-gray-400 mb-3">Password requirements:</p>
                    <ul className="space-y-2 text-xs">
                      {[
                        {
                          met: formData.password.length >= 8,
                          text: 'At least 8 characters',
                        },
                        {
                          met: formData.password.match(/[a-z]+/),
                          text: 'Lowercase letter',
                        },
                        {
                          met: formData.password.match(/[A-Z]+/),
                          text: 'Uppercase letter',
                        },
                        {
                          met: formData.password.match(/[0-9]+/),
                          text: 'Number',
                        },
                        {
                          met: formData.password.match(/[$@#&!]+/),
                          text: 'Special character ($@#&!)',
                        },
                      ].map((req, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 transition-colors duration-300 ${
                            req.met ? 'text-green-400' : 'text-gray-500'
                          }`}
                        >
                          {req.met ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          {req.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {passwordError && (
                    <div className="flex items-start gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: '100ms' }}>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 bg-slate-700/50 border rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ${
                        confirmPasswordError ? 'border-red-500' : 'border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div
                      className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                        formData.password === formData.confirmPassword
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {formData.password === formData.confirmPassword ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {formData.password === formData.confirmPassword
                        ? 'Passwords match'
                        : 'Passwords do not match'}
                    </div>
                  )}

                  {confirmPasswordError && (
                    <div className="flex items-start gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{confirmPasswordError}</span>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: '200ms' }}>
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => {
                      setAgreeToTerms(e.target.checked)
                      if (e.target.checked) setError('')
                    }}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-2 focus:ring-purple-500/20 cursor-pointer mt-1 group-hover:border-purple-400 transition-colors duration-300"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    I agree to the{' '}
                    <a
                      href="#"
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

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
                    <span>Account created! Redirecting...</span>
                  </div>
                )}

                {/* Button Group */}
                <div className="flex gap-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || success}
                    className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      success
                        ? 'bg-green-600 hover:bg-green-600'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Created</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          {/* Sign In Link */}
          <p className="text-center text-gray-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(20px);
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
          opacity: 1;
        }

        .fade-in {
          opacity: 1;
        }

        .slide-in-from-right-4 {
          animation: slide-in-from-right 0.3s ease-out;
        }

        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.3s ease-out;
        }

        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom 0.3s ease-out;
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
