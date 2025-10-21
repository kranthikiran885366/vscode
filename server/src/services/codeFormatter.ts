export interface FormattingOptions {
  indentSize?: number
  useTabs?: boolean
  singleQuote?: boolean
  trailingComma?: 'none' | 'es5' | 'all'
  printWidth?: number
}

interface LintIssue {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  rule?: string
}

export class CodeFormatter {
  static format(code: string, language: string, options: FormattingOptions = {}): string {
    const defaults = {
      indentSize: options.indentSize || 2,
      useTabs: options.useTabs || false,
      singleQuote: options.singleQuote !== undefined ? options.singleQuote : true,
      trailingComma: options.trailingComma || 'none',
      printWidth: options.printWidth || 80,
    }

    switch (language) {
      case 'javascript':
      case 'typescript':
        return this.formatJavaScript(code, defaults)
      case 'python':
        return this.formatPython(code, defaults)
      case 'json':
        return this.formatJSON(code, defaults)
      case 'html':
      case 'xml':
        return this.formatHTML(code, defaults)
      case 'css':
      case 'scss':
        return this.formatCSS(code, defaults)
      default:
        return code
    }
  }

  private static formatJavaScript(code: string, options: Required<FormattingOptions>): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
    let formatted = code
    let indentLevel = 0

    // Basic indentation
    const lines = code.split('\n')
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim()

      // Decrease indent for closing brackets
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      const indented = indentLevel > 0 ? indent.repeat(indentLevel) + trimmed : trimmed

      // Increase indent for opening brackets
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indentLevel++
      }

      return indented
    })

    return formattedLines.join('\n')
  }

  private static formatPython(code: string, options: Required<FormattingOptions>): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
    let indentLevel = 0

    const lines = code.split('\n')
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      // Python uses leading whitespace for indentation
      // This is a simplified implementation
      if (trimmed.endsWith(':')) {
        const indented = indent.repeat(indentLevel) + trimmed
        indentLevel++
        return indented
      } else {
        indentLevel = Math.max(0, indentLevel)
        return indent.repeat(indentLevel) + trimmed
      }
    })

    return formattedLines.join('\n')
  }

  private static formatJSON(code: string, options: Required<FormattingOptions>): string {
    try {
      const parsed = JSON.parse(code)
      const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
      return JSON.stringify(parsed, null, indent)
    } catch (error) {
      // Return original code if invalid JSON
      return code
    }
  }

  private static formatHTML(code: string, options: Required<FormattingOptions>): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
    let indentLevel = 0

    const lines = code.split('\n')
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim()

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      const indented = indentLevel > 0 ? indent.repeat(indentLevel) + trimmed : trimmed

      // Increase indent for opening tags (but not self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indentLevel++
      }

      return indented
    })

    return formattedLines.join('\n')
  }

  private static formatCSS(code: string, options: Required<FormattingOptions>): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
    let indentLevel = 0

    let formatted = code

    // Add newlines after opening braces
    formatted = formatted.replace(/\{\s*/g, ' {\n')

    // Add newlines after closing braces
    formatted = formatted.replace(/\}\s*/g, '}\n')

    // Add newlines after semicolons
    formatted = formatted.replace(/;\s*/g, ';\n')

    const lines = formatted.split('\n')
    const formattedLines = lines
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ''

        if (trimmed === '}') {
          indentLevel = Math.max(0, indentLevel - 1)
        }

        const indented = indent.repeat(indentLevel) + trimmed

        if (trimmed === '{') {
          indentLevel++
        }

        return indented
      })
      .filter((line) => line)

    return formattedLines.join('\n')
  }

  static lint(code: string, language: string): LintIssue[] {
    const issues: LintIssue[] = []

    switch (language) {
      case 'javascript':
      case 'typescript':
        return this.lintJavaScript(code)
      case 'python':
        return this.lintPython(code)
      case 'json':
        return this.lintJSON(code)
      default:
        return issues
    }
  }

  private static lintJavaScript(code: string): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      const lineNum = index + 1

      // Check for var usage
      if (/\bvar\s+/.test(line)) {
        issues.push({
          line: lineNum,
          column: line.indexOf('var'),
          message: "Unexpected 'var', use 'let' or 'const' instead",
          severity: 'warning',
          rule: 'no-var',
        })
      }

      // Check for trailing semicolons
      const trimmed = line.trim()
      if (
        trimmed &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*')
      ) {
        // Heuristic check - might produce false positives
      }

      // Check for unused variables
      const varMatch = /\b(const|let|var)\s+(\w+)\s*=/.exec(line)
      if (varMatch) {
        const varName = varMatch[2]
        const varRegex = new RegExp(`\\b${varName}\\b`, 'g')
        const matches = code.match(varRegex) || []
        if (matches.length <= 1) {
          issues.push({
            line: lineNum,
            column: varMatch.index || 0,
            message: `Variable '${varName}' is declared but never used`,
            severity: 'warning',
            rule: 'no-unused-vars',
          })
        }
      }
    })

    return issues
  }

  private static lintPython(code: string): LintIssue[] {
    const issues: LintIssue[] = []
    const lines = code.split('\n')

    lines.forEach((line, index) => {
      const lineNum = index + 1

      // Check for whitespace issues
      if (/^\t/.test(line)) {
        issues.push({
          line: lineNum,
          column: 0,
          message: 'Indentation contains tabs',
          severity: 'warning',
          rule: 'indentation',
        })
      }

      // Check for lines too long
      if (line.length > 79) {
        issues.push({
          line: lineNum,
          column: 79,
          message: 'Line too long (more than 79 characters)',
          severity: 'warning',
          rule: 'line-too-long',
        })
      }
    })

    return issues
  }

  private static lintJSON(code: string): LintIssue[] {
    const issues: LintIssue[] = []

    try {
      JSON.parse(code)
    } catch (error: any) {
      const match = error.message.match(/position (\d+)/)
      const position = match ? parseInt(match[1]) : 0
      const lines = code.substring(0, position).split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length

      issues.push({
        line,
        column,
        message: error.message,
        severity: 'error',
        rule: 'json-parse-error',
      })
    }

    return issues
  }
}
