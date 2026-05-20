import express, { Router, Response } from 'express'
import { CodeFormatter } from '../services/codeFormatter'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Format code
router.post('/format', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, options } = req.body

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language required' })
    }

    const formatted = CodeFormatter.format(code, language, options)

    res.json({
      original: code,
      formatted,
      changes: code !== formatted,
    })
  } catch (error: any) {
    console.error('Format error:', error)
    res.status(500).json({ message: 'Failed to format code', error: error.message })
  }
})

// Lint code
router.post('/lint', async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language required' })
    }

    const issues = CodeFormatter.lint(code, language)

    const errors = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')
    const infos = issues.filter((i) => i.severity === 'info')

    res.json({
      issues,
      summary: {
        total: issues.length,
        errors: errors.length,
        warnings: warnings.length,
        infos: infos.length,
      },
    })
  } catch (error: any) {
    console.error('Lint error:', error)
    res.status(500).json({ message: 'Failed to lint code', error: error.message })
  }
})

export default router
