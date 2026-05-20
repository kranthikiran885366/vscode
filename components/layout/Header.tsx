'use client'

import { useAuthStore, useProjectStore } from '@/lib/store/useAppStore'
import Link from 'next/link'

export default function Header() {
  const { user, clearAuth } = useAuthStore()
  const { currentProject } = useProjectStore()

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {currentProject && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentProject.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentProject.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search projects..."
              className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={() => clearAuth()}
              className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
