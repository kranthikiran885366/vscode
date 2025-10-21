import express, { Router, Response } from 'express'
import { CodeExecutor } from '../services/codeExecutor'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Execute code in any language
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language = 'javascript' } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    const result = await CodeExecutor.execute(code, language)

    res.json({
      ...result,
      language,
      timestamp: new Date(),
    })
  } catch (error: any) {
    console.error('Execution error:', error)
    res.status(500).json({
      success: false,
      output: '',
      error: error.message || 'Execution failed',
      duration: 0,
    })
  }
})

// Execute JavaScript code
router.post('/javascript', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    const result = await CodeExecutor.execute(code, 'javascript')

    res.json({
      ...result,
      language: 'javascript',
      timestamp: new Date(),
    })
  } catch (error: any) {
    console.error('JavaScript execution error:', error)
    res.status(500).json({
      success: false,
      output: '',
      error: error.message,
      duration: 0,
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

    const result = await CodeExecutor.execute(code, 'python')

    res.json({
      ...result,
      language: 'python',
      timestamp: new Date(),
    })
  } catch (error: any) {
    console.error('Python execution error:', error)
    res.status(500).json({
      success: false,
      output: '',
      error: error.message,
      duration: 0,
    })
  }
})

// Test code with test cases
router.post('/test', async (req: AuthRequest, res: Response) => {
  try {
    const { code, testCode, language = 'javascript' } = req.body

    if (!code || !testCode) {
      return res.status(400).json({ message: 'Code and tests required' })
    }

    // Combine code and test
    const fullCode = `${code}\n\n${testCode}`
    const result = await CodeExecutor.execute(fullCode, language)

    // Parse test results from output
    const testPassed = !result.error && result.output.length > 0
    const testResults = [
      {
        name: 'Test execution',
        passed: testPassed,
        duration: result.duration,
      },
    ]

    res.json({
      success: testPassed,
      totalTests: 1,
      passedTests: testPassed ? 1 : 0,
      failedTests: testPassed ? 0 : 1,
      results: testResults,
      coverage: 0,
      output: result.output,
      error: result.error,
    })
  } catch (error: any) {
    console.error('Test execution error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      status: 'error',
    })
  }
})

// Format code
router.post('/format', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language = 'javascript' } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Code required' })
    }

    // For now, return the code as-is
    // In production, use prettier or language-specific formatters
    res.json({
      formatted: code,
      changes: 0,
    })
  } catch (error: any) {
    console.error('Format error:', error)
    res.status(500).json({
      error: error.message,
      status: 'error',
    })
  }
})

// Get execution history
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    // Return mock history for now
    // In production, store in MongoDB
    const history = [
      {
        id: '1',
        code: 'console.log("Hello")',
        language: 'javascript',
        output: 'Hello',
        duration: 25,
        success: true,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        id: '2',
        code: 'print("Hello")',
        language: 'python',
        output: 'Hello',
        duration: 145,
        success: true,
        createdAt: new Date(Date.now() - 7200000),
      },
    ]

    res.json({ history })
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

export default router
