"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor } from "../lib/editor-store"

export function TabBar() {
  const { state, dispatch } = useEditor()

  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto">
      {state.openTabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            h-full flex items-center px-3 text-sm cursor-pointer border-r border-gray-200 dark:border-gray-700 min-w-0 group
            ${state.activeTabId === tab.id 
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }
          `}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: tab.id })}
        >
          <span className="truncate mr-2">{tab.name}</span>
          {tab.isDirty && <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />}
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: "CLOSE_TAB", payload: tab.id })
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}