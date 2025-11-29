"use client"

import { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor } from "../lib/editor-store"

interface ZenModeProps {
  children: ReactNode
  isActive: boolean
}

export function ZenMode({ children, isActive }: ZenModeProps) {
  const { dispatch } = useEditor()

  if (!isActive) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      {/* Zen Mode Header - minimal */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-800 border-gray-700 text-gray-300 hover:text-white"
          onClick={() => dispatch({ type: "TOGGLE_ZEN_MODE" })}
          title="Exit Zen Mode (Ctrl+K Z)"
        >
          <X className="w-4 h-4 mr-1" />
          Exit Zen Mode
        </Button>
      </div>

      {/* Center the editor content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full flex flex-col max-w-7xl">
          {/* Hide everything except editor */}
          <style>{`
            .zen-mode-hidden {
              display: none !important;
            }
          `}</style>
          {children}
        </div>
      </div>

      {/* Minimal info footer */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-600">
        Zen Mode - Press Ctrl+K Z to exit
      </div>
    </div>
  )
}
