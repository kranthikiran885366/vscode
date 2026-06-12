'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  User,
  Shield,
  Check,
  X,
  Copy,
  Send,
  MoreHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'invited' | 'pending'
  joinedAt: Date
  avatar?: string
}

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  sentAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined'
}

export default function TeamPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@acme.com',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@acme.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@acme.com',
      role: 'editor',
      status: 'active',
      joinedAt: new Date('2024-02-15'),
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@acme.com',
      role: 'viewer',
      status: 'invited',
      joinedAt: new Date(),
    },
  ])

  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: '1',
      email: 'dev@acme.com',
      role: 'editor',
      sentAt: new Date('2024-03-05'),
      expiresAt: new Date('2024-04-05'),
      status: 'pending',
    },
    {
      id: '2',
      email: 'intern@acme.com',
      role: 'viewer',
      sentAt: new Date('2024-03-01'),
      expiresAt: new Date('2024-04-01'),
      status: 'accepted',
    },
  ])

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
    }

    setInvitations([...invitations, newInvitation])
    setInviteEmail('')
    setInviteRole('editor')
    setShowInviteModal(false)
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const handleChangeRole = (id: string, newRole: string) => {
    setMembers(
      members.map((m) =>
        m.id === id ? { ...m, role: newRole as TeamMember['role'] } : m
      )
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-900 text-purple-200'
      case 'admin':
        return 'bg-red-900 text-red-200'
      case 'editor':
        return 'bg-blue-900 text-blue-200'
      case 'viewer':
        return 'bg-gray-700 text-gray-200'
      default:
        return 'bg-gray-700 text-gray-200'
    }
  }

  const getRolePermissions = (role: string) => {
    const permissions = {
      owner: ['Full access', 'Manage team', 'Manage billing', 'Delete org'],
      admin: ['Create projects', 'Manage team', 'Manage settings'],
      editor: ['Create/edit projects', 'Invite viewers', 'Edit files'],
      viewer: ['View projects', 'Leave comments'],
    }
    return permissions[role as keyof typeof permissions] || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Users className="w-8 h-8 text-emerald-400" />
                <h1 className="text-4xl font-bold text-white">Team Management</h1>
              </div>
              <p className="text-slate-400">Manage team members and permissions</p>
            </div>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Team Members Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Team Members ({members.length})</h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      member.status === 'active'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}
                  >
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>

                  <Select
                    value={member.role}
                    onValueChange={(newRole) => handleChangeRole(member.id, newRole)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {member.role !== 'owner' && (
                        <>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Send message
                      </DropdownMenuItem>
                      {member.role !== 'owner' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.filter((i) => i.status === 'pending').length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Pending Invitations ({invitations.filter((i) => i.status === 'pending').length})
            </h2>

            <div className="space-y-3">
              {invitations
                .filter((i) => i.status === 'pending')
                .map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{invite.email}</p>
                      <p className="text-sm text-slate-400">
                        Sent {invite.sentAt.toLocaleDateString()} • Expires{' '}
                        {invite.expiresAt.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(invite.role)}`}>
                        {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Resend
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Role Permissions Reference */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['owner', 'admin', 'editor', 'viewer'].map((role) => (
            <div key={role} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className={`font-semibold ${getRoleBadgeColor(role)} inline-block mb-3 px-2 py-1 rounded text-xs`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              <div className="space-y-2">
                {getRolePermissions(role).map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Invite Team Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Role</label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleInviteMember} className="flex-1">
                  Send Invite
                </Button>
                <Button
                  onClick={() => setShowInviteModal(false)}
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
