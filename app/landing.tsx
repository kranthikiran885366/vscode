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
  Shield,
  Zap as ZapIcon,
  Cpu,
  Share2,
  Heart,
  Star,
} from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI Code Completion',
      description: 'Intelligent code suggestions powered by GPT-4 and Claude',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Code Generation',
      description: 'Generate code from natural language descriptions',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Smart Refactoring',
      description: 'AI-powered code refactoring and optimization',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Real-Time Collaboration',
      description: 'Edit together with shared cursors and chat',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: 'Code Execution',
      description: 'Run code safely in isolated containers',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: 'Git Integration',
      description: 'Built-in version control and deployment',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: '2FA, API keys, SSO/SAML, encryption & compliance',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Management',
      description: 'Organizations, roles, permissions & audit logs',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards & productivity metrics',
      gradient: 'from-yellow-500 to-red-500',
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'Sandbox Execution',
      description: 'Secure Docker-based code execution with timeouts',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Project Sharing',
      description: 'Share, archive & export projects with ease',
      gradient: 'from-pink-500 to-orange-500',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'API-First Platform',
      description: 'RESTful API with rate limiting & webhooks',
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      company: 'TechStartup Inc',
      content: 'ZenCode AI has transformed how I code. The AI suggestions are incredibly accurate and save me hours daily.',
      avatar: '👩‍💻',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'CTO',
      company: 'Digital Solutions',
      content: 'The real-time collaboration feature is game-changing. Our team productivity increased by 40%.',
      avatar: '👨‍💼',
      rating: 5,
    },
    {
      name: 'Elena Rodriguez',
      role: 'DevOps Engineer',
      company: 'CloudTech',
      content: 'Integrating ZenCode into our workflow was seamless. Best investment for our development team.',
      avatar: '👩‍🔬',
      rating: 5,
    },
  ]

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for learning and side projects',
      price: billingCycle === 'monthly' ? 0 : 0,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      features: [
        'Basic code editor',
        'Syntax highlighting',
        '50k AI tokens/month',
        'File management',
        'Basic debugging',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Professional',
      description: 'For serious developers',
      price: billingCycle === 'monthly' ? 29 : 290,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      features: [
        'Everything in Starter',
        'Advanced AI features',
        '1M AI tokens/month',
        'Real-time collaboration (5 users)',
        'Code execution',
        'Git integration',
        'Custom themes',
        'Priority support',
      ],
      cta: 'Start 14-day Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Professional',
        'Unlimited AI tokens',
        'Unlimited collaborators',
        'Advanced analytics',
        'SSO & SAML',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ZenCode AI
                </span>
                <span className="text-xs text-gray-500">By MVK Solutions</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors duration-300">
                Testimonials
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-slate-800 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white transition-colors duration-300"
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
            <div className="md:hidden pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <a href="#features" className="block py-2 text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                Features
              </a>
              <a href="#pricing" className="block py-2 text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                Pricing
              </a>
              <a href="#testimonials" className="block py-2 text-gray-300 hover:text-white hover:pl-2 transition-all duration-300">
                Testimonials
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8 hover:border-blue-500/40 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 group-hover:animate-spin" />
              <span className="text-sm text-gray-300">
                Powered by GPT-4 & Claude AI
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl sm:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              The Future of Code Editing
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Combine the power of VS Code with real-time collaboration, advanced AI, and cloud-native code execution. 
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold"> Write code faster, smarter, and together.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 rounded-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group w-full sm:w-auto">
                Start Coding Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="outline"
                className="border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 text-lg px-10 py-6 rounded-lg font-semibold transition-all duration-300 w-full sm:w-auto"
              >
                Explore Features
              </Button>
            </a>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-16">
            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-blue-500/30 transition-all duration-300">
              <div className="text-3xl font-bold text-blue-400">10K+</div>
              <div className="text-sm text-gray-400">Active Developers</div>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-purple-500/30 transition-all duration-300">
              <div className="text-3xl font-bold text-purple-400">50ms</div>
              <div className="text-sm text-gray-400">AI Response Time</div>
            </div>
            <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-pink-500/30 transition-all duration-300">
              <div className="text-3xl font-bold text-pink-400">99.9%</div>
              <div className="text-sm text-gray-400">Uptime SLA</div>
            </div>
          </div>

          {/* Demo Video Placeholder */}
          <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
              {/* Animated border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="text-center relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 group-hover:border-blue-500/60 transition-all duration-300">
                  <ZapIcon className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Interactive Demo Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to write better code, faster. Powered by cutting-edge AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon container */}
                <div className={`mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} text-white transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-2 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ZenCode Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800/50 to-slate-900/50 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Why Choose ZenCode?</h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Features list */}
            <div>
              <h3 className="text-3xl font-bold mb-8">Built for Modern Development</h3>
              <ul className="space-y-4">
                {[
                  { icon: Code2, text: 'Native support for 50+ programming languages', color: 'text-blue-400' },
                  { icon: Users, text: 'Real-time collaboration with your team', color: 'text-green-400' },
                  { icon: Bot, text: 'Advanced AI assistance with debugging', color: 'text-purple-400' },
                  { icon: Cpu, text: 'Instant code execution and testing', color: 'text-orange-400' },
                  { icon: GitBranch, text: 'Git integration with AI-powered commits', color: 'text-red-400' },
                  { icon: Shield, text: 'Custom themes and security features', color: 'text-pink-400' },
                ].map((item, i) => {
                  const IconComponent = item.icon
                  return (
                    <li key={i} className="flex items-start gap-4 group">
                      <div className={`p-2 rounded-lg bg-slate-800/50 group-hover:bg-slate-700 transition-all duration-300 flex-shrink-0 ${item.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300 mt-1">
                        {item.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right side - Stats */}
            <div className="space-y-6">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-all duration-300">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-2xl font-bold">Lightning Fast</h4>
                </div>
                <p className="text-gray-400">50ms average AI response time with <span className="text-blue-400 font-semibold">99.9% uptime</span></p>
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all duration-300">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-2xl font-bold">10K+ Developers</h4>
                </div>
                <p className="text-gray-400">Join our growing community of developers building the future</p>
              </div>

              <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-all duration-300">
                    <Share2 className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-2xl font-bold">Enterprise Ready</h4>
                </div>
                <p className="text-gray-400">SSO, SAML, and dedicated support for teams</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Loved by Developers</h2>
            <p className="text-xl text-gray-400">See what developers are saying about ZenCode AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800/50 to-slate-900/50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 mb-8">
              Choose the perfect plan for your needs
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-slate-800/50 border border-slate-700 rounded-full p-2 inline-block">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Save 20%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl transition-all duration-300 overflow-hidden group ${
                  plan.highlighted
                    ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20 md:scale-105'
                    : 'border border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Background */}
                <div className={`absolute inset-0 ${plan.highlighted ? 'bg-gradient-to-br from-blue-600/10 to-purple-600/10' : 'bg-slate-800/50'}`} />

                {/* Popular Badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                {/* Content */}
                <div className="relative p-8 z-10">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    {typeof plan.price === 'number' ? (
                      <>
                        <div className="text-4xl font-bold mb-1">
                          ${plan.price}
                          <span className="text-lg text-gray-400">{plan.period}</span>
                        </div>
                        {billingCycle === 'yearly' && plan.price > 0 && (
                          <p className="text-sm text-green-400">Billed annually</p>
                        )}
                      </>
                    ) : (
                      <div className="text-4xl font-bold text-gray-300">{plan.price}</div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mb-8 font-semibold py-3 transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  {/* Features List */}
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 group/item">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300" />
                        <span className="text-gray-300 group-hover/item:text-white transition-colors duration-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900 opacity-50" />

            {/* Content */}
            <div className="relative p-12 md:p-16 text-center z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Coding?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of developers using ZenCode AI to write better code faster. Start your free trial today with no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6 rounded-lg font-semibold shadow-xl transition-all duration-300 group">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 rounded-lg font-semibold transition-all duration-300">
                    View Plans
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ZenCode AI
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building the future of code editing with AI, collaboration, and cloud-native execution.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['Features', 'Pricing', 'Security', 'Roadmap'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-bold mb-6 text-white">Resources</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                {['Documentation', 'API Reference', 'Community', 'Support'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-sm">
            <p>&copy; 2024 ZenCode AI by MVK Solutions. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
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

        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
