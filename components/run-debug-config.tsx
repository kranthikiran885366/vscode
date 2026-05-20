"use client"

import { useState } from "react"
import {
  Play,
  Trash2,
  Edit,
  Plus,
  ChevronDown,
  Settings,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RunConfig {
  id: string
  name: string
  type: "node" | "python" | "npm" | "custom"
  program: string
  args: string
  cwd: string
  env: Record<string, string>
  isActive: boolean
}

const defaultConfigs: RunConfig[] = [
  {
    id: "1",
    name: "Node: Debug",
    type: "node",
    program: "node",
    args: "--inspect-brk index.js",
    cwd: "${workspaceFolder}",
    env: { NODE_ENV: "development" },
    isActive: true,
  },
  {
    id: "2",
    name: "npm: start",
    type: "npm",
    program: "npm",
    args: "start",
    cwd: "${workspaceFolder}",
    env: {},
    isActive: false,
  },
  {
    id: "3",
    name: "npm: test",
    type: "npm",
    program: "npm",
    args: "test",
    cwd: "${workspaceFolder}",
    env: { NODE_ENV: "test" },
    isActive: false,
  },
]

export function RunDebugConfig() {
  const [configs, setConfigs] = useState<RunConfig[]>(defaultConfigs)
  const [selectedConfig, setSelectedConfig] = useState<RunConfig | null>(defaultConfigs[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<RunConfig | null>(null)
  const [newConfig, setNewConfig] = useState<Partial<RunConfig>>({
    type: "node",
    env: {},
  })

  const handleCreateConfig = () => {
    if (!newConfig.name || !newConfig.program) {
      alert("Please fill in required fields")
      return
    }

    if (editingConfig) {
      setConfigs((prev) =>
        prev.map((c) =>
          c.id === editingConfig.id
            ? { ...newConfig as RunConfig, id: editingConfig.id }
            : c
        )
      )
      setEditingConfig(null)
    } else {
      const config: RunConfig = {
        id: Date.now().toString(),
        name: newConfig.name || "",
        type: (newConfig.type as any) || "node",
        program: newConfig.program || "",
        args: newConfig.args || "",
        cwd: newConfig.cwd || "${workspaceFolder}",
        env: newConfig.env || {},
        isActive: false,
      }
      setConfigs((prev) => [...prev, config])
    }

    setNewConfig({ type: "node" })
    setIsDialogOpen(false)
  }

  const handleEditConfig = (config: RunConfig) => {
    setEditingConfig(config)
    setNewConfig(config)
    setIsDialogOpen(true)
  }

  const handleDeleteConfig = (id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id))
  }

  const handleRunConfig = (config: RunConfig) => {
    setConfigs((prev) =>
      prev.map((c) => ({
        ...c,
        isActive: c.id === config.id,
      }))
    )
    setSelectedConfig(config)
  }

  const handleAddEnvVar = (key: string, value: string) => {
    setNewConfig((prev) => ({
      ...prev,
      env: {
        ...(prev.env || {}),
        [key]: value,
      },
    }))
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Run & Debug Configurations
      </h2>

      <div className="space-y-3 mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingConfig(null)
                setNewConfig({ type: "node", env: {} })
              }}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? "Edit Configuration" : "Create Configuration"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={newConfig.name || ""}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="My Configuration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newConfig.type || ""}
                    onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value as any })}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded"
                  >
                    <option value="node">Node.js</option>
                    <option value="npm">NPM</option>
                    <option value="python">Python</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Program</label>
                  <Input
                    value={newConfig.program || ""}
                    onChange={(e) => setNewConfig({ ...newConfig, program: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="node, npm, python, etc"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Arguments</label>
                <Input
                  value={newConfig.args || ""}
                  onChange={(e) => setNewConfig({ ...newConfig, args: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="--flag1 value1 --flag2 value2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Working Directory</label>
                <Input
                  value={newConfig.cwd || ""}
                  onChange={(e) => setNewConfig({ ...newConfig, cwd: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="${workspaceFolder}"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConfig} className="gap-2">
                  <Check className="w-4 h-4" />
                  {editingConfig ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {configs.map((config) => (
          <div
            key={config.id}
            className={`p-3 rounded border transition cursor-pointer ${
              config.isActive
                ? "bg-green-600/10 border-green-700"
                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
            }`}
            onClick={() => handleRunConfig(config)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Play className={`w-4 h-4 ${config.isActive ? "text-green-400" : "text-gray-400"}`} />
                <div>
                  <h3 className="font-semibold">{config.name}</h3>
                  <div className="text-xs text-gray-400 mt-1">
                    <span className="bg-gray-700 px-2 py-1 rounded">{config.type}</span>
                    <span className="ml-2 text-gray-500">{config.program}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditConfig(config)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteConfig(config.id)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>

            {config.args && (
              <div className="text-xs text-gray-400 ml-6 font-mono">
                {config.args}
              </div>
            )}

            {config.isActive && Object.keys(config.env).length > 0 && (
              <div className="text-xs text-gray-400 ml-6 mt-2">
                Environment:
                {Object.entries(config.env).map(([key, value]) => (
                  <div key={key} className="text-gray-500">
                    {key}={value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedConfig && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
          <div className="text-sm font-semibold">Selected Configuration</div>
          <Button className="w-full gap-2">
            <Play className="w-4 h-4" />
            Run: {selectedConfig.name}
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <Play className="w-4 h-4" />
            Debug: {selectedConfig.name}
          </Button>
        </div>
      )}
    </div>
  )
}
