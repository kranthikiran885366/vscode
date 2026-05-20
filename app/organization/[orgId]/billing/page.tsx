'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  Download,
  Plus,
  Check,
  X,
  AlertCircle,
  Zap,
  Users,
  Code,
  BarChart3,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  billing: 'monthly' | 'yearly'
  features: { name: string; included: boolean }[]
  limits: {
    storage: string
    collaborators: string
    projects: string
    executions: string
  }
  popular?: boolean
}

interface Invoice {
  id: string
  date: Date
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  expiry?: string
  brand: string
  isDefault: boolean
}

export default function BillingPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [currentPlan, setCurrentPlan] = useState<string>('pro')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      expiry: '12/25',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      expiry: '06/24',
      brand: 'Mastercard',
      isDefault: false,
    },
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      date: new Date('2024-03-01'),
      amount: 99,
      status: 'paid',
      description: 'Monthly subscription - Pro Plan',
    },
    {
      id: 'INV-002',
      date: new Date('2024-02-01'),
      amount: 99,
      status: 'paid',
      description: 'Monthly subscription - Pro Plan',
    },
    {
      id: 'INV-003',
      date: new Date('2024-01-01'),
      amount: 99,
      status: 'paid',
      description: 'Monthly subscription - Pro Plan',
    },
  ])

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'For getting started',
      price: 0,
      billing: 'monthly',
      features: [
        { name: 'Up to 5 projects', included: true },
        { name: 'Up to 2 collaborators', included: true },
        { name: '5GB storage', included: true },
        { name: 'Community support', included: true },
        { name: 'Advanced analytics', included: false },
        { name: 'SSO & SAML', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom domain', included: false },
      ],
      limits: {
        storage: '5GB',
        collaborators: '2',
        projects: '5',
        executions: '1,000/month',
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams',
      price: billingCycle === 'monthly' ? 99 : 990,
      billing: billingCycle,
      popular: true,
      features: [
        { name: 'Unlimited projects', included: true },
        { name: 'Up to 10 collaborators', included: true },
        { name: '500GB storage', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'API access', included: true },
        { name: 'Custom integrations', included: false },
        { name: 'Custom domain', included: false },
      ],
      limits: {
        storage: '500GB',
        collaborators: '10',
        projects: 'Unlimited',
        executions: '50,000/month',
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 0,
      billing: 'monthly',
      features: [
        { name: 'Unlimited everything', included: true },
        { name: 'Unlimited collaborators', included: true },
        { name: 'Unlimited storage', included: true },
        { name: '24/7 phone & email support', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'API access', included: true },
        { name: 'SSO & SAML', included: true },
        { name: 'Custom domain & branding', included: true },
      ],
      limits: {
        storage: 'Unlimited',
        collaborators: 'Unlimited',
        projects: 'Unlimited',
        executions: 'Unlimited',
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-2">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Billing & Subscription</h1>
          </div>
          <p className="text-slate-400">Manage your plan, payments, and invoices</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="plans" className="space-y-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-700"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                    billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}>
                Yearly
                <span className="ml-2 text-xs bg-green-900 text-green-200 px-2 py-1 rounded">
                  Save 20%
                </span>
              </span>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border-2 p-8 transition-all ${
                    currentPlan === plan.id
                      ? 'border-blue-500 bg-slate-700/50'
                      : 'border-slate-700 hover:border-slate-600'
                  } ${plan.popular ? 'ring-2 ring-blue-500 relative' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <p className="text-3xl font-bold text-white">Custom</p>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-slate-400">
                          /{plan.billing === 'monthly' ? 'month' : 'year'}
                        </span>
                      </>
                    )}
                  </div>

                  {currentPlan === plan.id ? (
                    <div className="mb-6 p-3 bg-green-900/30 border border-green-700 rounded text-green-200 text-sm">
                      ✓ Current plan
                    </div>
                  ) : (
                    <Button className="w-full mb-6">
                      {plan.price === 0 ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  )}

                  {/* Limits */}
                  <div className="mb-6 p-4 bg-slate-800 rounded border border-slate-700">
                    <p className="text-xs font-semibold text-slate-300 uppercase mb-3">Limits</p>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span className="font-semibold">{plan.limits.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collaborators:</span>
                        <span className="font-semibold">{plan.limits.collaborators}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects:</span>
                        <span className="font-semibold">{plan.limits.projects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Executions:</span>
                        <span className="font-semibold">{plan.limits.executions}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        )}
                        <span
                          className={feature.included ? 'text-slate-200' : 'text-slate-500'}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Payment Method
              </Button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400 mb-4">No payment methods added</p>
                <Button>Add Payment Method</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {method.brand} •••• {method.last4}
                        </p>
                        {method.expiry && (
                          <p className="text-sm text-slate-400">Expires {method.expiry}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {method.isDefault && (
                        <span className="px-3 py-1 bg-green-900 text-green-200 rounded text-sm font-semibold">
                          Default
                        </span>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Invoices</h2>

            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Download className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{invoice.id}</p>
                      <p className="text-sm text-slate-400">{invoice.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-semibold text-white">${invoice.amount}</p>
                      <p
                        className={`text-sm ${
                          invoice.status === 'paid'
                            ? 'text-green-400'
                            : invoice.status === 'pending'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">
                        {invoice.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Usage Statistics</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Storage Used', value: '245 GB', limit: '500 GB', percent: 49 },
                { label: 'API Calls', value: '42.5K', limit: '50K', percent: 85 },
                { label: 'Collaborators', value: '8', limit: '10', percent: 80 },
                { label: 'Monthly Executions', value: '38.2K', limit: '50K', percent: 76 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                >
                  <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${stat.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">of {stat.limit}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
