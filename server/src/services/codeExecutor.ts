import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'

export interface ExecutionResult {
  success: boolean
  output: string
  error: string
  duration: number
  language: string
  memoryUsed?: number
  executionId: string
}

const TIMEOUT = parseInt(process.env.EXECUTION_TIMEOUT || '5000') // 5 seconds timeout
const MAX_OUTPUT_SIZE = parseInt(process.env.MAX_OUTPUT_SIZE || '10485760') // 10MB
const TEMP_DIR = process.env.TEMP_DIR || '/tmp/zencode_execution'

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
      // Validate input
      if (!code || code.trim().length === 0) {
        return {
          success: false,
          output: '',
          error: 'Code cannot be empty',
          duration: 0,
          language,
          executionId,
        }
      }

      // Ensure temp directory exists
      mkdirSync(TEMP_DIR, { recursive: true })

      // Write code to temporary file
      writeFileSync(tempFile, code)

      // Execute based on language
      const result = await this.executeFile(language, tempFile, timeout)

      logger.info('Code executed', 'CODE_EXECUTOR', {
        executionId,
        language,
        duration: Date.now() - startTime,
        success: !result.error,
      })

      return {
        success: !result.error,
        output: result.output.substring(0, MAX_OUTPUT_SIZE),
        error: result.error,
        duration: Date.now() - startTime,
        language,
        executionId,
      }
    } catch (error: any) {
      logger.error('Code execution error', 'CODE_EXECUTOR', {
        executionId,
        language,
        error: error.message,
      })

      return {
        success: false,
        output: '',
        error: error.message || 'Execution failed',
        duration: Date.now() - startTime,
        language,
        executionId,
      }
    } finally {
      // Cleanup temp file
      try {
        unlinkSync(tempFile)
      } catch (e) {
        logger.warn('Failed to cleanup temp file', 'CODE_EXECUTOR', { file: tempFile })
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
