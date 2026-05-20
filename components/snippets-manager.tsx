"use client"

import { useState, useCallback } from "react"
import { Search, Plus, Trash2, Copy, Edit, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Snippet {
  id: string
  name: string
  language: string
  prefix: string
  body: string
  description: string
  scope?: string[]
}

const defaultSnippets: Snippet[] = [
  {
    id: "1",
    name: "React Functional Component",
    language: "typescript",
    prefix: "rfc",
    body: "import React from 'react'\n\ninterface Props {}\n\nexport const $1: React.FC<Props> = () => {\n  return <div>$2</div>\n}",
    description: "Create a new React functional component",
  },
  {
    id: "2",
    name: "useEffect Hook",
    language: "typescript",
    prefix: "ueff",
    body: "React.useEffect(() => {\n  $1\n}, [$2])",
    description: "Insert useEffect hook",
  },
  {
    id: "3",
    name: "useState Hook",
    language: "typescript",
    prefix: "ust",
    body: "const [$1, set$2] = React.useState<$3>(initialValue)",
    description: "Insert useState hook",
  },
  {
    id: "4",
    name: "Async Function",
    language: "typescript",
    prefix: "afn",
    body: "async function $1($2): Promise<$3> {\n  try {\n    $4\n  } catch (error) {\n    console.error(error)\n  }\n}",
    description: "Create an async function with error handling",
  },
  {
    id: "5",
    name: "Try Catch",
    language: "javascript",
    prefix: "tc",
    body: "try {\n  $1\n} catch (error) {\n  console.error(error)\n  $2\n}",
    description: "Insert try-catch block",
  },
  {
    id: "6",
    name: "Class Declaration",
    language: "typescript",
    prefix: "cls",
    body: "class $1 {\n  constructor($2) {\n    $3\n  }\n\n  $4() {\n    $5\n  }\n}",
    description: "Create a new class",
  },
  {
    id: "7",
    name: "Arrow Function",
    language: "javascript",
    prefix: "af",
    body: "const $1 = ($2) => {\n  $3\n}",
    description: "Create an arrow function",
  },
  {
    id: "8",
    name: "Console Log",
    language: "javascript",
    prefix: "log",
    body: "console.log($1)",
    description: "Insert console.log statement",
  },
]

export function SnippetsManager() {
  const [snippets, setSnippets] = useState<Snippet[]>(defaultSnippets)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [newSnippet, setNewSnippet] = useState<Partial<Snippet>>({
    language: "javascript",
    scope: [],
  })

  const languages = ["all", "javascript", "typescript", "python", "java", "css", "html"]

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.prefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage
    return matchesSearch && matchesLanguage
  })

  const handleAddSnippet = useCallback(() => {
    if (!newSnippet.name || !newSnippet.prefix || !newSnippet.body) {
      alert("Please fill in all required fields")
      return
    }

    if (editingSnippet) {
      setSnippets((prev) =>
        prev.map((s) => (s.id === editingSnippet.id ? { ...newSnippet as Snippet, id: editingSnippet.id } : s))
      )
      setEditingSnippet(null)
    } else {
      const snippet: Snippet = {
        id: Date.now().toString(),
        name: newSnippet.name || "",
        language: newSnippet.language || "javascript",
        prefix: newSnippet.prefix || "",
        body: newSnippet.body || "",
        description: newSnippet.description || "",
        scope: newSnippet.scope || [],
      }
      setSnippets((prev) => [...prev, snippet])
    }

    setNewSnippet({ language: "javascript" })
    setIsDialogOpen(false)
  }, [newSnippet, editingSnippet])

  const handleDeleteSnippet = useCallback((id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleEditSnippet = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet)
    setNewSnippet(snippet)
    setIsDialogOpen(true)
  }, [])

  const handleCopySnippet = useCallback((snippet: Snippet) => {
    const text = `Prefix: ${snippet.prefix}\n\n${snippet.body}`
    navigator.clipboard.writeText(text)
  }, [])

  const handleExportSnippets = useCallback(() => {
    const data = JSON.stringify(snippets, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "snippets.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [snippets])

  const handleImportSnippets = useCallback(async (file: File) => {
    const text = await file.text()
    try {
      const imported = JSON.parse(text)
      setSnippets((prev) => [...prev, ...imported])
    } catch (error) {
      alert("Failed to import snippets")
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4">Code Snippets</h2>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSnippet(null)
                  setNewSnippet({ language: "javascript" })
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSnippet ? "Edit Snippet" : "Create New Snippet"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={newSnippet.name || ""}
                    onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
                    placeholder="Snippet name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      value={newSnippet.language || ""}
                      onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
                    >
                      {languages.filter((l) => l !== "all").map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prefix</label>
                    <Input
                      value={newSnippet.prefix || ""}
                      onChange={(e) => setNewSnippet({ ...newSnippet, prefix: e.target.value })}
                      placeholder="rfc, ust, etc..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={newSnippet.description || ""}
                    onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                    placeholder="What does this snippet do?"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Body</label>
                  <textarea
                    value={newSnippet.body || ""}
                    onChange={(e) => setNewSnippet({ ...newSnippet, body: e.target.value })}
                    placeholder="Code body (use $1, $2 for tab stops)"
                    className="w-full h-32 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSnippet} className="gap-2">
                    <Check className="w-4 h-4" />
                    {editingSnippet ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <TabsList className="bg-gray-800">
            {languages.map((lang) => (
              <TabsTrigger key={lang} value={lang} className="capitalize">
                {lang}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {filteredSnippets.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No snippets found</p>
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{snippet.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {snippet.prefix}
                    </span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {snippet.language}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySnippet(snippet)}
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSnippet(snippet)}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSnippet(snippet.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">{snippet.description}</p>
              <pre className="bg-gray-900 rounded p-2 text-xs overflow-x-auto text-gray-300">
                {snippet.body}
              </pre>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-700">
        <Button variant="outline" size="sm" onClick={handleExportSnippets}>
          Export
        </Button>
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>Import</span>
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && handleImportSnippets(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
