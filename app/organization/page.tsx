'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Users,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  description: string
  members: number
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'pending'
  createdAt: Date
  owner: {
    id: string
    name: string
    email: string
  }
}

export default function OrganizationPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      slug: 'acme-corp',
      description: 'Enterprise software development',
      members: 45,
      plan: 'enterprise',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      owner: {
        id: 'u1',
        name: 'John Doe',
        email: 'john@acme.com',
      },
    },
    {
      id: '2',
      name: 'Startup Labs',
      slug: 'startup-labs',
      description: 'Web3 development studio',
      members: 12,
      plan: 'pro',
      status: 'active',
      createdAt: new Date('2024-02-10'),
      owner: {
        id: 'u2',
        name: 'Jane Smith',
        email: 'jane@startup.com',
      },
    },
    {
      id: '3',
      name: 'Personal Projects',
      slug: 'personal',
      description: 'My personal workspace',
      members: 1,
      plan: 'free',
      status: 'active',
      createdAt: new Date('2024-03-01'),
      owner: {
        id: 'u3',
        name: 'You',
        email: 'you@example.com',
      },
    },
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewOrgModal, setShowNewOrgModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')

  const filteredOrgs = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return

    const newOrg: Organization = {
      id: Date.now().toString(),
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/\s+/g, '-'),
      description: 'New organization',
      members: 1,
      plan: 'free',
      status: 'active',
      createdAt: new Date(),
      owner: {
        id: 'current-user',
        name: 'You',
        email: 'you@example.com',
      },
    }

    setOrganizations([...organizations, newOrg])
    setNewOrgName('')
    setShowNewOrgModal(false)
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-teal-900 text-teal-200'
      case 'pro':
        return 'bg-blue-900 text-blue-200'
      case 'free':
        return 'bg-gray-700 text-gray-200'
      default:
        return 'bg-gray-700 text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Organizations</h1>
              <p className="text-slate-400">Manage your workspaces and teams</p>
            </div>
            <Button
              onClick={() => setShowNewOrgModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        {/* Organizations Grid */}
        {filteredOrgs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No organizations found</p>
            <Button onClick={() => setShowNewOrgModal(true)}>
              Create Your First Organization
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-all cursor-pointer group"
                onClick={() => router.push(`/organization/${org.id}/dashboard`)}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400">
                        {org.name}
                      </h3>
                      {getStatusIcon(org.status)}
                    </div>
                    <p className="text-sm text-slate-500">@{org.slug}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{org.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-700">
                  <div>
                    <p className="text-2xl font-bold text-white">{org.members}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Members
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{org.plan}</p>
                    <p className="text-xs text-slate-500">Plan</p>
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      {Math.floor((new Date().getTime() - org.createdAt.getTime()) / (1000 * 60 * 60 * 24))}d
                    </p>
                    <p className="text-xs text-slate-500">Old</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${getPlanBadgeColor(org.plan)}`}>
                    {org.plan.toUpperCase()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/organization/${org.id}/settings`)
                    }}
                    className="text-xs"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Organization Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Organization</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Organization Name</label>
                <Input
                  placeholder="e.g., Acme Corporation"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleCreateOrg} className="flex-1">
                  Create
                </Button>
                <Button
                  onClick={() => setShowNewOrgModal(false)}
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
