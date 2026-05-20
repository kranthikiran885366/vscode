'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Settings,
  Globe,
  Lock,
  AlertCircle,
  Trash2,
  Upload,
  Edit,
  Copy,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OrgSettings {
  name: string
  slug: string
  description: string
  logo?: string
  website?: string
  email: string
  country: string
  industry: string
  timezone: string
}

export default function SettingsPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [settings, setSettings] = useState<OrgSettings>({
    name: 'Acme Corporation',
    slug: 'acme-corp',
    description: 'Enterprise software development company',
    website: 'https://acme.com',
    email: 'admin@acme.com',
    country: 'United States',
    industry: 'Software Development',
    timezone: 'America/New_York',
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhooks')
  const [webhookSecret, setWebhookSecret] = useState('whk_live_****')
  const [showSecret, setShowSecret] = useState(false)

  const handleSaveSettings = () => {
    // Save logic here
    console.log('Settings saved:', settings)
  }

  const handleDeleteOrg = () => {
    // Delete logic here
    console.log('Organization deleted')
    setShowDeleteModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Settings className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Organization Settings</h1>
            </div>
            <p className="text-slate-400">Manage organization details and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="data">Data & Privacy</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            {/* Logo */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Organization Logo</h2>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">AC</span>
                </div>
                <div>
                  <Button className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-slate-400">PNG or JPG (Max 2MB)</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Organization Name</label>
                <Input
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Organization Slug (URL)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={settings.slug}
                      onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  zencode.io/org/{settings.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Website</label>
                  <Input
                    type="url"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Country</label>
                  <Input
                    value={settings.country}
                    onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Industry</label>
                  <Input
                    value={settings.industry}
                    onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                <Input
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <Button onClick={handleSaveSettings} className="mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Webhook Configuration</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Webhook URL</label>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                    placeholder="https://api.example.com/webhooks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Webhook Secret
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={webhookSecret}
                      readOnly
                      className="bg-slate-700 border-slate-600"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Events</label>
                  <div className="space-y-2">
                    {[
                      { name: 'Project created', checked: true },
                      { name: 'Project deleted', checked: true },
                      { name: 'File updated', checked: true },
                      { name: 'Execution completed', checked: false },
                      { name: 'Team member added', checked: true },
                    ].map((event) => (
                      <label
                        key={event.name}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={event.checked}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-slate-300">{event.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button>Save Webhook Configuration</Button>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Deliveries</h2>
              <div className="space-y-3">
                {[
                  { event: 'project.created', status: 'success', time: '2 mins ago' },
                  { event: 'file.updated', status: 'success', time: '15 mins ago' },
                  { event: 'execution.completed', status: 'failed', time: '1 hour ago' },
                ].map((delivery, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                    <div>
                      <p className="font-semibold text-white">{delivery.event}</p>
                      <p className="text-xs text-slate-400">{delivery.time}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        delivery.status === 'success'
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Data & Privacy Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Data Export</h2>
              <p className="text-slate-300 mb-4">
                Download all your organization data in a portable format.
              </p>
              <Button>Export All Data (JSON)</Button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="retention" defaultChecked className="w-4 h-4" />
                    <span className="text-white">Keep data for 30 days after deletion</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="retention" className="w-4 h-4" />
                    <span className="text-white">Keep data for 90 days after deletion</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="retention" className="w-4 h-4" />
                    <span className="text-white">Permanent deletion (no recovery)</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <div className="bg-red-900/20 border-2 border-red-700/50 rounded-lg p-6">
              <div className="flex gap-4 mb-6">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                  <p className="text-red-300">
                    These actions are permanent and cannot be undone. Proceed with caution.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800 border border-red-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Delete Organization</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    This will permanently delete your organization, all projects, and data.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Organization
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Delete Organization?</h2>
            <p className="text-slate-300 mb-6">
              This action cannot be undone. All projects, files, and data will be permanently deleted.
            </p>

            <Input
              placeholder="Type organization name to confirm"
              className="bg-slate-700 border-slate-600 mb-4"
            />

            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={handleDeleteOrg}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
