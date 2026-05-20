"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  Function,
  Variable,
  Class,
  Interface,
  Enum,
  Constant,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEditor } from "../lib/editor-store"

interface SymbolItem {
  id: string
  name: string
  kind: "class" | "function" | "variable" | "interface" | "enum" | "constant"
  line: number
  column: number
  children?: SymbolItem[]
}

interface SymbolCategory {
  name: string
  kind: string
  icon: any
  items: SymbolItem[]
}

export function SymbolNavigator() {
  const { state, dispatch } = useEditor()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSymbols, setExpandedSymbols] = useState<Set<string>>(
    new Set()
  )

  const [symbols] = useState<SymbolItem[]>([
    {
      id: "1",
      name: "App",
      kind: "class",
      line: 1,
      column: 0,
      children: [
        {
          id: "1-1",
          name: "constructor",
          kind: "function",
          line: 3,
          column: 2,
        },
        {
          id: "1-2",
          name: "render",
          kind: "function",
          line: 8,
          column: 2,
        },
        {
          id: "1-3",
          name: "state",
          kind: "variable",
          line: 2,
          column: 2,
        },
      ],
    },
    {
      id: "2",
      name: "handleClick",
      kind: "function",
      line: 25,
      column: 0,
    },
    {
      id: "3",
      name: "IUser",
      kind: "interface",
      line: 35,
      column: 0,
      children: [
        {
          id: "3-1",
          name: "id",
          kind: "variable",
          line: 36,
          column: 2,
        },
        {
          id: "3-2",
          name: "name",
          kind: "variable",
          line: 37,
          column: 2,
        },
        {
          id: "3-3",
          name: "email",
          kind: "variable",
          line: 38,
          column: 2,
        },
      ],
    },
    {
      id: "4",
      name: "DEFAULT_TIMEOUT",
      kind: "constant",
      line: 45,
      column: 0,
    },
    {
      id: "5",
      name: "Status",
      kind: "enum",
      line: 50,
      column: 0,
      children: [
        {
          id: "5-1",
          name: "PENDING",
          kind: "constant",
          line: 51,
          column: 2,
        },
        {
          id: "5-2",
          name: "SUCCESS",
          kind: "constant",
          line: 52,
          column: 2,
        },
        {
          id: "5-3",
          name: "ERROR",
          kind: "constant",
          line: 53,
          column: 2,
        },
      ],
    },
  ])

  const getSymbolIcon = (kind: SymbolItem["kind"]) => {
    switch (kind) {
      case "class":
        return <Class className="w-4 h-4 text-orange-500" />
      case "function":
        return <Function className="w-4 h-4 text-yellow-500" />
      case "variable":
        return <Variable className="w-4 h-4 text-blue-500" />
      case "interface":
        return <Interface className="w-4 h-4 text-purple-500" />
      case "enum":
        return <Enum className="w-4 h-4 text-pink-500" />
      case "constant":
        return <Constant className="w-4 h-4 text-green-500" />
      default:
        return <Variable className="w-4 h-4" />
    }
  }

  const filteredSymbols = useMemo(() => {
    if (!searchQuery) return symbols

    const search = searchQuery.toLowerCase()
    const filterSymbol = (symbol: SymbolItem): SymbolItem | null => {
      const matches = symbol.name.toLowerCase().includes(search)
      const children = symbol.children
        ?.map((child) => filterSymbol(child))
        .filter((child) => child !== null) as SymbolItem[] | undefined

      if (matches || (children && children.length > 0)) {
        return {
          ...symbol,
          children: children && children.length > 0 ? children : undefined,
        }
      }

      return null
    }

    return symbols
      .map((symbol) => filterSymbol(symbol))
      .filter((symbol) => symbol !== null) as SymbolItem[]
  }, [symbols, searchQuery])

  const toggleSymbol = (id: string) => {
    setExpandedSymbols((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const renderSymbol = (symbol: SymbolItem, depth = 0) => {
    const hasChildren = symbol.children && symbol.children.length > 0
    const isExpanded = expandedSymbols.has(symbol.id)

    return (
      <div key={symbol.id}>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 cursor-pointer text-sm"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => hasChildren && toggleSymbol(symbol.id)}
        >
          {hasChildren && (
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {!hasChildren && <span className="w-4" />}

          {getSymbolIcon(symbol.kind)}

          <span className="text-gray-300 truncate">{symbol.name}</span>
          <span className="ml-auto text-gray-600 text-xs">{symbol.line}</span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {symbol.children?.map((child) => renderSymbol(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const categories: SymbolCategory[] = [
    {
      name: "Classes",
      kind: "class",
      icon: Class,
      items: filteredSymbols.filter((s) => s.kind === "class"),
    },
    {
      name: "Functions",
      kind: "function",
      icon: Function,
      items: filteredSymbols.filter((s) => s.kind === "function"),
    },
    {
      name: "Interfaces",
      kind: "interface",
      icon: Interface,
      items: filteredSymbols.filter((s) => s.kind === "interface"),
    },
    {
      name: "Enums",
      kind: "enum",
      icon: Enum,
      items: filteredSymbols.filter((s) => s.kind === "enum"),
    },
    {
      name: "Constants",
      kind: "constant",
      icon: Constant,
      items: filteredSymbols.filter((s) => s.kind === "constant"),
    },
  ]

  const visibleCategories = categories.filter((cat) => cat.items.length > 0)

  return (
    <div className="h-full bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm font-semibold">Outline</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" })}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {/* Symbols List */}
      <div className="flex-1 overflow-auto">
        {visibleCategories.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p className="text-sm">No symbols found</p>
          </div>
        ) : (
          <div>
            {visibleCategories.map((category) => (
              <div key={category.kind} className="divide-y divide-gray-800">
                <div className="sticky top-0 bg-gray-800 z-10">
                  <button className="w-full px-4 py-2 hover:bg-gray-700 flex items-center gap-2 text-sm font-semibold">
                    <ChevronDown className="w-4 h-4" />
                    {category.icon && <category.icon className="w-4 h-4" />}
                    <span>{category.name}</span>
                    <span className="ml-auto text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                      {category.items.length}
                    </span>
                  </button>
                </div>
                {category.items.map((symbol) => renderSymbol(symbol))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
