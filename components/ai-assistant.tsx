"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  TestTube,
  FileText,
  X,
  Copy,
  Check,
  Wand2,
  MessageSquare,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditor, type ChatMessage } from "../lib/editor-store"

export function AIAssistant() {
  const { state, dispatch } = useEditor()
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.chatMessages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      codeContext: state.openTabs.find((tab) => tab.id === state.activeTabId)?.content,
    }

    dispatch({ type: "ADD_CHAT_MESSAGE", payload: userMessage })
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
      }
      dispatch({ type: "ADD_CHAT_MESSAGE", payload: aiResponse })
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "I can help you with that! Here's what I suggest:\n\n```javascript\nconst solution = () => {\n  // Your optimized code here\n  return result;\n};\n```\n\nThis approach is more efficient because it reduces complexity.",
      "Great question! Let me break this down for you:\n\n1. First, consider the data structure\n2. Then optimize for performance\n3. Finally, add error handling\n\nWould you like me to show you a specific implementation?",
      "I notice you're working on a React component. Here are some best practices:\n\n```tsx\nconst MyComponent = ({ data }: Props) => {\n  const [state, setState] = useState(initialState);\n  \n  useEffect(() => {\n    // Side effects here\n  }, [dependencies]);\n  \n  return <div>{/* Your JSX */}</div>;\n};\n```",
      "This looks like a perfect use case for a custom hook! Here's how you could refactor it:\n\n```typescript\nconst useCustomLogic = () => {\n  // Extract your logic here\n  return { data, loading, error };\n};\n```",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleQuickAction = (action: string) => {
    const actions = {
      explain: "Can you explain this code and how it works?",
      refactor: "How can I refactor this code to make it better?",
      test: "Generate unit tests for this function",
      optimize: "How can I optimize this code for better performance?",
      debug: "Help me debug this code - what might be wrong?",
      document: "Generate documentation for this code",
    }

    setInputMessage(actions[action as keyof typeof actions] || "")
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(text)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === "user"
    const isCode = message.content.includes("```")

    return (
      <div key={message.id} className={`flex gap-3 p-4 ${isUser ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{isUser ? state.user?.name || "You" : "AI Assistant"}</span>
            <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isCode ? (
              <div className="space-y-2">
                {message.content.split("```").map((part, index) => {
                  if (index % 2 === 1) {
                    const [lang, ...codeLines] = part.split("\n")
                    const code = codeLines.join("\n").trim()
                    return (
                      <div key={index} className="relative">
                        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">{lang}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => copyToClipboard(code)}
                            >
                              {copiedCode === code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                          <pre className="text-sm text-gray-100 overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="whitespace-pre-wrap">
                      {part}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            AI Assistant
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => dispatch({ type: "TOGGLE_AI_CHAT" })}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: "explain", icon: MessageSquare, label: "Explain" },
            { id: "refactor", icon: Wand2, label: "Refactor" },
            { id: "test", icon: TestTube, label: "Test" },
            { id: "optimize", icon: Sparkles, label: "Optimize" },
            { id: "debug", icon: RefreshCw, label: "Debug" },
            { id: "document", icon: FileText, label: "Document" },
          ].map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs bg-transparent"
              onClick={() => handleQuickAction(action.id)}
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {state.chatMessages.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium mb-2">AI Assistant Ready</h3>
              <p className="text-sm text-gray-500 mb-4">
                Ask me anything about your code, or use the quick actions above!
              </p>
              <div className="space-y-2 text-xs text-gray-400">
                <div>• Explain complex code</div>
                <div>• Generate tests</div>
                <div>• Refactor and optimize</div>
                <div>• Debug issues</div>
              </div>
            </div>
          ) : (
            <>
              {state.chatMessages.map(renderMessage)}
              {isTyping && (
                <div className="flex gap-3 p-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">AI Assistant</span>
                      <Badge variant="secondary" className="text-xs">
                        Typing...
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask AI anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</div>
      </div>
    </div>
  )
}
