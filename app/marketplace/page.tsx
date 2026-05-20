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
  ChevronRight,
  Heart,
  ShoppingCart,
  Code2,
  TrendingUp,
  Users,
  Eye,
  Check,
  X,
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
  trending: boolean
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
  const [activeTab, setActiveTab] = useState<'templates' | 'extensions'>('templates')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular')
  const [showFilters, setShowFilters] = useState(false)

  const categoryIcons: Record<string, any> = {
    web: <Layout className="w-5 h-5" />,
    backend: <Code className="w-5 h-5" />,
    mobile: <Zap className="w-5 h-5" />,
    devops: <Database className="w-5 h-5" />,
    data: <TrendingUp className="w-5 h-5" />,
    editor: <Code className="w-5 h-5" />,
    language: <Code2 className="w-5 h-5" />,
    theme: <Layout className="w-5 h-5" />,
    tool: <Zap className="w-5 h-5" />,
    integration: <Package className="w-5 h-5" />,
  }

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
      trending: true,
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
      rating: 4.7,
      reviews: 612,
      author: 'Web Solutions',
      price: 39,
      trending: true,
      tags: ['Next.js', 'Tailwind', 'Stripe', 'Database'],
      features: [
        'Product catalog',
        'Shopping cart',
        'Payment processing',
        'Admin dashboard',
      ],
    },
    {
      id: '3',
      name: 'Real-time Chat App',
      category: 'backend',
      description: 'Socket.io based real-time messaging platform',
      downloads: 8900,
      rating: 4.6,
      reviews: 445,
      author: 'Realtime Labs',
      price: 24,
      trending: false,
      tags: ['Socket.io', 'WebSocket', 'Node.js'],
      features: [
        'Real-time messaging',
        'User groups',
        'File sharing',
        'Notifications',
      ],
    },
    {
      id: '4',
      name: 'Mobile App Starter',
      category: 'mobile',
      description: 'React Native starter kit with navigation and UI components',
      downloads: 10200,
      rating: 4.5,
      reviews: 356,
      author: 'Mobile First',
      price: 19,
      trending: true,
      tags: ['React Native', 'Expo', 'Navigation'],
      features: [
        'Navigation setup',
        'UI kit',
        'State management',
        'API integration',
      ],
    },
    {
      id: '5',
      name: 'DevOps Pipeline',
      category: 'devops',
      description: 'Complete CI/CD setup with Docker and Kubernetes',
      downloads: 5600,
      rating: 4.9,
      reviews: 234,
      author: 'DevOps Pro',
      price: 49,
      trending: false,
      tags: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub'],
      features: [
        'Docker setup',
        'Kubernetes config',
        'Auto deployment',
        'Monitoring',
      ],
    },
    {
      id: '6',
      name: 'Data Analytics Hub',
      category: 'data',
      description: 'Build data dashboards with D3.js and React',
      downloads: 7800,
      rating: 4.7,
      reviews: 389,
      author: 'Analytics Plus',
      price: 34,
      trending: true,
      tags: ['D3.js', 'Charts', 'Analytics', 'React'],
      features: [
        'Chart library',
        'Data processing',
        'Export functionality',
        'Real-time updates',
      ],
    },
  ]

  const extensions: Extension[] = [
    {
      id: 'ext-1',
      name: 'Prettier Code Formatter',
      category: 'tool',
      description: 'Automatic code formatting for consistent style',
      version: '3.0.0',
      author: 'Prettier Team',
      downloads: 2450000,
      rating: 4.9,
      reviews: 5230,
      free: true,
      tags: ['Formatting', 'Code Quality'],
    },
    {
      id: 'ext-2',
      name: 'GitLens',
      category: 'integration',
      description: 'Advanced Git integration and blame visualization',
      version: '13.5.0',
      author: 'Eric Amodio',
      downloads: 1890000,
      rating: 4.8,
      reviews: 4120,
      free: true,
      tags: ['Git', 'Version Control', 'Productivity'],
    },
    {
      id: 'ext-3',
      name: 'Copilot AI',
      category: 'tool',
      description: 'AI-powered code suggestions and completion',
      version: '1.40.0',
      author: 'GitHub',
      downloads: 1650000,
      rating: 4.7,
      reviews: 3890,
      free: false,
      tags: ['AI', 'Code Completion', 'Productivity'],
    },
    {
      id: 'ext-4',
      name: 'Dracula Theme',
      category: 'theme',
      description: 'Dark theme with high contrast for reduced eye strain',
      version: '2.23.0',
      author: 'Zeno Rocha',
      downloads: 920000,
      rating: 4.6,
      reviews: 2340,
      free: true,
      tags: ['Theme', 'Dark Mode', 'Appearance'],
    },
    {
      id: 'ext-5',
      name: 'ESLint',
      category: 'tool',
      description: 'JavaScript linting to find and fix problems',
      version: '8.20.0',
      author: 'ESLint Team',
      downloads: 1200000,
      rating: 4.8,
      reviews: 2890,
      free: true,
      tags: ['Linting', 'Code Quality', 'JavaScript'],
    },
  ]

  const templateCategories = ['web', 'backend', 'mobile', 'devops', 'data']
  const extensionCategories = ['editor', 'language', 'theme', 'tool', 'integration']

  let filteredItems =
    activeTab === 'templates'
      ? templates.filter((t) => {
          const matchesSearch =
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesCategory = selectedCategory ? t.category === selectedCategory : true
          return matchesSearch && matchesCategory
        })
      : extensions.filter((e) => {
          const matchesSearch =
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesCategory = selectedCategory ? e.category === selectedCategory : true
          return matchesSearch && matchesCategory
        })

  // Sort items
  if (sortBy === 'rating') {
    filteredItems.sort(
      (a, b) => (b as any).rating - (a as any).rating
    )
  } else if (sortBy === 'newest') {
    filteredItems.sort((a, b) => (b as any).version?.localeCompare((a as any).version) || 0)
  } else {
    filteredItems.sort(
      (a, b) => (b as any).downloads - (a as any).downloads
    )
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ZenCode Marketplace
                </span>
              </div>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700/50">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12 space-y-6">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">
              Explore <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Templates & Extensions</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover powerful templates and extensions to accelerate your development
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300" />
            <Input
              type="text"
              placeholder="Search templates, extensions, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
            />
          </div>

          {/* Tabs and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as 'templates' | 'extensions')
                setSelectedCategory(null)
              }}
              className="w-full"
            >
              <TabsList className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="extensions" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Extensions
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'rating' | 'newest')}
                className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-medium text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-all duration-300 group"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`p-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-between ${
                  !selectedCategory
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                    : 'bg-slate-700/50 border border-slate-600 text-gray-400 hover:border-slate-500'
                }`}
              >
                <span>All</span>
                {!selectedCategory && <Check className="w-4 h-4" />}
              </button>

              {(activeTab === 'templates' ? templateCategories : extensionCategories).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                        : 'bg-slate-700/50 border border-slate-600 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                    {selectedCategory === cat && <Check className="w-4 h-4" />}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'templates' | 'extensions')}>
          <TabsContent value="templates" className="space-y-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Templates Found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredItems as Template[]).map((template) => (
                  <div
                    key={template.id}
                    className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col"
                  >
                    {/* Trending Badge */}
                    {template.trending && (
                      <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-full text-orange-300 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Trending
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-slate-900/50 text-gray-400 hover:text-red-400 hover:bg-slate-800/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(template.id)
                            ? 'fill-red-400 text-red-400'
                            : ''
                        }`}
                      />
                    </button>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                            {categoryIcons[template.category]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                              {template.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">{template.author}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {template.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400">Features:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {template.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-700/50 border border-slate-600 text-xs rounded-full text-gray-300 hover:border-slate-500 transition-colors duration-300 cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{template.rating}</span>
                            <span className="text-xs text-gray-500">({template.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Download className="w-4 h-4" />
                            <span className="text-xs">
                              {(template.downloads / 1000).toFixed(1)}k
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-blue-400">
                          ${template.price}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-900/20">
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-white hover:bg-slate-700/50 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="extensions" className="space-y-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <Zap className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No Extensions Found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(filteredItems as Extension[]).map((extension) => (
                  <div
                    key={extension.id}
                    className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col"
                  >
                    {/* Free Badge */}
                    {extension.free && (
                      <div className="absolute top-4 right-4 inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-xs font-semibold">
                        Free
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(extension.id)}
                      className="absolute top-4 left-4 p-2 rounded-lg bg-slate-900/50 text-gray-400 hover:text-red-400 hover:bg-slate-800/70 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(extension.id)
                            ? 'fill-red-400 text-red-400'
                            : ''
                        }`}
                      />
                    </button>

                    {/* Content */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          {categoryIcons[extension.category]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {extension.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">v{extension.version}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400">
                        {extension.description}
                      </p>

                      {/* By Author */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        By {extension.author}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {extension.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-700/50 border border-slate-600 text-xs rounded-full text-gray-300 hover:border-slate-500 transition-colors duration-300 cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{extension.rating}</span>
                          <span className="text-xs text-gray-500">({extension.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Download className="w-4 h-4" />
                          <span className="text-xs">
                            {(extension.downloads / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      {extension.free ? 'Install' : 'View Details'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

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

        .animate-in {
          opacity: 1;
        }

        .fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
