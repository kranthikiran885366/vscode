"use client"

import { useState } from "react"
import { Search, Settings, User, Menu, Sun, Moon, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "../lib/theme-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppBarProps {
  onMenuClick: () => void
  onCommandPalette: () => void
}

export function AppBar({ onMenuClick, onCommandPalette }: AppBarProps) {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")

  const menuItems = [
    { label: "File", items: ["New File", "Open File", "Save", "Save As", "Close"] },
    { label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste", "Find", "Replace"] },
    { label: "View", items: ["Command Palette", "Explorer", "Search", "Source Control", "Terminal"] },
    { label: "Run", items: ["Start Debugging", "Run Without Debugging", "Stop", "Restart"] },
    { label: "Terminal", items: ["New Terminal", "Split Terminal", "Kill Terminal"] },
    { label: "Help", items: ["Welcome", "Documentation", "Keyboard Shortcuts", "About"] },
  ]

  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 text-sm select-none">
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onMenuClick}>
          <Menu className="w-3 h-3" />
        </Button>

        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Zet Code Studio</span>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center space-x-1 ml-4">
          {menuItems.map((menu) => (
            <DropdownMenu key={menu.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  {menu.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {menu.items.map((item, index) => (
                  <DropdownMenuItem key={item} className="text-xs">
                    {item}
                    {item === "Command Palette" && <span className="ml-auto text-xs text-gray-500">⌘⇧P</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search files (Ctrl+P)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={onCommandPalette}
            className="h-6 pl-7 pr-8 text-xs bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
          <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-1 rounded">
            ⌘P
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <User className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-xs">
              <Settings className="w-3 h-3 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Command className="w-3 h-3 mr-2" />
              Command Palette
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
