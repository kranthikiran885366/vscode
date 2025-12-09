"use client"

import { useState } from "react"
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Plus,
  Trash2,
  Edit,
  GitPull,
  GitPush,
  Search,
  ChevronDown,
  Check,
  X,
} from "lucide-react"
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

interface GitBranch {
  id: string
  name: string
  isRemote: boolean
  isCurrentBranch: boolean
  lastCommit: string
  lastCommitDate: string
}

interface GitCommit {
  id: string
  hash: string
  message: string
  author: string
  date: string
  changes: number
}

interface StagedFile {
  id: string
  path: string
  status: "added" | "modified" | "deleted" | "renamed"
  staged: boolean
}

export function EnhancedGitPanel() {
  const [branches, setBranches] = useState<GitBranch[]>([
    {
      id: "1",
      name: "main",
      isRemote: false,
      isCurrentBranch: true,
      lastCommit: "feat: add editor features",
      lastCommitDate: "2 hours ago",
    },
    {
      id: "2",
      name: "develop",
      isRemote: false,
      isCurrentBranch: false,
      lastCommit: "fix: resolve compile issues",
      lastCommitDate: "1 day ago",
    },
    {
      id: "3",
      name: "origin/main",
      isRemote: true,
      isCurrentBranch: false,
      lastCommit: "chore: version bump",
      lastCommitDate: "3 days ago",
    },
  ])

  const [commits, setCommits] = useState<GitCommit[]>([
    {
      id: "1",
      hash: "a1b2c3d",
      message: "feat: add monaco editor integration",
      author: "Developer",
      date: "Today",
      changes: 45,
    },
    {
      id: "2",
      hash: "e4f5g6h",
      message: "fix: resolve breakpoint issues",
      author: "Developer",
      date: "Yesterday",
      changes: 12,
    },
    {
      id: "3",
      hash: "i7j8k9l",
      message: "docs: update readme",
      author: "Developer",
      date: "2 days ago",
      changes: 8,
    },
  ])

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([
    {
      id: "1",
      path: "src/components/Editor.tsx",
      status: "modified",
      staged: true,
    },
    {
      id: "2",
      path: "src/utils/helpers.ts",
      status: "modified",
      staged: false,
    },
    {
      id: "3",
      path: "src/types/editor.ts",
      status: "added",
      staged: false,
    },
  ])

  const [commitMessage, setCommitMessage] = useState("")
  const [commitDescription, setCommitDescription] = useState("")
  const [newBranchName, setNewBranchName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<GitBranch | null>(branches[0])
  const [selectedCommit, setSelectedCommit] = useState<GitCommit | null>(commits[0])

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return
    const newBranch: GitBranch = {
      id: Date.now().toString(),
      name: newBranchName,
      isRemote: false,
      isCurrentBranch: false,
      lastCommit: "Initial",
      lastCommitDate: "Just now",
    }
    setBranches((prev) => [...prev, newBranch])
    setNewBranchName("")
  }

  const handleSwitchBranch = (branch: GitBranch) => {
    setBranches((prev) =>
      prev.map((b) => ({
        ...b,
        isCurrentBranch: b.id === branch.id,
      }))
    )
    setSelectedBranch(branch)
  }

  const handleDeleteBranch = (id: string) => {
    if (branches.find((b) => b.id === id)?.isCurrentBranch) {
      alert("Cannot delete current branch")
      return
    }
    setBranches((prev) => prev.filter((b) => b.id !== id))
  }

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      alert("Please enter a commit message")
      return
    }

    const newCommit: GitCommit = {
      id: Date.now().toString(),
      hash: Math.random().toString(36).substring(7),
      message: commitMessage,
      author: "Developer",
      date: "Just now",
      changes: stagedFiles.filter((f) => f.staged).length,
    }
    setCommits((prev) => [newCommit, ...prev])
    setStagedFiles((prev) => prev.filter((f) => !f.staged))
    setCommitMessage("")
    setCommitDescription("")
  }

  const handleStageFile = (id: string) => {
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, staged: !f.staged } : f))
    )
  }

  const handleStageAll = () => {
    setStagedFiles((prev) => prev.map((f) => ({ ...f, staged: true })))
  }

  const handleUnstageAll = () => {
    setStagedFiles((prev) => prev.map((f) => ({ ...f, staged: false })))
  }

  const handleDiscardFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added":
        return "text-green-400"
      case "modified":
        return "text-blue-400"
      case "deleted":
        return "text-red-400"
      case "renamed":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "added":
        return "A"
      case "modified":
        return "M"
      case "deleted":
        return "D"
      case "renamed":
        return "R"
      default:
        return "?"
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <Tabs defaultValue="changes" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-gray-800 m-0 rounded-none border-b border-gray-700">
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="remote">Remote</TabsTrigger>
        </TabsList>

        {/* Changes Tab */}
        <TabsContent value="changes" className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="space-y-3 pb-3 border-b border-gray-700 mb-3">
            <div className="bg-gray-800/50 rounded p-3">
              <textarea
                placeholder="Message (required)"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm p-2 rounded mb-2"
              />
              <textarea
                placeholder="Extended description (optional)"
                value={commitDescription}
                onChange={(e) => setCommitDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm p-2 rounded mb-2 h-16"
              />
              <div className="flex gap-2">
                <Button onClick={handleCommit} className="flex-1 gap-2">
                  <GitCommit className="w-4 h-4" />
                  Commit
                </Button>
                <Button variant="outline" size="sm">
                  Amend
                </Button>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <Button variant="outline" size="sm" onClick={handleStageAll}>
                Stage All
              </Button>
              <Button variant="outline" size="sm" onClick={handleUnstageAll}>
                Unstage All
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {stagedFiles.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No changes</p>
              </div>
            ) : (
              stagedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-2 rounded text-sm flex items-center justify-between group ${
                    file.staged
                      ? "bg-green-500/10 border border-green-700"
                      : "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={file.staged}
                      onChange={() => handleStageFile(file.id)}
                      className="w-4 h-4"
                    />
                    <span className={`text-xs font-semibold mr-2 ${getStatusColor(file.status)}`}>
                      {getStatusLabel(file.status)}
                    </span>
                    <span className="font-mono flex-1">{file.path}</span>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDiscardFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="New branch name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="flex-1 text-sm bg-gray-800 border-gray-700 text-white"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Branch name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleCreateBranch}>Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className={`p-3 rounded border transition cursor-pointer ${
                  branch.isCurrentBranch
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => !branch.isCurrentBranch && handleSwitchBranch(branch)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <span className="font-semibold">{branch.name}</span>
                      {branch.isRemote && (
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          remote
                        </span>
                      )}
                      {branch.isCurrentBranch && (
                        <span className="text-xs bg-blue-700 px-2 py-1 rounded">
                          current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 ml-6">
                      {branch.lastCommit} • {branch.lastCommitDate}
                    </div>
                  </div>
                  {!branch.isCurrentBranch && !branch.isRemote && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBranch(branch.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-auto p-3">
          <div className="space-y-2">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className={`p-3 rounded border transition cursor-pointer ${
                  selectedCommit?.id === commit.id
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => setSelectedCommit(commit)}
              >
                <div className="flex items-start gap-3">
                  <GitCommit className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{commit.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-mono">{commit.hash}</span> by{" "}
                      <span>{commit.author}</span> • {commit.date}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {commit.changes} changes
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Remote Tab */}
        <TabsContent value="remote" className="flex-1 flex flex-col overflow-hidden p-3">
          <div className="space-y-3">
            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm font-semibold mb-3">Repository</div>
              <div className="text-xs text-gray-400 mb-3">
                origin: https://github.com/user/repo.git
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" size="sm">
                  <GitPull className="w-4 h-4" />
                  Pull
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <GitPush className="w-4 h-4" />
                  Push
                </Button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm font-semibold mb-2">Branches to Push</div>
              <div className="text-xs text-gray-400 mb-2">main</div>
            </div>

            <div className="bg-gray-800/50 rounded p-3">
              <div className="text-sm font-semibold mb-2">Sync Status</div>
              <div className="text-xs text-green-400">✓ Up to date</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
