"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface MonacoEditorProps {
  value: string
  language: string
  theme: "vs-dark" | "vs-light"
  onChange: (value: string) => void
  onSave?: () => void
}

export function MonacoEditor({ value, language, theme, onChange, onSave }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // Configure Monaco Editor
      monaco.editor.defineTheme("vs-code-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.foreground": "#d4d4d4",
          "editorLineNumber.foreground": "#858585",
          "editor.selectionBackground": "#264f78",
          "editor.inactiveSelectionBackground": "#3a3d41",
        },
      })

      monacoRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: theme === "vs-dark" ? "vs-code-dark" : "vs-light",
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
      })

      // Handle content changes
      monacoRef.current.onDidChangeModelContent(() => {
        const newValue = monacoRef.current?.getValue() || ""
        onChange(newValue)
      })

      // Handle Ctrl+S for save
      monacoRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.()
      })
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (monacoRef.current) {
      const currentValue = monacoRef.current.getValue()
      if (currentValue !== value) {
        monacoRef.current.setValue(value)
      }
    }
  }, [value])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(monacoRef.current.getModel()!, language)
    }
  }, [language])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme === "vs-dark" ? "vs-code-dark" : "vs-light")
    }
  }, [theme])

  return <div ref={editorRef} className="w-full h-full" />
}
"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"
import { useEditor } from "../lib/editor-store"

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  theme?: "vs-dark" | "light"
}

export function MonacoEditor({ value, language, onChange, theme = "vs-dark" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Initialize Monaco editor
    monacoRef.current = monaco.editor.create(editorRef.current, {
      value,
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: "on",
      renderWhitespace: "selection",
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: "on",
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      snippetSuggestions: "top",
      renderLineHighlight: "all",
      selectOnLineNumbers: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    })

    // Listen for content changes
    const disposable = monacoRef.current.onDidChangeModelContent(() => {
      const newValue = monacoRef.current?.getValue() || ""
      onChange(newValue)
    })

    return () => {
      disposable.dispose()
      monacoRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(monacoRef.current.getModel()!, language)
    }
  }, [language])

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme)
    }
  }, [theme])

  return <div ref={editorRef} className="w-full h-full" />
}

// Configure Monaco languages and themes
if (typeof window !== "undefined") {
  // Register additional languages
  monaco.languages.register({ id: "python" })
  monaco.languages.register({ id: "java" })
  monaco.languages.register({ id: "cpp" })
  monaco.languages.register({ id: "go" })
  monaco.languages.register({ id: "rust" })

  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  })

  // Add React type definitions
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
    declare module "react" {
      export function useState<T>(initialState: T): [T, (value: T) => void];
      export function useEffect(effect: () => void, deps?: any[]): void;
      export function useRef<T>(initialValue: T): { current: T };
      export const Component: any;
      export const Fragment: any;
    }
    `,
    "react.d.ts"
  )
}
