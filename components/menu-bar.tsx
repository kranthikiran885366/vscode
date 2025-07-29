"use client"

import { useState } from "react"
import {
  Menu,
  Search,
  Settings,
  User,
  Command,
  FileText,
  Edit,
  Eye,
  Play,
  Terminal,
  HelpCircle,
  Folder,
  Save,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor } from "../lib/editor-context"

interface MenuBarProps {
  onCommandPalette: () => void
  onQuickOpen: () => void
}

export function MenuBar({ onCommandPalette, onQuickOpen }: MenuBarProps) {
  const { state, dispatch } = useEditor()
  const [quickOpenQuery, setQuickOpenQuery] = useState("")

  const menuItems = [
    {
      label: "File",
      icon: FileText,
      items: [
        { label: "New File", shortcut: "⌘N", action: () => {} },
        { label: "New Window", shortcut: "⌘⇧N", action: () => {} },
        { label: "Open File...", shortcut: "⌘O", action: () => {} },
        { label: "Open Folder...", shortcut: "⌘K ⌘O", action: () => {} },
        { label: "Open Workspace...", action: () => {} },
        {
          label: "Open Recent",
          submenu: [{ label: "Reopen Closed Editor", shortcut: "⌘⇧T" }, { label: "Clear Recently Opened" }],
        },
        "separator",
        { label: "Save", shortcut: "⌘S", action: () => {} },
        { label: "Save As...", shortcut: "⌘⇧S", action: () => {} },
        { label: "Save All", shortcut: "⌘K S", action: () => {} },
        "separator",
        { label: "Auto Save", toggle: true, checked: state.autoSave },
        "separator",
        { label: "Close Editor", shortcut: "⌘W", action: () => {} },
        { label: "Close Folder", shortcut: "⌘K F", action: () => {} },
        { label: "Close Window", shortcut: "⌘⇧W", action: () => {} },
      ],
    },
    {
      label: "Edit",
      icon: Edit,
      items: [
        { label: "Undo", shortcut: "⌘Z", action: () => {} },
        { label: "Redo", shortcut: "⌘⇧Z", action: () => {} },
        "separator",
        { label: "Cut", shortcut: "⌘X", action: () => {} },
        { label: "Copy", shortcut: "⌘C", action: () => {} },
        { label: "Paste", shortcut: "⌘V", action: () => {} },
        "separator",
        { label: "Find", shortcut: "⌘F", action: () => {} },
        { label: "Replace", shortcut: "⌘⌥F", action: () => {} },
        { label: "Find in Files", shortcut: "⌘⇧F", action: () => {} },
        { label: "Replace in Files", shortcut: "⌘⇧H", action: () => {} },
      ],
    },
    {
      label: "Selection",
      items: [
        { label: "Select All", shortcut: "⌘A" },
        { label: "Expand Selection", shortcut: "⌃⇧⌘→" },
        { label: "Shrink Selection", shortcut: "⌃⇧⌘←" },
        "separator",
        { label: "Copy Line Up", shortcut: "⌥⇧↑" },
        { label: "Copy Line Down", shortcut: "⌥⇧↓" },
        { label: "Move Line Up", shortcut: "⌥↑" },
        { label: "Move Line Down", shortcut: "⌥↓" },
      ],
    },
    {
      label: "View",
      icon: Eye,
      items: [
        { label: "Command Palette...", shortcut: "⌘⇧P", action: onCommandPalette },
        { label: "Open View...", action: () => {} },
        "separator",
        {
          label: "Explorer",
          shortcut: "⌘⇧E",
          action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "explorer" }),
        },
        {
          label: "Search",
          shortcut: "⌘⇧F",
          action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "search" }),
        },
        {
          label: "Source Control",
          shortcut: "⌃⇧G",
          action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "git" }),
        },
        {
          label: "Debug",
          shortcut: "⌘⇧D",
          action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "debug" }),
        },
        {
          label: "Extensions",
          shortcut: "⌘⇧X",
          action: () => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "extensions" }),
        },
        "separator",
        {
          label: "Problems",
          shortcut: "⌘⇧M",
          action: () => dispatch({ type: "SET_ACTIVE_BOTTOM_PANEL", payload: "problems" }),
        },
        {
          label: "Output",
          shortcut: "⌘⇧U",
          action: () => dispatch({ type: "SET_ACTIVE_BOTTOM_PANEL", payload: "output" }),
        },
        {
          label: "Terminal",
          shortcut: "⌃`",
          action: () => dispatch({ type: "SET_ACTIVE_BOTTOM_PANEL", payload: "terminal" }),
        },
        "separator",
        { label: "Word Wrap", shortcut: "⌥Z", toggle: true, checked: state.wordWrap },
        { label: "Minimap", toggle: true, checked: state.minimap },
      ],
    },
    {
      label: "Go",
      items: [
        { label: "Go to File...", shortcut: "⌘P", action: onQuickOpen },
        { label: "Go to Symbol in Workspace...", shortcut: "⌘T" },
        { label: "Go to Symbol in Editor...", shortcut: "⌘⇧O" },
        { label: "Go to Definition", shortcut: "F12" },
        { label: "Go to Line/Column...", shortcut: "⌃G" },
        "separator",
        { label: "Go Back", shortcut: "⌃-" },
        { label: "Go Forward", shortcut: "⌃⇧-" },
      ],
    },
    {
      label: "Run",
      icon: Play,
      items: [
        { label: "Start Debugging", shortcut: "F5" },
        { label: "Run Without Debugging", shortcut: "⌃F5" },
        { label: "Stop Debugging", shortcut: "⇧F5" },
        { label: "Restart Debugging", shortcut: "⌘⇧F5" },
        "separator",
        { label: "Toggle Breakpoint", shortcut: "F9" },
        {
          label: "New Breakpoint",
          submenu: [
            { label: "Conditional Breakpoint..." },
            { label: "Inline Breakpoint", shortcut: "⇧F9" },
            { label: "Function Breakpoint..." },
            { label: "Logpoint..." },
          ],
        },
      ],
    },
    {
      label: "Terminal",
      icon: Terminal,
      items: [
        { label: "New Terminal", shortcut: "⌃⇧`" },
        { label: "Split Terminal", shortcut: "⌃⇧5" },
        { label: "Kill Terminal", action: () => {} },
        "separator",
        { label: "Run Task...", shortcut: "⌘⇧P" },
        { label: "Run Build Task...", shortcut: "⌘⇧B" },
        { label: "Run Active File", action: () => {} },
      ],
    },
    {
      label: "Help",
      icon: HelpCircle,
      items: [
        { label: "Welcome" },
        { label: "Show All Commands", shortcut: "⌘⇧P" },
        { label: "Documentation" },
        { label: "Show Release Notes" },
        "separator",
        { label: "Keyboard Shortcuts Reference", shortcut: "⌘K ⌘R" },
        { label: "Video Tutorials" },
        { label: "Tips and Tricks" },
        "separator",
        { label: "Join Us on Twitter" },
        { label: "Search Feature Requests" },
        { label: "Report Issue" },
        "separator",
        { label: "View License" },
        { label: "Privacy Statement" },
        { label: "About" },
      ],
    },
  ]

  const renderMenuItem = (item: any, index: number) => {
    if (item === "separator") {
      return <DropdownMenuSeparator key={index} />
    }

    if (item.submenu) {
      return (
        <DropdownMenuSub key={item.label}>
          <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {item.submenu.map((subItem: any, subIndex: number) => renderMenuItem(subItem, subIndex))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )
    }

    return (
      <DropdownMenuItem key={item.label} onClick={item.action} className="flex items-center justify-between">
        <span>{item.label}</span>
        {item.shortcut && <kbd className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">{item.shortcut}</kbd>}
        {item.toggle && <div className={`w-2 h-2 rounded-full ${item.checked ? "bg-blue-500" : "bg-gray-300"}`} />}
      </DropdownMenuItem>
    )
  }

  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 text-sm select-none">
      {/* Left Section - Logo and Menus */}
      <div className="flex items-center space-x-1">
        {/* Logo */}
        <div className="flex items-center space-x-2 mr-4">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">VS</span>
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300 hidden md:block">Visual Studio Code</span>
        </div>

        {/* Menu Items */}
        <div className="hidden lg:flex items-center space-x-1">
          {menuItems.map((menu) => (
            <DropdownMenu key={menu.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  {menu.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {menu.items.map((item, index) => renderMenuItem(item, index))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {menuItems.map((menu) => (
                <DropdownMenuItem key={menu.label}>
                  {menu.icon && <menu.icon className="w-4 h-4 mr-2" />}
                  {menu.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Center Section - Quick Open */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Go to File (⌘P)"
            value={quickOpenQuery}
            onChange={(e) => setQuickOpenQuery(e.target.value)}
            onFocus={onQuickOpen}
            className="h-6 pl-7 pr-8 text-xs bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
          <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-1 rounded">
            ⌘P
          </kbd>
        </div>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-1">
        {/* Command Palette */}
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onCommandPalette} title="Command Palette (⌘⇧P)">
          <Command className="w-3 h-3" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={() => dispatch({ type: "SET_THEME", payload: state.theme === "dark" ? "light" : "dark" })}
          title="Toggle Theme"
        >
          {state.theme === "dark" ? "🌙" : "☀️"}
        </Button>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Settings className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => dispatch({ type: "SET_ACTIVE_LEFT_PANEL", payload: "settings" })}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Zap className="w-4 h-4 mr-2" />
              Extensions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Folder className="w-4 h-4 mr-2" />
              Open Folder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Save className="w-4 h-4 mr-2" />
              Save Workspace As...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <User className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Sign In
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sync Settings</DropdownMenuItem>
            <DropdownMenuItem>Backup and Sync Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
