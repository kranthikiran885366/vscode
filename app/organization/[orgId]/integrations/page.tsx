'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  GitBranch,
  Package,
  Database,
  Cloud,
  Plus,
  Check,
  X,
  Settings,
  ExternalLink,
  Star,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Integration {
  id: string
  name: string
  category: 'vcs' | 'package' | 'database' | 'deployment' | 'communication'
  description: string
  icon: string
  status: 'connected' | 'available' | 'coming-soon'
  config?: {
    apiKey?: string
    webhook?: string
    lastSync?: Date
  }
  rating: number
  reviews: number
}

export default function IntegrationsPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'GitHub',
      category: 'vcs',
      description: 'Sync repositories, trigger builds, and manage deployments',
      icon: '🐙',
      status: 'connected',
      config: {
        apiKey: 'ghp_****',
        lastSync: new Date('2024-03-10'),
      },
      rating: 4.8,
      reviews: 2450,
    },
    {
      id: '2',
      name: 'GitLab',
      category: 'vcs',
      description: 'Full GitLab integration with CI/CD pipelines',
      icon: '🦊',
      status: 'available',
      rating: 4.7,
      reviews: 1230,
    },
    {
      id: '3',
      name: 'npm',
      category: 'package',
      description: 'Publish and manage npm packages directly',
      icon: '📦',
      status: 'connected',
      config: {
        apiKey: 'npm_****',
        lastSync: new Date('2024-03-09'),
      },
      rating: 4.9,
      reviews: 1890,
    },
    {
      id: '4',
      name: 'Docker Hub',
      category: 'deployment',
      description: 'Build and push Docker images automatically',
      icon: '🐳',
      status: 'available',
      rating: 4.6,
      reviews: 1450,
    },
    {
      id: '5',
      name: 'PostgreSQL',
      category: 'database',
      description: 'Connect to PostgreSQL databases for data management',
      icon: '🐘',
      status: 'available',
      rating: 4.8,
      reviews: 980,
    },
    {
      id: '6',
      name: 'MongoDB',
      category: 'database',
      description: 'Integrate with MongoDB for NoSQL operations',
      icon: '🍃',
      status: 'available',
      rating: 4.7,
      reviews: 1120,
    },
    {
      id: '7',
      name: 'Slack',
      category: 'communication',
      description: 'Get notifications and alerts in Slack channels',
      icon: '💬',
      status: 'available',
      rating: 4.9,
      reviews: 3200,
    },
    {
      id: '8',
      name: 'AWS',
      category: 'cloud',
      description: 'Deploy to AWS and manage cloud resources',
      icon: '☁️',
      status: 'coming-soon',
      rating: 5.0,
      reviews: 2100,
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = ['vcs', 'package', 'database', 'deployment', 'communication', 'cloud']

  const getCategoryLabel = (cat: string) => {
    const labels = {
      vcs: 'Version Control',
      package: 'Package Manager',
      database: 'Database',
      deployment: 'Deployment',
      communication: 'Communication',
      cloud: 'Cloud',
    }
    return labels[cat as keyof typeof labels] || cat
  }

  const getCategoryIcon = (cat: string) => {
    const icons = {
      vcs: GitBranch,
      package: Package,
      database: Database,
      deployment: Cloud,
      communication: Package,
      cloud: Cloud,
    }
    return icons[cat as keyof typeof icons] || Package
  }

  const filteredIntegrations = integrations.filter((int) => {
    const matchesSearch =
      int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      int.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || int.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleConnect = (id: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id
          ? {
              ...int,
              status: 'connected' as const,
              config: {
                apiKey: `${int.name.toLowerCase()}_****`,
                lastSync: new Date(),
              },
            }
          : int
      )
    )
  }

  const handleDisconnect = (id: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id
          ? {
              ...int,
              status: 'available' as const,
              config: undefined,
            }
          : int
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Package className="w-8 h-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-white">Integrations</h1>
            </div>
            <p className="text-slate-400">Connect third-party tools and services</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((int) => (
            <div
              key={int.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-4xl">{int.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{int.name}</h3>
                    <p className="text-xs text-slate-400">{getCategoryLabel(int.category)}</p>
                  </div>
                </div>

                {int.status === 'connected' && (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 flex-1">{int.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(int.rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  {int.rating} ({int.reviews} reviews)
                </span>
              </div>

              {/* Config Info */}
              {int.config && (
                <div className="mb-4 p-3 bg-slate-900 rounded text-xs text-slate-300">
                  <p className="mb-1">Connected with API key: {int.config.apiKey}</p>
                  {int.config.lastSync && (
                    <p>Last synced: {int.config.lastSync.toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                {int.status === 'coming-soon' ? (
                  <Button variant="outline" className="flex-1" disabled>
                    Coming Soon
                  </Button>
                ) : int.status === 'connected' ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(int.id)}
                      className="text-red-600 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(int.id)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No integrations found</p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
