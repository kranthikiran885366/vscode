"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Symbol {
  id: string
  name: string
  kind: "class" | "function" | "property" | "method" | "interface" | "enum" | "constant"
  line: number
  column: number
  children?: Symbol[]
  expanded?: boolean
}

const mockSymbols: Symbol[] = [
  {
    id: "1",
    name: "App",
    kind: "class",
    line: 5,
    column: 0,
    children: [
      {
        id: "1.1",
        name: "constructor",
        kind: "method",
        line: 7,
        column: 2,
      },
      {
        id: "1.2",
        name: "render",
        kind: "method",
        line: 15,
        column: 2,
      },
      {
        id: "1.3",
        name: "handleClick",
        kind: "method",
        line: 22,
        column: 2,
      },
    ],
  },
  {
    id: "2",
    name: "Button",
    kind: "function",
    line: 35,
    column: 0,
  },
  {
    id: "3",
    name: "utils",
    kind: "interface",
    line: 45,
    column: 0,
    children: [
      {
        id: "3.1",
        name: "format",
        kind: "method",
        line: 47,
        column: 2,
      },
      {
        id: "3.2",
        name: "parse",
        kind: "method",
        line: 52,
        column: 2,
      },
    ],
  },
  {
    id: "4",
    name: "CONSTANTS",
    kind: "constant",
    line: 60,
    column: 0,
  },
]

function SymbolIcon({ kind }: { kind: Symbol["kind"] }) {
  const icons: Record<Symbol["kind"], string> = {
    class: "◈",
    function: "ƒ",
    property: "⊲",
    method: "m",
    interface: "⬜",
    enum: "🔶",
    constant: "𝐶",
  }
  return <span className="text-sm">{icons[kind]}</span>
}

interface SymbolNodeProps {
  symbol: Symbol
  onSelect: (symbol: Symbol) => void
  level: number
}

function SymbolNode({ symbol, onSelect, level }: SymbolNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = symbol.children && symbol.children.length > 0

  return (
    <>
      <button
        onClick={() => onSelect(symbol)}
        className="w-full text-left p-2 hover:bg-gray-800/50 rounded transition flex items-center gap-2"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-0 w-4 flex items-center justify-center"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        <SymbolIcon kind={symbol.kind} />
        <span className="text-sm flex-1 truncate">{symbol.name}</span>
        <span className="text-xs text-gray-500">:{symbol.line}</span>
      </button>

      {hasChildren && expanded && (
        <div>
          {symbol.children!.map((child) => (
            <SymbolNode
              key={child.id}
              symbol={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  )
}

export function OutlineNavigator() {
  const [symbols, setSymbols] = useState<Symbol[]>(mockSymbols)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null)
  const [sortBy, setSortBy] = useState<"position" | "alphabetical">("position")

  const filteredSymbols = symbols.filter((symbol) => {
    const search = searchQuery.toLowerCase()
    const matches = (sym: Symbol): boolean => {
      if (sym.name.toLowerCase().includes(search)) return true
      if (sym.children) {
        return sym.children.some(matches)
      }
      return false
    }
    return matches(symbol)
  })

  const sortedSymbols =
    sortBy === "alphabetical"
      ? [...filteredSymbols].sort((a, b) => a.name.localeCompare(b.name))
      : filteredSymbols

  const handleSelectSymbol = (symbol: Symbol) => {
    setSelectedSymbol(symbol)
    // Trigger navigation in editor
  }

  const symbolCount = {
    class: symbols.filter((s) => s.kind === "class").length,
    function: symbols.filter((s) => s.kind === "function").length,
    property: symbols.filter((s) => s.kind === "property").length,
    method: symbols.filter((s) => s.kind === "method").length,
    interface: symbols.filter((s) => s.kind === "interface").length,
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-3 space-y-2">
        <h2 className="text-sm font-semibold">OUTLINE</h2>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === "position" ? "alphabetical" : "position")}
            title={`Sort by ${sortBy === "position" ? "alphabetical" : "position"}`}
          >
            {sortBy === "position" ? "A→Z" : "↓"}
          </Button>
        </div>

        {/* Symbol Statistics */}
        <div className="text-xs text-gray-400 space-y-1 bg-gray-900/50 p-2 rounded">
          <div className="flex justify-between">
            <span>Classes</span>
            <span className="text-blue-300">{symbolCount.class}</span>
          </div>
          <div className="flex justify-between">
            <span>Functions</span>
            <span className="text-yellow-300">{symbolCount.function}</span>
          </div>
          <div className="flex justify-between">
            <span>Methods</span>
            <span className="text-green-300">{symbolCount.method}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {sortedSymbols.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            <p>{searchQuery ? "No symbols found" : "No symbols in file"}</p>
          </div>
        ) : (
          <div className="py-2">
            {sortedSymbols.map((symbol) => (
              <SymbolNode
                key={symbol.id}
                symbol={symbol}
                onSelect={handleSelectSymbol}
                level={0}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSymbol && (
        <div className="bg-gray-800 border-t border-gray-700 p-3 text-xs">
          <div className="text-gray-400">Selected:</div>
          <div className="font-mono text-blue-300 truncate">{selectedSymbol.name}</div>
          <div className="text-gray-500">
            Line {selectedSymbol.line}:{selectedSymbol.column}
          </div>
        </div>
      )}
    </div>
  )
}
