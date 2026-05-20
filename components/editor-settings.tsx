'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, Save } from 'lucide-react'

export interface EditorSettings {
  fontSize: number
  tabSize: number
  useTabs: boolean
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  bracketPairs: boolean
  renderWhitespace: 'none' | 'boundary' | 'all'
  theme: 'light' | 'dark' | 'auto'
  fontFamily: string
  autoSave: boolean
  autoSaveDelay: number
  formatOnSave: boolean
}

interface EditorSettingsProps {
  settings: EditorSettings
  onSave: (settings: EditorSettings) => void
  onClose: () => void
}

export function EditorSettingsPanel({ settings, onSave, onClose }: EditorSettingsProps) {
  const [formSettings, setFormSettings] = useState<EditorSettings>(settings)

  const handleChange = (key: keyof EditorSettings, value: any) => {
    setFormSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    onSave(formSettings)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-96 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Editor Settings</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <Input
              type="number"
              min="8"
              max="32"
              value={formSettings.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          {/* Tab Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Tab Size</label>
            <Input
              type="number"
              min="1"
              max="8"
              value={formSettings.tabSize}
              onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <Input
              type="text"
              value={formSettings.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              placeholder="Monaco, Menlo, Courier New..."
              className="bg-gray-700 border-gray-600"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={formSettings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.useTabs}
                onChange={(e) => handleChange('useTabs', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Use Tabs</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.wordWrap}
                onChange={(e) => handleChange('wordWrap', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Word Wrap</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.minimap}
                onChange={(e) => handleChange('minimap', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Show Minimap</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.lineNumbers}
                onChange={(e) => handleChange('lineNumbers', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Line Numbers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.bracketPairs}
                onChange={(e) => handleChange('bracketPairs', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Bracket Pair Colorization</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto Save</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.formatOnSave}
                onChange={(e) => handleChange('formatOnSave', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Format on Save</span>
            </label>
          </div>

          {/* Auto Save Delay */}
          <div>
            <label className="block text-sm font-medium mb-2">Auto Save Delay (ms)</label>
            <Input
              type="number"
              min="500"
              max="10000"
              step="500"
              value={formSettings.autoSaveDelay}
              onChange={(e) => handleChange('autoSaveDelay', parseInt(e.target.value))}
              className="bg-gray-700 border-gray-600"
              disabled={!formSettings.autoSave}
            />
          </div>

          {/* Whitespace Rendering */}
          <div>
            <label className="block text-sm font-medium mb-2">Render Whitespace</label>
            <select
              value={formSettings.renderWhitespace}
              onChange={(e) => handleChange('renderWhitespace', e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="none">None</option>
              <option value="boundary">Boundary</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
          <Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
