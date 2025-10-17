import express, { Router, Response } from 'express'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Execute JavaScript/TypeScript code
router.post('/javascript', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    // In production, use vm2 or similar for safe code execution
    // For now, return mock output
    const mockOutputs = [
      'Hello, World!',
      '[1, 2, 3, 4, 5]',
      'Result: 42',
      'undefined',
      'Error: Variable not defined',
    ]

    const output = mockOutputs[Math.floor(Math.random() * mockOutputs.length)]
    const executionTime = Math.random() * 1000

    res.json({
      output,
      executionTime: Math.round(executionTime),
      status: 'success',
      error: null,
    })
  } catch (error: any) {
    console.error('Execution error:', error)
    res.status(500).json({
      output: '',
      error: error.message,
      status: 'error',
    })
  }
})

// Execute Python code
router.post('/python', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    // Mock Python execution
    const mockOutputs = [
      'Hello, World!',
      '[1, 2, 3, 4, 5]',
      '42',
      'None',
      'SyntaxError: invalid syntax',
    ]

    const output = mockOutputs[Math.floor(Math.random() * mockOutputs.length)]
    const executionTime = Math.random() * 2000

    res.json({
      output,
      executionTime: Math.round(executionTime),
      status: 'success',
      error: null,
    })
  } catch (error: any) {
    console.error('Python execution error:', error)
    res.status(500).json({
      output: '',
      error: error.message,
      status: 'error',
    })
  }
})

// Test code
router.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    const { code, testCode, language = 'javascript' } = req.body

    if (!code || !testCode) {
      return res.status(400).json({ message: 'Code and tests required' })
    }

    // Mock test results
    const testResults = [
      {
        name: 'should handle basic input',
        passed: true,
        duration: 5,
      },
      {
        name: 'should handle edge cases',
        passed: true,
        duration: 8,
      },
      {
        name: 'should throw on invalid input',
        passed: true,
        duration: 3,
      },
    ]

    res.json({
      totalTests: 3,
      passedTests: 3,
      failedTests: 0,
      results: testResults,
      coverage: 85,
    })
  } catch (error: any) {
    console.error('Test execution error:', error)
    res.status(500).json({
      error: error.message,
      status: 'error',
    })
  }
})

// Get execution history
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const history = [
      {
        id: '1',
        code: 'console.log("Hello")',
        language: 'javascript',
        output: 'Hello',
        executionTime: 25,
        status: 'success',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        code: 'print("Hello")',
        language: 'python',
        output: 'Hello',
        executionTime: 145,
        status: 'success',
        createdAt: new Date(Date.now() - 7200000),
      },
    ]

    res.json({ history })
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

// Lint code
router.post('/lint', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language = 'javascript' } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    // Mock linting results
    const issues = [
      {
        line: 1,
        column: 0,
        message: 'Unexpected var, use let or const instead',
        severity: 'warning',
        rule: 'no-var',
      },
      {
        line: 5,
        column: 10,
        message: 'Variable is declared but never used',
        severity: 'warning',
        rule: 'no-unused-vars',
      },
    ]

    res.json({
      issues,
      totalIssues: issues.length,
      errors: 0,
      warnings: issues.length,
    })
  } catch (error) {
    console.error('Lint error:', error)
    res.status(500).json({ message: 'Failed to lint code' })
  }
})

export default router
