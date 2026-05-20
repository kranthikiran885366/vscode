'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
  onClick?: () => void
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center gap-1 text-sm text-gray-400 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3 h-3 text-gray-600" />}
          <button
            onClick={item.onClick}
            className="hover:text-gray-200 hover:bg-gray-700/50 px-2 py-1 rounded transition"
            disabled={!item.onClick}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  )
}

interface PathBreadcrumbProps {
  filePath: string
  onPathClick?: (path: string) => void
}

export function PathBreadcrumb({ filePath, onPathClick }: PathBreadcrumbProps) {
  const parts = filePath.split('/').filter(Boolean)

  const items: BreadcrumbItem[] = parts.map((part, index) => {
    const path = '/' + parts.slice(0, index + 1).join('/')
    return {
      label: part,
      path,
      onClick: onPathClick ? () => onPathClick(path) : undefined,
    }
  })

  return <BreadcrumbNav items={items} />
}

interface SymbolBreadcrumbProps {
  symbols: string[]
  onSymbolClick?: (symbol: string) => void
}

export function SymbolBreadcrumb({ symbols, onSymbolClick }: SymbolBreadcrumbProps) {
  const items: BreadcrumbItem[] = symbols.map((symbol) => ({
    label: symbol,
    onClick: onSymbolClick ? () => onSymbolClick(symbol) : undefined,
  }))

  return <BreadcrumbNav items={items} />
}
