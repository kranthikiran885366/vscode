"use client"

import { useState, useEffect } from "react"
import { Users, Share2, Copy, Check, Crown, Eye, Edit, UserPlus, Settings, Globe, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor, type User } from "../lib/editor-store"

export function CollaborationPanel() {
  const { state, dispatch } = useEditor()
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  useEffect(() => {
    if (state.shareLink) {
      setShareUrl(state.shareLink)
    } else {
      // Generate a mock share URL
      const mockUrl = `https://editor.dev/share/${Math.random().toString(36).substr(2, 9)}`
      setShareUrl(mockUrl)
      dispatch({ type: "SET_SHARE_LINK", payload: mockUrl })
    }
  }, [state.shareLink, dispatch])

  const handleStartCollaboration = () => {
    dispatch({ type: "SET_COLLABORATION", payload: true })

    // Add some mock collaborators
    setTimeout(() => {
      const mockCollaborators: User[] = [
        {
          id: "user-1",
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          cursor: { x: 100, y: 200, color: "#3b82f6" },
        },
        {
          id: "user-2",
          name: "Bob Smith",
          email: "bob@example.com",
          avatar: "/placeholder.svg?height=32&width=32",
          cursor: { x: 300, y: 150, color: "#10b981" },
        },
      ]

      mockCollaborators.forEach((user) => {
        dispatch({ type: "ADD_COLLABORATOR", payload: user })
      })
    }, 2000)
  }

  const handleStopCollaboration = () => {
    dispatch({ type: "SET_COLLABORATION", payload: false })
    state.collaborators.forEach((user) => {
      dispatch({ type: "REMOVE_COLLABORATOR", payload: user.id })
    })
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInviteUser = () => {
    if (inviteEmail.trim()) {
      // Simulate sending invitation
      console.log("Inviting user:", inviteEmail)
      setInviteEmail("")
    }
  }

  const getRoleIcon = (userId: string) => {
    if (userId === state.user?.id) return <Crown className="w-3 h-3 text-yellow-500" />
    return <Edit className="w-3 h-3 text-gray-400" />
  }

  const getRoleName = (userId: string) => {
    if (userId === state.user?.id) return "Owner"
    return "Editor"
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Live Share
          </span>
        </div>
        <Badge variant={state.isCollaborating ? "default" : "secondary"} className="text-xs">
          {state.isCollaborating ? "Live" : "Offline"}
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Collaboration Status */}
        {!state.isCollaborating ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <Share2 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium mb-2">Start Live Collaboration</h3>
              <p className="text-sm text-gray-500 mb-4">
                Share your workspace with others and code together in real-time
              </p>
              <Button onClick={handleStartCollaboration} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Start Live Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Share Link */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Share Link</span>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Public</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-xs" />
                <Button variant="outline" size="sm" onClick={copyShareLink} className="flex-shrink-0 bg-transparent">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Invite Users */}
            <div>
              <span className="text-sm font-medium mb-2 block">Invite by Email</span>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInviteUser()}
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                  className="flex-shrink-0 bg-transparent"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Active Collaborators */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Participants ({state.collaborators.length + (state.user ? 1 : 0)})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopCollaboration}
                  className="text-xs h-6 bg-transparent"
                >
                  Stop Session
                </Button>
              </div>

              <div className="space-y-2">
                {/* Current User */}
                {state.user && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={state.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {state.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{state.user.name} (You)</span>
                        {getRoleIcon(state.user.id)}
                      </div>
                      <span className="text-xs text-gray-500">{getRoleName(state.user.id)}</span>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                )}

                {/* Collaborators */}
                {state.collaborators.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        {getRoleIcon(user.id)}
                      </div>
                      <span className="text-xs text-gray-500">{getRoleName(user.id)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.cursor?.color || "#gray" }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Follow User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Remove User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <Separator />
            <div>
              <span className="text-sm font-medium mb-2 block">Session Settings</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Allow editing</span>
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <Edit className="w-3 h-3 mr-1" />
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Visibility</span>
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
