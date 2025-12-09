"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import * as monaco from "monaco-editor"
import { useEditor } from "@/lib/editor-store"

interface MonacoEditorProps {
  value: string
  language: string
  theme?: "vs-dark" | "vs-light" | "high-contrast"
  onChange?: (value: string) => void
  onSave?: () => void
  onFormat?: () => void
  readOnly?: boolean
  decorations?: monaco.editor.IModelDeltaDecoration[]
  highlightedLines?: number[]
}

export function MonacoEditor({
  value,
  language,
  theme = "vs-dark",
  onChange,
  onSave,
  onFormat,
  readOnly = false,
  decorations = [],
  highlightedLines = [],
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const { state } = useEditor()
  const [lineCount, setLineCount] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [selectedText, setSelectedText] = useState("")

  // Define custom themes
  useEffect(() => {
    monaco.editor.defineTheme("vs-code-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6" },
        { token: "string", foreground: "ce9178" },
        { token: "comment", foreground: "6a9955" },
        { token: "number", foreground: "b5cea8" },
        { token: "type", foreground: "4ec9b0" },
        { token: "function", foreground: "dcdcaa" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editor.lineNumbersBackground": "#1e1e1e",
        "editorLineNumber.foreground": "#858585",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editor.lineHighlightBackground": "#2d2d30",
        "editorCursor.foreground": "#aeafad",
        "editorWhitespace.foreground": "#3e3e42",
        "editorBracketMatch.background": "#0098000",
        "editorBracketMatch.border": "#888",
        "editor.foldBackground": "#3f3f46",
      },
    })

    monaco.editor.defineTheme("high-contrast", {
      base: "hc-black",
      inherit: true,
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#ffffff",
      },
    })
  }, [])

  // Initialize Monaco editor
  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: theme === "vs-dark" ? "vs-code-dark" : theme === "high-contrast" ? "high-contrast" : "vs-light",
        automaticLayout: true,
        minimap: {
          enabled: state.minimap,
          size: "proportional",
          showSlider: "always",
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 1.6,
        lineNumbers: "on",
        lineDecorationsWidth: 10,
        renderWhitespace: "selection",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: state.wordWrap ? "on" : "off",
        wordWrapColumn: 120,
        bracketPairColorization: {
          enabled: true,
          independentColorPoolPerBracketType: true,
        },
        guides: {
          bracketPairs: true,
          indentation: true,
          highlightActiveBracketPair: true,
        },
        renderLineHighlight: "all",
        smoothScrolling: true,
        mouseWheelZoom: true,
        multiCursorModifier: "ctrlCmd",
        formatOnPaste: true,
        formatOnType: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoSurround: "languageDefined",
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: "on",
        accessibilitySupport: "auto",
        cursorBlinking: "blink",
        cursorSmoothCaretAnimation: "on",
        cursorStyle: "block",
        folding: true,
        foldingStrategy: "auto",
        foldingHighlight: true,
        foldingImportsByDefault: false,
        unfoldOnClickAfterEndOfLine: false,
        linkedEditing: true,
        inlineHints: {
          enabled: true,
          fontSize: 12,
          fontFamily: "'Cascadia Code', 'Courier New', monospace",
          padding: true,
        },
        inlineSuggest: {
          enabled: true,
          mode: "always",
        },
        showUnused: true,
        readOnly,
        contextmenu: true,
        copyWithSyntaxHighlighting: true,
        columnSelection: false,
        codeActionsOnSave: {
          "source.fixAll": "explicit",
          "source.fixAll.eslint": "explicit",
          "source.organizeImports": "explicit",
        },
        "editor.codeActionWidget.showHeaders": true,
        dropIntoEditor: {
          enabled: true,
        },
        experimentalInlineEdit: true,
        lightbulb: {
          enabled: true,
        },
        gotoLocation: {
          multiple: "goto",
          multipleDefinitions: "goto",
          multipleTypeDefinitions: "goto",
          multipleDeclarations: "goto",
          multipleImplementations: "goto",
          multipleReferences: "goto",
        },
        hideCursorInOverviewRuler: false,
        overviewRulerBorder: true,
        overviewRulerLanes: 3,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
        quickSuggestionsDelay: 10,
        parameterHints: {
          enabled: true,
          cycle: true,
        },
        peekWidgetDefaultOpen: "goto",
        definitionLinkOpensInPeek: false,
        hover: {
          enabled: true,
          delay: 300,
          sticky: true,
        },
      })

      monacoRef.current = editor

      // Handle content changes
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue()
        onChange?.(newValue)
        updateEditorStats()
      })

      // Handle cursor position changes
      editor.onDidChangeCursorPosition((e) => {
        setCursorPosition({
          line: e.position.lineNumber,
          column: e.position.column,
        })
      })

      // Handle selection changes
      editor.onDidChangeCursorSelection((e) => {
        if (!e.selection.isEmpty()) {
          const model = editor.getModel()
          if (model) {
            const text = model.getValueInRange(e.selection)
            setSelectedText(text)
          }
        } else {
          setSelectedText("")
        }
      })

      // Register keyboard shortcuts
      registerKeyboardShortcuts(editor)

      // Add code completion
      setupCodeCompletion(language)

      // Update stats
      updateEditorStats()
    }

    return () => {
      // Don't dispose on every render
    }
  }, [])

  const updateEditorStats = () => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        setLineCount(model.getLineCount())
      }
    }
  }

  const registerKeyboardShortcuts = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Ctrl+S: Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.()
    })

    // Ctrl+Shift+P: Command Palette
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP, () => {
      // Handled by main app
    })

    // Ctrl+Shift+F: Format
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI, () => {
      editor.getAction("editor.action.formatDocument")?.run()
      onFormat?.()
    })

    // Ctrl+/: Toggle comment
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction("editor.action.commentLine")?.run()
    })

    // Ctrl+K Ctrl+C: Add line comment
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Slash,
      () => {
        editor.getAction("editor.action.blockComment")?.run()
      }
    )

    // Alt+Up: Move line up
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
      () => {
        editor.getAction("editor.action.moveLinesUpAction")?.run()
      }
    )

    // Alt+Down: Move line down
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
      () => {
        editor.getAction("editor.action.moveLinesDownAction")?.run()
      }
    )

    // Ctrl+D: Add selection to next occurrence
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
      () => {
        editor.getAction("editor.action.addSelectionToNextFindMatch")?.run()
      }
    )

    // Ctrl+K Ctrl+0: Fold all
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Backslash,
      () => {
        editor.getAction("editor.foldAll")?.run()
      }
    )

    // Ctrl+K Ctrl+J: Unfold all
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight,
      () => {
        editor.getAction("editor.unfoldAll")?.run()
      }
    )

    // F2: Rename symbol
    editor.addCommand(monaco.KeyCode.F2, () => {
      editor.getAction("editor.action.rename")?.run()
    })

    // Ctrl+Shift+L: Select all occurrences
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
      () => {
        editor.getAction("editor.action.selectHighlights")?.run()
      }
    )
  }

  const setupCodeCompletion = (lang: string) => {
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = getLanguageSuggestions(lang)
        return {
          suggestions: suggestions.map((suggestion) => ({
            label: suggestion,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: suggestion,
            range: range as any,
          })),
        }
      },
    })
  }

  const getLanguageSuggestions = (lang: string): string[] => {
    const suggestions: Record<string, string[]> = {
      typescript: [
        "const",
        "let",
        "var",
        "function",
        "interface",
        "type",
        "class",
        "async",
        "await",
        "export",
        "import",
        "default",
        "static",
        "private",
        "public",
        "protected",
        "readonly",
      ],
      javascript: [
        "const",
        "let",
        "var",
        "function",
        "class",
        "async",
        "await",
        "export",
        "import",
        "default",
        "static",
        "new",
        "this",
        "super",
      ],
      python: [
        "def",
        "class",
        "import",
        "from",
        "if",
        "elif",
        "else",
        "for",
        "while",
        "with",
        "try",
        "except",
        "finally",
        "return",
        "yield",
        "lambda",
        "assert",
      ],
      sql: [
        "SELECT",
        "FROM",
        "WHERE",
        "INSERT",
        "UPDATE",
        "DELETE",
        "CREATE",
        "DROP",
        "ALTER",
        "JOIN",
        "LEFT",
        "RIGHT",
        "INNER",
        "OUTER",
        "GROUP BY",
        "ORDER BY",
      ],
      html: [
        "div",
        "span",
        "p",
        "a",
        "button",
        "form",
        "input",
        "textarea",
        "select",
        "table",
        "tr",
        "td",
        "th",
        "ul",
        "li",
        "class",
        "id",
        "style",
      ],
      css: [
        "color",
        "background",
        "margin",
        "padding",
        "border",
        "width",
        "height",
        "display",
        "flex",
        "grid",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "font-size",
        "font-family",
      ],
    }

    return suggestions[lang] || []
  }

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
      const model = monacoRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  useEffect(() => {
    if (monacoRef.current) {
      const themeToSet = theme === "vs-dark" ? "vs-code-dark" : theme === "high-contrast" ? "high-contrast" : "vs-light"
      monaco.editor.setTheme(themeToSet)
    }
  }, [theme])

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({
        minimap: { enabled: state.minimap },
        wordWrap: state.wordWrap ? "on" : "off",
      })
    }
  }, [state.minimap, state.wordWrap])

  useEffect(() => {
    if (monacoRef.current && decorations.length > 0) {
      monacoRef.current.deltaDecorations([], decorations)
    }
  }, [decorations])

  useEffect(() => {
    if (monacoRef.current && highlightedLines.length > 0) {
      const newDecorations = highlightedLines.map((line) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: "highlighted-line",
          glyphMarginClassName: "codicon codicon-debug-breakpoint",
          glyphMarginHoverMessage: { value: "Breakpoint" },
        },
      }))
      monacoRef.current.deltaDecorations([], newDecorations)
    }
  }, [highlightedLines])

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      <div ref={editorRef} className="flex-1" />
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex justify-between">
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        <span>
          {selectedText.length > 0 && `Selected: ${selectedText.length} chars`}
          {selectedText.length === 0 && `Lines: ${lineCount}`}
        </span>
      </div>
    </div>
  )
}

