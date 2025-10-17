'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Wand2,
  MessageSquare,
  Copy,
  Check,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEditor, type ChatMessage } from '../lib/editor-store'

interface AIMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  code?: string
  suggestions?: string[]
}

export function AIAssistantEnhanced() {
  const { state, dispatch } = useEditor()
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI coding assistant. I can help you with code completion, generation, refactoring, and debugging. What would you like help with?',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          context: state.openTabs.find((tab) => tab.id === state.activeTabId)?.content,
          language: state.openTabs.find((tab) => tab.id === state.activeTabId)?.language,
        }),
      })

      const data = await response.json()

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response || 'I could not process your request.',
        timestamp: new Date(),
        suggestions: data.suggestions,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeCompletion = async () => {
    const currentFile = state.openTabs.find((tab) => tab.id === state.activeTabId)
    if (!currentFile) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
        }),
      })

      const data = await response.json()

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Here are some code completion suggestions:',
        timestamp: new Date(),
        suggestions: data.suggestions,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Completion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeGeneration = async () => {
    if (!inputMessage.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: inputMessage,
          language: state.openTabs.find((tab) => tab.id === state.activeTabId)?.language || 'javascript',
        }),
      })

      const data = await response.json()

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.explanation,
        timestamp: new Date(),
        code: data.code,
      }

      setMessages((prev) => [...prev, aiMessage])
      setInputMessage('')
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefactoring = async () => {
    const currentFile = state.openTabs.find((tab) => tab.id === state.activeTabId)
    if (!currentFile) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/refactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
        }),
      })

      const data = await response.json()

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Refactoring suggestions (Score: ${data.overallScore}/100):`,
        timestamp: new Date(),
        suggestions: data.suggestions?.map(
          (s: any) => `${s.title}: ${s.description} - ${s.suggestion}`
        ),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Refactoring error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-900 dark:text-white">ZenCode AI</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          Online
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>

                {message.code && (
                  <div className="mt-2 bg-gray-900 rounded p-2">
                    <pre className="text-xs text-green-400 overflow-x-auto">
                      {message.code}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-6 w-6 p-0 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(message.code!, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}

                {message.suggestions && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {message.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm opacity-90">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                )}

                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={handleCodeCompletion}
            disabled={isLoading}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={handleRefactoring}
            disabled={isLoading}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refactor
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={handleCodeGeneration}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Generate
          </Button>
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Input
          placeholder="Ask AI assistant..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          disabled={isLoading}
          className="text-xs h-8"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="w-full h-8 text-xs"
        >
          <Send className="w-3 h-3 mr-1" />
          Send
        </Button>
      </div>
    </div>
  )
}
