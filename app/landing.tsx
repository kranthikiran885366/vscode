'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Code2,
  Bot,
  Users,
  GitBranch,
  RefreshCw,
  Terminal,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'AI Code Completion',
      description: 'Intelligent code suggestions powered by GPT-4 and Claude',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Code Generation',
      description: 'Generate code from natural language descriptions',
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: 'Smart Refactoring',
      description: 'AI-powered code refactoring and optimization',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Real-Time Collaboration',
      description: 'Edit together with shared cursors and chat',
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: 'Code Execution',
      description: 'Run code safely in isolated containers',
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: 'Git Integration',
      description: 'Built-in version control and deployment',
    },
  ]

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'Forever free',
      description: 'Perfect for learning',
      features: [
        '5 projects',
        'Basic AI features',
        'Community support',
        'Public projects only',
        '1GB storage',
      ],
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For developers',
      features: [
        'Unlimited projects',
        'Advanced AI features',
        'Priority support',
        'Private projects',
        '100GB storage',
        'Team collaboration',
        'Custom domains',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact us',
      description: 'For teams',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'SSO & security',
        'Custom integrations',
        'Unlimited storage',
        'SLA guarantee',
        'On-premise option',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                ZenCode AI
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:text-blue-400 transition">
                Features
              </a>
              <a href="#pricing" className="hover:text-blue-400 transition">
                Pricing
              </a>
              <a href="#docs" className="hover:text-blue-400 transition">
                Docs
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block py-2 hover:text-blue-400">
                Features
              </a>
              <a href="#pricing" className="block py-2 hover:text-blue-400">
                Pricing
              </a>
              <a href="#docs" className="block py-2 hover:text-blue-400">
                Docs
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">
              Powered by GPT-4 & Claude AI
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            The Future of Code Editing
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            ZenCode AI combines the power of VS Code, Cursor, and advanced AI to create the ultimate development experience. Write code faster, smarter, and with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 w-full sm:w-auto">
                Start Coding Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="border-slate-600 hover:bg-slate-800 text-lg px-8 py-6 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </a>
          </div>

          {/* Demo Video Placeholder */}
          <div className="rounded-lg overflow-hidden border border-slate-700 shadow-2xl mb-8">
            <div className="aspect-video bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-500 opacity-50" />
                <p className="text-gray-400">Interactive Demo (Coming Soon)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Everything you need to write better code, faster. Powered by cutting-edge AI.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-blue-500 transition group"
              >
                <div className="text-blue-400 mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ZenCode */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why ZenCode?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Built for Modern Development
              </h3>
              <ul className="space-y-4">
                {[
                  'Native support for 50+ programming languages',
                  'Real-time collaboration with your team',
                  'Advanced debugging with AI assistance',
                  'Instant code execution and testing',
                  'Git integration with AI commits',
                  'Custom themes and extensions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-8 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-bold text-blue-400">50ms</p>
                  <p className="text-gray-400">Average AI response time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">99.9%</p>
                  <p className="text-gray-400">Uptime guarantee</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-pink-400">10k+</p>
                  <p className="text-gray-400">Active developers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-400 mb-16">
            Choose the plan that fits your needs
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg p-8 transition ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 border-2 border-blue-400 transform scale-105'
                    : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-300 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>

                <Link href="/auth/signup" className="w-full block mb-8">
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up Your Coding?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of developers using ZenCode AI to write better code faster.
          </p>
          <Link href="/auth/signup">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-slate-700 text-gray-400">
            <p>&copy; 2024 ZenCode AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
