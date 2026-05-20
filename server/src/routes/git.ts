import express, { Router, Response } from 'express'
import { GitService } from '../services/gitService'
import Project from '../models/Project'
import { AuthRequest } from '../server'
import { join } from 'path'

const router: Router = express.Router()

const getProjectPath = (projectId: string) => join('/projects', projectId)

// Get git status
router.get('/:projectId/status', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const status = git.getStatus()

    res.json({ status })
  } catch (error: any) {
    console.error('Git status error:', error)
    res.status(500).json({ message: 'Failed to get git status', error: error.message })
  }
})

// Initialize git repository
router.post('/:projectId/init', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const success = GitService.init(getProjectPath(projectId))

    if (!success) {
      return res.status(500).json({ message: 'Failed to initialize git' })
    }

    res.json({ message: 'Git repository initialized' })
  } catch (error: any) {
    console.error('Git init error:', error)
    res.status(500).json({ message: 'Failed to initialize git', error: error.message })
  }
})

// Add files to staging
router.post('/:projectId/add', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { files = [] } = req.body

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const success = git.add(files)

    if (!success) {
      return res.status(500).json({ message: 'Failed to add files' })
    }

    const status = git.getStatus()
    res.json({ message: 'Files staged', status })
  } catch (error: any) {
    console.error('Git add error:', error)
    res.status(500).json({ message: 'Failed to add files', error: error.message })
  }
})

// Commit changes
router.post('/:projectId/commit', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ message: 'Commit message required' })
    }

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const success = git.commit(message)

    if (!success) {
      return res.status(500).json({ message: 'Failed to commit changes' })
    }

    const status = git.getStatus()
    res.json({ message: 'Changes committed', status })
  } catch (error: any) {
    console.error('Git commit error:', error)
    res.status(500).json({ message: 'Failed to commit changes', error: error.message })
  }
})

// Get commit log
router.get('/:projectId/log', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const limit = parseInt(req.query.limit as string) || 10

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const log = git.getLog(limit)

    res.json({ log })
  } catch (error: any) {
    console.error('Git log error:', error)
    res.status(500).json({ message: 'Failed to fetch commit log', error: error.message })
  }
})

// Push to remote
router.post('/:projectId/push', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { remote = 'origin', branch = 'main' } = req.body

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const success = git.push(remote, branch)

    if (!success) {
      return res.status(500).json({ message: 'Failed to push changes' })
    }

    res.json({ message: 'Changes pushed successfully' })
  } catch (error: any) {
    console.error('Git push error:', error)
    res.status(500).json({ message: 'Failed to push changes', error: error.message })
  }
})

// Pull from remote
router.post('/:projectId/pull', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { remote = 'origin', branch = 'main' } = req.body

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const success = git.pull(remote, branch)

    if (!success) {
      return res.status(500).json({ message: 'Failed to pull changes' })
    }

    res.json({ message: 'Changes pulled successfully' })
  } catch (error: any) {
    console.error('Git pull error:', error)
    res.status(500).json({ message: 'Failed to pull changes', error: error.message })
  }
})

// Create branch
router.post('/:projectId/branch', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Branch name required' })
    }

    // Check access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const git = new GitService(getProjectPath(projectId))
    const success = git.createBranch(name)

    if (!success) {
      return res.status(500).json({ message: 'Failed to create branch' })
    }

    const status = git.getStatus()
    res.json({ message: 'Branch created', status })
  } catch (error: any) {
    console.error('Git branch error:', error)
    res.status(500).json({ message: 'Failed to create branch', error: error.message })
  }
})

export default router
