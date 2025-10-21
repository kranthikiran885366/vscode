'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Share2, Settings, Code2, Clock, Users } from 'lucide-react'

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

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const { project } = await response.json()
      setProjects([project, ...projects])
      setNewProjectName('')
      setNewProjectDescription('')
      setShowNewProjectModal(false)
    } catch (error) {
      console.error('Create project error:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

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
    } catch (error) {
      console.error('Delete project error:', error)
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-lg text-gray-400">Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-2">
                <Code2 className="w-8 h-8 text-blue-500" />
                ZenCode AI
              </h1>
              <p className="text-gray-400 mt-1">By MVK Solutions</p>
            </div>
            <Button onClick={() => setShowNewProjectModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No projects found</p>
            <Button onClick={() => setShowNewProjectModal(true)}>Create Your First Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition p-6 cursor-pointer"
              >
                <div onClick={() => router.push(`/editor?projectId=${project._id}`)}>
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Code2 className="w-4 h-4" />
                      <span>{project.language}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                    {project.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{project.collaborators.length} collaborators</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/editor?projectId=${project._id}`)}
                    className="flex-1"
                  >
                    Open
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProject(project._id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <Input
                  type="text"
                  placeholder="My Awesome Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  placeholder="What's this project about?"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleCreateProject} className="flex-1">
                  Create
                </Button>
                <Button
                  onClick={() => setShowNewProjectModal(false)}
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
