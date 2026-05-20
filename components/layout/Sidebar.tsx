'use client'

import { useProjectStore, useUIStore } from '@/lib/store/useAppStore'
import Link from 'next/link'
import { useState } from 'react'

export default function Sidebar() {
  const { projects, filter, setFilter, currentProject } = useProjectStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const filteredProjects = projects.filter((p) => {
    if (filter === 'starred') return p.stars > 0
    if (filter === 'shared') return p.members.length > 1
    return true
  })

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-4 z-50 rounded bg-blue-600 p-2 text-white"
      >
        Menu
      </button>
    )
  }

  return (
    <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">ZenCode</h1>
        <button
          onClick={toggleSidebar}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {/* Filter buttons */}
        <div className="mb-6 space-y-2">
          <button
            onClick={() => setFilter('all')}
            className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            All Projects
          </button>
          <button
            onClick={() => setFilter('owned')}
            className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition ${
              filter === 'owned'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            My Projects
          </button>
          <button
            onClick={() => setFilter('shared')}
            className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition ${
              filter === 'shared'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            Shared
          </button>
          <button
            onClick={() => setFilter('starred')}
            className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition ${
              filter === 'starred'
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            Starred
          </button>
        </div>

        {/* Projects list */}
        <div className="space-y-1">
          <h2 className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Projects
          </h2>
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              href={`/project/${project._id}`}
              className={`block rounded px-3 py-2 text-sm transition ${
                currentProject?._id === project._id
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className="truncate font-medium">{project.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{project.language}</div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <Link
          href="/settings"
          className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Settings
        </Link>
      </div>
    </aside>
  )
}
