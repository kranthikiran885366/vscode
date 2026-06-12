'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Share2,
  Settings,
  Code2,
  Clock,
  Users,
  LogOut,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  FolderOpen,
  Star,
  Copy,
  Edit3,
  ExternalLink,
  Zap,
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description: string
  owner: { name: string; email: string }
  collaborators: any[]
  language: string
  createdAt: string
  lastModified: string
}

// Language badges
const languageBadges: Record<string, { bg: string; text: string; icon: string }> = {
  javascript: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '⚡' },
  typescript: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '📘' },
  python: { bg: 'bg-emerald-600/20', text: 'text-blue-300', icon: '🐍' },
  react: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: '⚛️' },
  nodejs: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '🟢' },
  html: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: '🌐' },
  css: { bg: 'bg-blue-400/20', text: 'text-blue-300', icon: '🎨' },
  default: { bg: 'bg-slate-700/20', text: 'text-gray-400', icon: '📝' },
}

// Loading Skeleton Component
const SkeletonCard = () => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse space-y-4">
    <div className="h-6 bg-slate-700 rounded-lg w-3/4" />
    <div className="h-4 bg-slate-700 rounded-lg w-full" />
    <div className="h-4 bg-slate-700 rounded-lg w-2/3" />
    <div className="space-y-3 pt-4">
      <div className="h-4 bg-slate-700 rounded-lg w-1/2" />
      <div className="h-4 bg-slate-700 rounded-lg w-1/2" />
    </div>
    <div className="flex gap-2 pt-4">
      <div className="flex-1 h-10 bg-slate-700 rounded-lg" />
      <div className="w-10 h-10 bg-slate-700 rounded-lg" />
    </div>
  </div>
)

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'collaborators'>('recent')
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectLanguage, setNewProjectLanguage] = useState('javascript')
  const [creating, setCreating] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to load projects')
      }

      const { projects } = await response.json()
      setProjects(projects)
    } catch (error) {
      console.error('Load projects error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    setCreating(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          language: newProjectLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const { project } = await response.json()
      setProjects([project, ...projects])
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectLanguage('javascript')
      setShowNewProjectModal(false)
    } catch (error) {
      console.error('Create project error:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      setProjects(projects.filter((p) => p._id !== projectId))
      setActiveMenu(null)
    } catch (error) {
      console.error('Delete project error:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  // Filter projects
  let filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLanguage = filterLanguage
      ? p.language.toLowerCase().includes(filterLanguage.toLowerCase())
      : true

    return matchesSearch && matchesLanguage
  })

  // Sort projects
  filteredProjects.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'collaborators') {
      return b.collaborators.length - a.collaborators.length
    } else {
      // recent (default)
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })

  const languageBadge = (language: string) => {
    const lang = language.toLowerCase()
    return languageBadges[lang] || languageBadges.default
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
        {/* Header Skeleton */}
        <div className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-10 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="h-10 bg-slate-700 rounded-lg w-32 animate-pulse" />
              <div className="h-10 bg-slate-700 rounded-lg w-32 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 space-y-4">
            <div className="h-12 bg-slate-700 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  ZenCode AI
                </span>
                <span className="text-xs text-gray-500">Dashboard</span>
              </div>
            </Link>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter Bar */}
        <div className="space-y-6 mb-12">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors duration-300" />
            <Input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            />
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-all duration-300 group-hover:bg-slate-700/50"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 min-w-max shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Language</p>
                      <div className="space-y-2">
                        {['All', 'JavaScript', 'TypeScript', 'Python', 'React'].map((lang) => (
                          <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name="language"
                              checked={filterLanguage === (lang === 'All' ? null : lang) || (lang === 'All' && !filterLanguage)}
                              onChange={() =>
                                setFilterLanguage(lang === 'All' ? null : lang)
                              }
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                              {lang}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-all duration-300 group-hover:bg-slate-700/50">
                <span className="text-sm font-medium">
                  Sort:{' '}
                  {sortBy === 'recent'
                    ? 'Recent'
                    : sortBy === 'name'
                      ? 'Name'
                      : 'Collaborators'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Sort Dropdown */}
              <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-300">
                {[
                  { value: 'recent' as const, label: 'Most Recent' },
                  { value: 'name' as const, label: 'Name (A-Z)' },
                  { value: 'collaborators' as const, label: 'Most Collaborators' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-300 ${
                      sortBy === option.value
                        ? 'bg-emerald-600/20 text-blue-300'
                        : 'text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Count */}
            <div className="ml-auto flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400">
              <FolderOpen className="w-4 h-4" />
              <span>
                {filteredProjects.length} of {projects.length} projects
              </span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-6">
              <FolderOpen className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Projects Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || filterLanguage
                ? "Try adjusting your search or filters to find what you're looking for."
                : 'Create your first project to get started with ZenCode AI.'}
            </p>
            <Button
              onClick={() => setShowNewProjectModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredProjects.map((project) => {
              const badge = languageBadge(project.language)
              return (
                <div
                  key={project._id}
                  className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden cursor-pointer"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-emerald-300 transition-colors duration-300">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {project.description || 'No description'}
                        </p>
                      </div>

                      {/* Menu Button */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === project._id ? null : project._id)
                          }
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Context Menu */}
                        {activeMenu === project._id && (
                          <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl z-50 min-w-max animate-in fade-in slide-in-from-top-2 duration-300">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(project._id)
                                setActiveMenu(null)
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700 transition-colors duration-300"
                            >
                              <Copy className="w-4 h-4" />
                              Copy ID
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project._id)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="space-y-2">
                      {/* Language Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${badge.bg} ${badge.text} text-sm font-medium w-fit`}>
                        <span>{badge.icon}</span>
                        {project.language}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          <Clock className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {new Date(project.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                        {project.collaborators.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                            <Users className="w-4 h-4" />
                            <span>{project.collaborators.length}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => router.push(`/editor-enhanced?projectId=${project._id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-blue-300 rounded-lg hover:from-emerald-600/40 hover:to-teal-600/40 hover:border-emerald-500/50 transition-all duration-300 font-medium text-sm group/btn"
                      >
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        Open
                      </button>
                      <button
                        onClick={() => router.push(`/editor-enhanced?projectId=${project._id}`)}
                        className="p-2.5 text-gray-400 hover:text-emerald-300 hover:bg-slate-700/50 rounded-lg transition-all duration-300"
                        title="Quick open"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in scale-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>

            <div className="space-y-5">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Project Name
                </label>
                <Input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Description (optional)
                </label>
                <textarea
                  placeholder="What's this project about?"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                  rows={3}
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Language
                </label>
                <select
                  value={newProjectLanguage}
                  onChange={(e) => setNewProjectLanguage(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                >
                  {['JavaScript', 'TypeScript', 'Python', 'React', 'HTML', 'CSS'].map((lang) => (
                    <option key={lang} value={lang.toLowerCase()}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-700">
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  onClick={() => setShowNewProjectModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .hidden {
            display: none !important;
          }

          .group-hover\:block {
            display: block;
          }
        }
      `}</style>
    </div>
  )
}
