import express, { Router, Response } from 'express'
import { CodeSnippets } from '../services/codeSnippets'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Get all snippets for a language
router.get('/language/:language', async (req: AuthRequest, res: Response) => {
  try {
    const { language } = req.params

    if (!language) {
      return res.status(400).json({ message: 'Language required' })
    }

    const snippets = CodeSnippets.getSnippets(language)

    res.json({ language, snippets })
  } catch (error: any) {
    console.error('Get snippets error:', error)
    res.status(500).json({ message: 'Failed to get snippets', error: error.message })
  }
})

// Search snippets
router.get('/search/:language', async (req: AuthRequest, res: Response) => {
  try {
    const { language } = req.params
    const { query = '' } = req.query

    if (!language) {
      return res.status(400).json({ message: 'Language required' })
    }

    const snippets = CodeSnippets.searchSnippets(language, String(query))

    res.json({ language, query, snippets })
  } catch (error: any) {
    console.error('Search snippets error:', error)
    res.status(500).json({ message: 'Failed to search snippets', error: error.message })
  }
})

// Get snippet by prefix
router.get('/:language/:prefix', async (req: AuthRequest, res: Response) => {
  try {
    const { language, prefix } = req.params

    if (!language || !prefix) {
      return res.status(400).json({ message: 'Language and prefix required' })
    }

    const snippet = CodeSnippets.getSnippetByPrefix(language, prefix)

    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' })
    }

    const expanded = CodeSnippets.expandSnippet(snippet)

    res.json({ snippet, expanded })
  } catch (error: any) {
    console.error('Get snippet error:', error)
    res.status(500).json({ message: 'Failed to get snippet', error: error.message })
  }
})

// Expand snippet
router.post('/expand', async (req: AuthRequest, res: Response) => {
  try {
    const { snippet } = req.body

    if (!snippet) {
      return res.status(400).json({ message: 'Snippet required' })
    }

    const expanded = CodeSnippets.expandSnippet(snippet)

    res.json({ expanded })
  } catch (error: any) {
    console.error('Expand snippet error:', error)
    res.status(500).json({ message: 'Failed to expand snippet', error: error.message })
  }
})

export default router
