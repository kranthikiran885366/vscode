'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Star,
  Download,
  Code,
  Layout,
  Database,
  Zap,
  Search,
  Filter,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Template {
  id: string
  name: string
  category: 'web' | 'backend' | 'mobile' | 'devops' | 'data'
  description: string
  preview?: string
  downloads: number
  rating: number
  reviews: number
  author: string
  price: number
  tags: string[]
  features: string[]
}

interface Extension {
  id: string
  name: string
  category: 'editor' | 'language' | 'theme' | 'tool' | 'integration'
  description: string
  version: string
  author: string
  downloads: number
  rating: number
  reviews: number
  free: boolean
  tags: string[]
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'new'>('popular')

  const templates: Template[] = [
    {
      id: '1',
      name: 'Full Stack Web App',
      category: 'web',
      description: 'Complete MERN stack template with authentication and database',
      downloads: 15420,
      rating: 4.8,
      reviews: 824,
      author: 'DevTeam Pro',
      price: 29,
      tags: ['React', 'Node.js', 'MongoDB', 'Auth'],
      features: [
        'User authentication',
        'Database schema',
        'API endpoints',
        'Responsive UI',
      ],
    },
    {
      id: '2',
      name: 'Next.js E-commerce',
      category: 'web',
      description: 'Modern e-commerce platform with Stripe integration',
      downloads: 12340,
      rating: 4.9,
      reviews: 567,
      author: 'Web Masters',
      price: 39,
      tags: ['Next.js', 'Tailwind', 'Stripe', 'Typescript'],
      features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Admin panel'],
    },
    {
      id: '3',
      name: 'FastAPI Backend',
      category: 'backend',
      description: 'Production-ready Python FastAPI backend setup',
      downloads: 8920,
      rating: 4.7,
      reviews: 321,
      author: 'Backend Masters',
      price: 19,
      tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      features: ['REST API', 'Database models', 'Authentication', 'Deployment config'],
    },
    {
      id: '4',
      name: 'React Native Mobile App',
      category: 'mobile',
      description: 'Cross-platform mobile app template',
      downloads: 5670,
      rating: 4.6,
      reviews: 234,
      author: 'Mobile Devs',
      price: 34,
      tags: ['React Native', 'iOS', 'Android', 'Firebase'],
      features: ['Navigation', 'State management', 'API integration', 'Offline support'],
    },
    {
      id: '5',
      name: 'Kubernetes DevOps',
      category: 'devops',
      description: 'Complete Kubernetes setup with CI/CD pipeline',
      downloads: 4230,
      rating: 4.5,
      reviews: 189,
      author: 'DevOps Pro',
      price: 49,
      tags: ['Kubernetes', 'Docker', 'CI/CD', 'GitOps'],
      features: ['Helm charts', 'Pipeline config', 'Monitoring setup', 'Documentation'],
    },
    {
      id: '6',
      name: 'Data Analytics Pipeline',
      category: 'data',
      description: 'ETL pipeline for data processing and visualization',
      downloads: 3120,
      rating: 4.8,
      reviews: 156,
      author: 'Data Engineers',
      price: 44,
      tags: ['Python', 'Apache Airflow', 'BigQuery', 'Tableau'],
      features: ['ETL workflow', 'Data validation', 'Visualization', 'Reporting'],
    },
  ]

  const extensions: Extension[] = [
    {
      id: '1',
      name: 'Prettier Code Formatter',
      category: 'editor',
      description: 'Auto-format code with Prettier integration',
      version: '2.8.0',
      author: 'Code Formatters',
      downloads: 125000,
      rating: 4.9,
      reviews: 3420,
      free: true,
      tags: ['Formatting', 'Code quality', 'Auto-save'],
    },
    {
      id: '2',
      name: 'Python Language Server',
      category: 'language',
      description: 'Complete Python support with intellisense and debugging',
      version: '1.12.4',
      author: 'Python Collective',
      downloads: 98420,
      rating: 4.8,
      reviews: 2850,
      free: true,
      tags: ['Python', 'Linting', 'Testing'],
    },
    {
      id: '3',
      name: 'Dracula Theme',
      category: 'theme',
      description: 'Dark theme with carefully selected colors',
      version: '3.5.1',
      author: 'Theme Artists',
      downloads: 156000,
      rating: 4.7,
      reviews: 4200,
      free: true,
      tags: ['Dark theme', 'Customizable', 'Popular'],
    },
    {
      id: '4',
      name: 'Docker Manager Pro',
      category: 'tool',
      description: 'Manage Docker containers directly from the IDE',
      version: '2.1.0',
      author: 'DevTools Inc',
      downloads: 45300,
      rating: 4.6,
      reviews: 890,
      free: false,
      tags: ['Docker', 'Containers', 'DevOps'],
    },
    {
      id: '5',
      name: 'GitHub Integration Plus',
      category: 'integration',
      description: 'Enhanced GitHub workflow with pull requests and issues',
      version: '3.4.2',
      author: 'GitHub Experts',
      downloads: 78900,
      rating: 4.9,
      reviews: 2100,
      free: true,
      tags: ['GitHub', 'Git', 'Collaboration'],
    },
    {
      id: '6',
      name: 'REST API Tester',
      category: 'tool',
      description: 'Test APIs directly from your editor',
      version: '1.8.5',
      author: 'API Tools',
      downloads: 34560,
      rating: 4.5,
      reviews: 650,
      free: true,
      tags: ['API testing', 'HTTP', 'Development'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Package className="w-8 h-8 text-blue-400" />
                <h1 className="text-4xl font-bold text-white">Marketplace</h1>
              </div>
              <p className="text-slate-400">Discover templates and extensions</p>
            </div>
            <Link href="/dashboard">
              <Button className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search templates and extensions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                'React',
                'Next.js',
                'Node.js',
                'Python',
                'TypeScript',
                'Tailwind',
              ].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="templates" className="space-y-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="extensions">Extensions</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition group cursor-pointer"
                >
                  {/* Preview */}
                  <div className="w-full h-40 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden group-hover:scale-105 transition">
                    <Code className="w-20 h-20 text-white/50" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span>{template.rating}</span>
                        <span>({template.reviews})</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {(template.downloads / 1000).toFixed(0)}K downloads
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">${template.price}</span>
                      <Button size="sm" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Use
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Extensions Tab */}
          <TabsContent value="extensions" className="space-y-6">
            <div className="space-y-3">
              {extensions.map((ext) => (
                <div
                  key={ext.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition flex items-start justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{ext.name}</h3>
                      <span className="text-xs text-slate-500">v{ext.version}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{ext.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>by {ext.author}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {ext.rating} ({ext.reviews})
                      </div>
                      <span>•</span>
                      <span>{(ext.downloads / 1000).toFixed(0)}K downloads</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {ext.free ? (
                      <span className="px-3 py-1 bg-green-900 text-green-200 rounded text-xs font-semibold">
                        Free
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-xs font-semibold">
                        Pro
                      </span>
                    )}
                    <Button size="sm">Install</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
