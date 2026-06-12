'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Session {
  id: string
  device: string
  browser: string
  ip: string
  lastActivity: Date
  isCurrent: boolean
}

interface TwoFAMethod {
  id: string
  type: 'totp' | 'sms' | 'email'
  status: 'enabled' | 'disabled'
  lastUsed?: Date
  verified: boolean
}

export default function SecurityPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome',
      ip: '192.168.1.100',
      lastActivity: new Date(),
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 14',
      browser: 'Safari',
      ip: '203.0.113.45',
      lastActivity: new Date(Date.now() - 3600000),
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Windows Desktop',
      browser: 'Firefox',
      ip: '198.51.100.78',
      lastActivity: new Date(Date.now() - 86400000),
      isCurrent: false,
    },
  ])

  const [twoFAMethods, setTwoFAMethods] = useState<TwoFAMethod[]>([
    {
      id: '1',
      type: 'totp',
      status: 'enabled',
      verified: true,
      lastUsed: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      type: 'email',
      status: 'enabled',
      verified: true,
      lastUsed: new Date(Date.now() - 86400000),
    },
    {
      id: '3',
      type: 'sms',
      status: 'disabled',
      verified: false,
    },
  ])

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id))
  }

  const getTwoFAIcon = (type: string) => {
    const icons = {
      totp: Key,
      sms: Smartphone,
      email: Lock,
    }
    return icons[type as keyof typeof icons] || Lock
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Shield className="w-8 h-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-white">Security & Access</h1>
            </div>
            <p className="text-slate-400">Manage passwords, sessions, and authentication</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="password" className="space-y-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="sso">SSO & SAML</TabsTrigger>
          </TabsList>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Password Settings</h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded border border-slate-700">
                  <p className="text-sm text-slate-300 mb-3">
                    <strong>Password Strength:</strong> Strong
                  </p>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-700">
                  <Button onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                  <Button variant="outline">
                    View password history
                  </Button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Password Requirements</h3>
              <div className="space-y-2">
                {[
                  'At least 12 characters',
                  'Mix of uppercase and lowercase letters',
                  'At least one number',
                  'At least one special character (!@#$%)',
                  'No personal information',
                ].map((req) => (
                  <div key={req} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 2FA Tab */}
          <TabsContent value="2fa" className="space-y-6">
            <div className="space-y-4">
              {twoFAMethods.map((method) => {
                const Icon = getTwoFAIcon(method.type)
                return (
                  <div
                    key={method.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Icon className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white capitalize mb-1">
                            {method.type === 'totp'
                              ? 'Authenticator App'
                              : method.type === 'sms'
                                ? 'SMS Text Message'
                                : 'Email'}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">
                            {method.type === 'totp'
                              ? 'Google Authenticator, Authy, or Microsoft Authenticator'
                              : method.type === 'sms'
                                ? 'Text message to your phone'
                                : 'Verification code sent to your email'}
                          </p>
                          {method.lastUsed && (
                            <p className="text-xs text-slate-500">
                              Last used {method.lastUsed.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            method.status === 'enabled'
                              ? 'bg-green-900 text-green-200'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {method.status.charAt(0).toUpperCase() + method.status.slice(1)}
                        </div>

                        {method.status === 'enabled' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-900/20"
                          >
                            Disable
                          </Button>
                        ) : (
                          <Button size="sm">Enable</Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-900/20 border border-emerald-700/50 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  We recommend enabling at least two authentication methods for better security.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{session.device}</h3>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs font-semibold">
                            Current Session
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-2">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Browser</p>
                          <p>{session.browser}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">IP Address</p>
                          <p className="font-mono">{session.ip}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Last activity: {session.lastActivity.toLocaleDateString()}
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-red-600 hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-900/20"
            >
              Sign Out All Other Sessions
            </Button>
          </TabsContent>

          {/* SSO Tab */}
          <TabsContent value="sso" className="space-y-6">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-300">
                  SSO and SAML are available on Enterprise plan. Contact sales to upgrade.
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Enterprise Features</h3>
              <div className="space-y-3">
                {[
                  'Single Sign-On (SSO) with Okta, Azure AD',
                  'SAML 2.0 support',
                  'Custom domain for your organization',
                  'Advanced audit logs',
                  'IP whitelisting',
                  'Custom metadata',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-slate-300">
                    <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button className="mt-6">
                Contact Sales for Enterprise
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 pr-10"
                  />
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">New Password</label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleChangePassword} className="flex-1">
                  Update Password
                </Button>
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
