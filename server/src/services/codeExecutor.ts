import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

interface ExecutionResult {
  success: boolean
  output: string
  error: string
  duration: number
}

const TIMEOUT = 5000 // 5 seconds timeout
const TEMP_DIR = '/tmp/zencode_execution'

export class CodeExecutor {
  static async execute(
    code: string,
    language: string,
    timeout = TIMEOUT
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const executionId = uuidv4()
    const tempFile = join(TEMP_DIR, `${executionId}.${this.getFileExtension(language)}`)

    try {
      // Ensure temp directory exists
      mkdirSync(TEMP_DIR, { recursive: true })

      // Write code to temporary file
      writeFileSync(tempFile, code)

      // Execute based on language
      const result = await this.executeFile(language, tempFile, timeout)

      return {
        success: !result.error,
        output: result.output,
        error: result.error,
        duration: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message || 'Execution failed',
        duration: Date.now() - startTime,
      }
    } finally {
      // Cleanup temp file
      try {
        unlinkSync(tempFile)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  private static getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css',
      sql: 'sql',
    }
    return extensions[language] || 'txt'
  }

  private static async executeFile(
    language: string,
    filePath: string,
    timeout: number
  ): Promise<{ output: string; error: string }> {
    return new Promise((resolve) => {
      let output = ''
      let error = ''
      let hasTimedOut = false

      const commands: Record<string, [string, string[]]> = {
        javascript: ['node', [filePath]],
        python: ['python3', [filePath]],
        java: ['java', [filePath]],
        cpp: ['./a.out', []],
        go: ['go', ['run', filePath]],
        rust: ['rustc', [filePath]],
        bash: ['bash', [filePath]],
      }

      const [command, args] = commands[language] || ['node', [filePath]]

      const process = spawn(command, args, {
        timeout,
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      const timeoutId = setTimeout(() => {
        hasTimedOut = true
        process.kill()
        error = 'Execution timeout exceeded'
      }, timeout)

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        error += data.toString()
      })

      process.on('close', (code) => {
        clearTimeout(timeoutId)
        if (!hasTimedOut && code !== 0 && !error) {
          error = `Process exited with code ${code}`
        }
        resolve({ output, error })
      })

      process.on('error', (err) => {
        clearTimeout(timeoutId)
        error = err.message
        resolve({ output, error })
      })
    })
  }
}
