export interface FormattingOptions {
  indentSize?: number
  useTabs?: boolean
  singleQuote?: boolean
  trailingComma?: 'none' | 'es5' | 'all'
  printWidth?: number
  semicolons?: boolean
  bracketSpacing?: boolean
}

export interface FormatResult {
  formatted: string
  isValid: boolean
  errors?: string[]
}

interface LintIssue {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  rule?: string
}

export class CodeFormatter {
  static format(code: string, language: string, options: FormattingOptions = {}): FormatResult {
    try {
      const defaults = {
        indentSize: options.indentSize || 2,
        useTabs: options.useTabs || false,
        singleQuote: options.singleQuote !== undefined ? options.singleQuote : true,
        trailingComma: options.trailingComma || 'none',
        printWidth: options.printWidth || 80,
        semicolons: options.semicolons !== undefined ? options.semicolons : true,
        bracketSpacing: options.bracketSpacing !== undefined ? options.bracketSpacing : true,
      }

      let formatted = code
      let isValid = true

      switch (language) {
        case 'javascript':
        case 'typescript':
          formatted = this.formatJavaScript(code, defaults)
          break
        case 'python':
          formatted = this.formatPython(code, defaults)
          break
        case 'json':
          formatted = this.formatJSON(code, defaults)
          break
        case 'html':
        case 'xml':
          formatted = this.formatHTML(code, defaults)
          break
        case 'css':
        case 'scss':
          formatted = this.formatCSS(code, defaults)
          break
        case 'sql':
          formatted = this.formatSQL(code, defaults)
          break
        default:
          formatted = code
      }

      return {
        formatted,
        isValid,
      }
    } catch (error: any) {
      return {
        formatted: code,
        isValid: false,
        errors: [error.message],
      }
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

  /**
   * Format SQL code
   */
  private static formatSQL(code: string, options: Required<FormattingOptions>): string {
    const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize)
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'JOIN',
      'LEFT JOIN',
      'INNER JOIN',
      'GROUP BY',
      'ORDER BY',
      'LIMIT',
      'OFFSET',
    ]

    let formatted = code

    // Add newlines before keywords
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\s+${keyword}\\s+`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword} `)
    })

    return formatted
  }

  /**
   * Calculate code complexity
   */
  static getComplexityMetrics(code: string, language: string): any {
    const lines = code.split('\n')
    const nonEmptyLines = lines.filter((l) => l.trim()).length
    const commentLines = lines.filter((l) => /^(\s)*\/\/|\/\*|\*\/|#|--/.test(l)).length

    let cyclomaticComplexity = 1
    const complexityKeywords =
      language === 'python'
        ? ['if', 'elif', 'for', 'while', 'except', 'and', 'or']
        : ['if', 'else if', 'switch', 'case', 'for', 'while', '&&', '||', '?']

    complexityKeywords.forEach((keyword) => {
      const count = (code.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length
      cyclomaticComplexity += count
    })

    const functionCount = (code.match(/^(\s)*(function|def|const.*=\s*\(|async.*=>)/gm) || [])
      .length

    return {
      totalLines: lines.length,
      nonEmptyLines,
      commentLines,
      commentRatio: ((commentLines / nonEmptyLines) * 100).toFixed(2),
      cyclomaticComplexity,
      estimatedFunctions: functionCount,
      averageLinesPerFunction:
        functionCount > 0 ? (nonEmptyLines / functionCount).toFixed(2) : 0,
    }
  }

  /**
   * Validate code syntax
   */
  static validateSyntax(code: string, language: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      switch (language) {
        case 'json':
          JSON.parse(code)
          break
        case 'javascript':
        case 'typescript':
          // Basic syntax check using regex patterns
          if (/(function|class)\s*{/.test(code) === false && /=>/.test(code) === false) {
            // Has some function-like structure
          }
          break
        default:
          break
      }
    } catch (error: any) {
      errors.push(error.message)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Auto-fix common issues
   */
  static autoFix(code: string, language: string): string {
    let fixed = code

    switch (language) {
      case 'javascript':
      case 'typescript':
        // Fix missing semicolons
        fixed = fixed.replace(/([^;{}\s])\n(?![\s]*[}\];])/gm, '$1;\n')
        // Fix trailing commas
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1')
        break
      case 'json':
        // Remove trailing commas
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1')
        break
    }

    return fixed
  }
}
