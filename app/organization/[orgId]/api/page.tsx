'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface APIToken {
  id: string
  name: string
  token: string
  prefix: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  expiresAt?: Date
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
}

interface APIUsage {
  date: Date
  requests: number
  errors: number
  avgResponseTime: number
}

export default function APIPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [tokens, setTokens] = useState<APIToken[]>([
    {
      id: '1',
      name: 'CI/CD Pipeline',
      token: 'sk_live_1234567890abcdefghijklmnop',
      prefix: 'sk_live_1234',
      permissions: ['projects:read', 'projects:write', 'files:read', 'files:write'],
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-03-10'),
      expiresAt: new Date('2025-01-15'),
      status: 'active',
      usageCount: 4250,
    },
    {
      id: '2',
      name: 'GitHub Actions',
      token: 'sk_live_abcdefghijklmnopqrstuvwxyz',
      prefix: 'sk_live_abcd',
      permissions: ['projects:read', 'execution:read'],
      createdAt: new Date('2024-02-01'),
      lastUsed: new Date('2024-03-09'),
      expiresAt: new Date('2025-02-01'),
      status: 'active',
      usageCount: 1230,
    },
  ])

  const [apiUsage] = useState<APIUsage[]>([
    { date: new Date('2024-03-10'), requests: 450, errors: 2, avgResponseTime: 245 },
    { date: new Date('2024-03-09'), requests: 380, errors: 1, avgResponseTime: 223 },
    { date: new Date('2024-03-08'), requests: 520, errors: 3, avgResponseTime: 267 },
    { date: new Date('2024-03-07'), requests: 410, errors: 0, avgResponseTime: 198 },
  ])

  const [showNewTokenModal, setShowNewTokenModal] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [visibleToken, setVisibleToken] = useState<string | null>(null)

  const availablePermissions = [
    'projects:read',
    'projects:write',
    'projects:delete',
    'files:read',
    'files:write',
    'files:delete',
    'execution:read',
    'execution:write',
    'team:read',
    'team:write',
    'billing:read',
  ]

  const handleCreateToken = () => {
    if (!tokenName.trim() || selectedPermissions.length === 0) return

    const newToken: APIToken = {
      id: Date.now().toString(),
      name: tokenName,
      token: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      prefix: `sk_live_${Math.random().toString(36).substring(2, 6)}`,
      permissions: selectedPermissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      usageCount: 0,
    }

    setTokens([...tokens, newToken])
    setTokenName('')
    setSelectedPermissions([])
    setShowNewTokenModal(false)
  }

  const handleRevokeToken = (id: string) => {
    setTokens(
      tokens.map((t) => (t.id === id ? { ...t, status: 'revoked' as const } : t))
    )
  }

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Key className="w-8 h-8 text-blue-400" />
                <h1 className="text-4xl font-bold text-white">API Management</h1>
              </div>
              <p className="text-slate-400">Manage API tokens and monitor usage</p>
            </div>
            <Button
              onClick={() => setShowNewTokenModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Token
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="tokens" className="space-y-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="tokens">API Tokens</TabsTrigger>
            <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-6">
            {tokens.length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <Key className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-4">No API tokens created</p>
                <Button onClick={() => setShowNewTokenModal(true)}>Create Token</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{token.name}</h3>
                        <p className="text-sm text-slate-400 font-mono mt-1">{token.prefix}...</p>
                      </div>

                      <div
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          token.status === 'active'
                            ? 'bg-green-900 text-green-200'
                            : token.status === 'revoked'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                      </div>
                    </div>

                    {/* Token Display */}
                    <div className="bg-slate-900 rounded p-3 mb-4 flex items-center justify-between">
                      <code className="text-xs text-slate-300 font-mono break-all">
                        {visibleToken === token.id ? token.token : '••••••••••••••••••••••'}
                      </code>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setVisibleToken(visibleToken === token.id ? null : token.id)
                          }
                        >
                          {visibleToken === token.id ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(token.token)
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions & Stats */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {token.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-300 uppercase mb-2">Usage</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span>{token.usageCount.toLocaleString()} requests</span>
                          {token.lastUsed && (
                            <>
                              <span>•</span>
                              <span>Last used {token.lastUsed.toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-t border-slate-700">
                      <div className="pt-4">
                        <p className="text-xs text-slate-500">Created</p>
                        <p className="text-sm text-white">{token.createdAt.toLocaleDateString()}</p>
                      </div>
                      {token.expiresAt && (
                        <div className="pt-4">
                          <p className="text-xs text-slate-500">Expires</p>
                          <p className="text-sm text-white">{token.expiresAt.toLocaleDateString()}</p>
                        </div>
                      )}
                      <div className="pt-4">
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="text-sm text-white capitalize">{token.status}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                      <Button variant="outline" size="sm" className="flex-1">
                        Rotate
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View usage</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {token.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleRevokeToken(token.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Revoke Token
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">API Usage</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Total Requests (30 days)</p>
                <p className="text-3xl font-bold text-white">12,870</p>
                <p className="text-xs text-green-400 mt-2">↑ 15% from last month</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Error Rate</p>
                <p className="text-3xl font-bold text-white">0.4%</p>
                <p className="text-xs text-green-400 mt-2">↓ 0.2% from last month</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-sm mb-2">Avg Response Time</p>
                <p className="text-3xl font-bold text-white">233ms</p>
                <p className="text-xs text-green-400 mt-2">↓ 12ms improvement</p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {apiUsage.map((usage) => (
                  <div key={usage.date.toISOString()} className="flex items-center justify-between pb-3 border-b border-slate-700">
                    <div>
                      <p className="font-semibold text-white">{usage.date.toLocaleDateString()}</p>
                      <p className="text-sm text-slate-400">{usage.requests} requests • {usage.errors} errors</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{usage.avgResponseTime}ms</p>
                      <p className="text-xs text-slate-400">avg response</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <Code className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">API Documentation</h3>
                  <p className="text-slate-400">
                    Complete API reference and integration guides are available at our documentation portal.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-center">
                  View Full Documentation
                </Button>
                <Button variant="outline" className="justify-center">
                  API Reference
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Token Modal */}
      {showNewTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create API Token</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Token Name</label>
                <Input
                  placeholder="e.g., CI/CD Pipeline"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Permissions</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {availablePermissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-700 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-slate-300">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <Button onClick={handleCreateToken} className="flex-1">
                  Create Token
                </Button>
                <Button
                  onClick={() => setShowNewTokenModal(false)}
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
