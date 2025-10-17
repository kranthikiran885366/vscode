import express, { Router, Response } from 'express'
import Project from '../models/Project'
import File from '../models/File'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Get all user projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user?.id },
        { collaborators: req.user?.id },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .sort({ lastModified: -1 })

    res.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

// Get single project
router.get('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
      .populate('owner', 'name email avatar')
      .populate('collaborators', 'name email avatar')
      .populate('files')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check access
    if (!project.isPublic && 
        project.owner._id.toString() !== req.user?.id && 
        !project.collaborators.some(c => c._id.toString() === req.user?.id)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ message: 'Failed to fetch project' })
  }
})

// Create new project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description = '', language = 'javascript' } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Project name required' })
    }

    const project = new Project({
      name,
      description,
      owner: req.user?.id,
      language,
    })

    // Create default README file
    const readmeFile = new File({
      name: 'README.md',
      path: `/${project._id}/README.md`,
      project: project._id,
      owner: req.user?.id,
      content: `# ${name}\n\n${description}\n`,
      language: 'markdown',
    })

    await readmeFile.save()
    project.files.push(readmeFile._id as any)

    await project.save()

    res.status(201).json({ message: 'Project created', project })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ message: 'Failed to create project' })
  }
})

// Update project
router.put('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { name, description, isPublic, language } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check ownership
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Update fields
    if (name) project.name = name
    if (description !== undefined) project.description = description
    if (isPublic !== undefined) project.isPublic = isPublic
    if (language) project.language = language

    project.lastModified = new Date()
    await project.save()

    res.json({ message: 'Project updated', project })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ message: 'Failed to update project' })
  }
})

// Delete project
router.delete('/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check ownership
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Delete all files in project
    await File.deleteMany({ project: projectId })

    // Delete project
    await Project.findByIdAndDelete(projectId)

    res.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ message: 'Failed to delete project' })
  }
})

// Add collaborator
router.post('/:projectId/collaborators', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email required' })
    }

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check ownership
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Find user by email
    const { User } = await import('../models/User')
    const collaborator = await User.findOne({ email })
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!project.collaborators.includes(collaborator._id)) {
      project.collaborators.push(collaborator._id)
      await project.save()
    }

    res.json({ message: 'Collaborator added', project })
  } catch (error) {
    console.error('Add collaborator error:', error)
    res.status(500).json({ message: 'Failed to add collaborator' })
  }
})

// Remove collaborator
router.delete('/:projectId/collaborators/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, userId } = req.params

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check ownership
    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    project.collaborators = project.collaborators.filter(c => c.toString() !== userId)
    await project.save()

    res.json({ message: 'Collaborator removed', project })
  } catch (error) {
    console.error('Remove collaborator error:', error)
    res.status(500).json({ message: 'Failed to remove collaborator' })
  }
})

export default router
