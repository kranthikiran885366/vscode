"use client"

import { useState, useEffect } from "react"
import { Eye, Code2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarkdownPreviewProps {
  content: string
  filename?: string
}

export function MarkdownPreview({ content, filename }: MarkdownPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"preview" | "split" | "source">("split")
  const [html, setHtml] = useState("")

  useEffect(() => {
    // Simple markdown to HTML conversion
    let markdown = content
    
    // Headers
    markdown = markdown.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    markdown = markdown.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    markdown = markdown.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    
    // Bold and italic
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    markdown = markdown.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    markdown = markdown.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')
    markdown = markdown.replace(/_(.*?)_/g, '<em class="italic">$1</em>')
    
    // Code blocks
    markdown = markdown.replace(/```(.*?)\n([\s\S]*?)```/g, 
      '<pre class="bg-gray-800 p-3 rounded my-2 overflow-x-auto"><code class="text-sm text-gray-300">$2</code></pre>')
    
    // Inline code
    markdown = markdown.replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-sm">$1</code>')
    
    // Lists
    markdown = markdown.replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
    markdown = markdown.replace(/^\- (.*?)$/gm, '<li class="ml-4">$1</li>')
    markdown = markdown.replace(/(<li.*?<\/li>)/s, '<ul class="list-disc my-2">$1</ul>')
    
    // Links
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 hover:underline">$1</a>')
    
    // Blockquotes
    markdown = markdown.replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-blue-400 pl-4 italic text-gray-400">$1</blockquote>')
    
    // Horizontal line
    markdown = markdown.replace(/^---$/gm, '<hr class="my-4 border-gray-700">')
    
    // Line breaks
    markdown = markdown.replace(/\n\n/g, '</p><p class="my-2">')
    markdown = `<p class="my-2">${markdown}</p>`
    
    setHtml(markdown)
  }, [content])

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {filename || "Markdown Preview"}
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode === "source" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode("source")}
            title="Source"
          >
            <Code2 className="w-4 h-4" />
          </Button>
          <Button
            variant={previewMode === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode("split")}
            title="Split"
          >
            ⊡
          </Button>
          <Button
            variant={previewMode === "preview" ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode("preview")}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            title="Copy"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Source */}
        {(previewMode === "source" || previewMode === "split") && (
          <div className={`${previewMode === "split" ? "w-1/2" : "w-full"} overflow-auto border-r border-gray-700`}>
            <pre className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words">
              {content}
            </pre>
          </div>
        )}

        {/* Preview */}
        {(previewMode === "preview" || previewMode === "split") && (
          <div className={`${previewMode === "split" ? "w-1/2" : "w-full"} overflow-auto p-6`}>
            <div
              className="prose prose-invert max-w-none text-gray-200"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <span>{content.split('\n').length} lines</span>
        <span className="ml-4">{content.length} characters</span>
      </div>
    </div>
  )
}