// Configure Monaco languages and themes
if (typeof window !== "undefined") {
  // Register additional languages
  const languages = [
    { id: "python", aliases: ["Python"] },
    { id: "java", aliases: ["Java"] },
    { id: "cpp", aliases: ["C++"] },
    { id: "csharp", aliases: ["C#"] },
    { id: "go", aliases: ["Go"] },
    { id: "rust", aliases: ["Rust"] },
    { id: "ruby", aliases: ["Ruby"] },
    { id: "php", aliases: ["PHP"] },
    { id: "swift", aliases: ["Swift"] },
    { id: "kotlin", aliases: ["Kotlin"] },
  ]

  languages.forEach((lang) => {
    try {
      monaco.languages.register(lang)
    } catch (e) {
      // Language might already be registered
    }
  })

  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    types: ["node"],
    lib: ["ES2020", "DOM", "DOM.Iterable"],
  })

  // Add React type definitions
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
    declare global {
      namespace React {
        function useState<T>(initialState: T): [T, (value: T) => void];
        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        function useRef<T>(initialValue: T): { current: T };
        function useContext<T>(context: React.Context<T>): T;
        function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        function useMemo<T>(factory: () => T, deps: any[]): T;
        const Fragment: any;
        type FC<P = {}> = React.FunctionComponent<P>;
        type ReactNode = any;
      }
    }
    `,
    "react.d.ts"
  )

  // Add DOM type definitions
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `
    declare global {
      interface Document {}
      interface Window {}
      interface HTMLElement {}
      interface Event {}
    }
    `,
    "dom.d.ts"
  )

  // Setup JavaScript defaults
  monaco.languages.javascript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowJs: true,
    allowNonTsExtensions: true,
  })
}
