'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Users,
  Code,
  Clock,
  FileText,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MetricData {
  date: string
  value: number
  trend?: number
}

export default function AnalyticsPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const getMetrics = () => {
    const data: Record<string, MetricData[]> = {
      '7d': [
        { date: 'Mon', value: 140 },
        { date: 'Tue', value: 160 },
        { date: 'Wed', value: 145 },
        { date: 'Thu', value: 190 },
        { date: 'Fri', value: 210 },
        { date: 'Sat', value: 95 },
        { date: 'Sun', value: 110 },
      ],
      '30d': Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 300) + 50,
      })),
      '90d': Array.from({ length: 13 }, (_, i) => ({
        date: `Week ${i + 1}`,
        value: Math.floor(Math.random() * 2000) + 500,
      })),
      '1y': Array.from({ length: 12 }, (_, i) => ({
        date: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        value: Math.floor(Math.random() * 5000) + 2000,
      })),
    }
    return data[timeRange]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <BarChart3 className="w-8 h-8 text-emerald-400" />
                <h1 className="text-4xl font-bold text-white">Analytics</h1>
              </div>
              <p className="text-slate-400">Monitor usage and performance metrics</p>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Executions', value: '45.2K', change: '+12%', icon: Code },
            { label: 'Active Users', value: '234', change: '+8%', icon: Users },
            { label: 'Avg Response Time', value: '245ms', change: '-5%', icon: Clock },
            { label: 'Total Files', value: '12.4K', change: '+15%', icon: FileText },
          ].map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs text-green-400">{metric.change}</span>
                </div>
                <p className="text-slate-400 text-sm mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="executions" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="executions">Code Executions</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="storage">Storage Usage</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="executions" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Code Executions Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2 bg-slate-900/50 rounded p-4">
              {getMetrics().map((data, i) => {
                const maxValue = Math.max(...getMetrics().map((d) => d.value))
                const height = (data.value / maxValue) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t hover:from-emerald-500 hover:to-emerald-300 transition"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-center truncate">{data.date}</p>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="collaborations" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Real-time Collaborations</h3>
            <div className="space-y-4">
              {[
                { name: 'John Doe', activity: 'Editing file.ts', time: '2 mins ago', status: 'active' },
                { name: 'Jane Smith', activity: 'Reviewing PR #123', time: '10 mins ago', status: 'active' },
                { name: 'Bob Johnson', activity: 'Running tests', time: '1 hour ago', status: 'idle' },
              ].map((collab) => (
                <div key={collab.name} className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${collab.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <div>
                      <p className="font-semibold text-white">{collab.name}</p>
                      <p className="text-sm text-slate-400">{collab.activity}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{collab.time}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="storage" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Storage Usage</h3>
            <div className="space-y-4">
              {[
                { type: 'Source Code', size: '245 GB', percent: 49 },
                { type: 'Media Files', size: '156 GB', percent: 31 },
                { type: 'Execution Logs', size: '78 GB', percent: 16 },
                { type: 'Backups', size: '21 GB', percent: 4 },
              ].map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between mb-2">
                    <p className="text-white font-semibold">{item.type}</p>
                    <p className="text-slate-400">{item.size}</p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-emerald-600 h-3 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-3">Response Time Distribution</p>
                <div className="space-y-2">
                  {[
                    { range: '< 100ms', count: 2450, percent: 35 },
                    { range: '100-200ms', count: 1870, percent: 27 },
                    { range: '200-500ms', count: 1560, percent: 22 },
                    { range: '> 500ms', count: 1120, percent: 16 },
                  ].map((item) => (
                    <div key={item.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{item.range}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div
                          className="bg-green-600 h-2 rounded"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-3">Error Rate by Endpoint</p>
                <div className="space-y-2">
                  {[
                    { endpoint: '/api/execute', rate: '0.2%' },
                    { endpoint: '/api/files', rate: '0.1%' },
                    { endpoint: '/api/projects', rate: '0.3%' },
                    { endpoint: '/api/collab', rate: '0.05%' },
                  ].map((item) => (
                    <div key={item.endpoint} className="flex justify-between text-sm p-2 bg-slate-700/50 rounded">
                      <span className="text-slate-300">{item.endpoint}</span>
                      <span className="text-white font-semibold">{item.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export */}
        <div className="mt-8 flex justify-end">
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  )
}
