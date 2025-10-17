import express, { Router, Response } from 'express'
import File from '../models/File'
import Project from '../models/Project'
import { AuthRequest } from '../server'

const router: Router = express.Router()

// Get all files in a project
router.get('/project/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params

    // Check if user has access to project
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id && !project.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const files = await File.find({ project: projectId })
    res.json({ files })
  } catch (error) {
    console.error('Get files error:', error)
    res.status(500).json({ message: 'Failed to fetch files' })
  }
})

// Get single file
router.get('/:fileId', async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // Check access
    const project = await Project.findById(file.project)
    if (project?.owner.toString() !== req.user?.id && !project?.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ file })
  } catch (error) {
    console.error('Get file error:', error)
    res.status(500).json({ message: 'Failed to fetch file' })
  }
})

// Create new file
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, name, language, content = '' } = req.body

    // Validation
    if (!projectId || !name) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check project access
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Create file
    const file = new File({
      name,
      path: `/${projectId}/${name}`,
      project: projectId,
      owner: req.user?.id,
      content,
      language: language || 'plaintext',
      size: content.length,
    })

    await file.save()

    // Add file to project
    project.files.push(file._id as any)
    await project.save()

    res.status(201).json({ message: 'File created', file })
  } catch (error) {
    console.error('Create file error:', error)
    res.status(500).json({ message: 'Failed to create file' })
  }
})

// Update file content
router.put('/:fileId', async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params
    const { content } = req.body

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // Check access
    const project = await Project.findById(file.project)
    if (project?.owner.toString() !== req.user?.id && !project?.collaborators.includes(req.user?.id as any)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Update file
    file.content = content
    file.size = content.length
    file.isDirty = true

    await file.save()

    // Update project lastModified
    if (project) {
      project.lastModified = new Date()
      await project.save()
    }

    res.json({ message: 'File updated', file })
  } catch (error) {
    console.error('Update file error:', error)
    res.status(500).json({ message: 'Failed to update file' })
  }
})

// Delete file
router.delete('/:fileId', async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // Check access
    const project = await Project.findById(file.project)
    if (project?.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    await File.findByIdAndDelete(fileId)

    // Remove from project
    if (project) {
      project.files = project.files.filter(f => f.toString() !== fileId)
      await project.save()
    }

    res.json({ message: 'File deleted' })
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({ message: 'Failed to delete file' })
  }
})

// Rename file
router.patch('/:fileId/rename', async (req: AuthRequest, res: Response) => {
  try {
    const { fileId } = req.params
    const { newName } = req.body

    if (!newName) {
      return res.status(400).json({ message: 'New name required' })
    }

    const file = await File.findById(fileId)
    if (!file) {
      return res.status(404).json({ message: 'File not found' })
    }

    // Check access
    const project = await Project.findById(file.project)
    if (project?.owner.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied' })
    }

    file.name = newName
    await file.save()

    res.json({ message: 'File renamed', file })
  } catch (error) {
    console.error('Rename file error:', error)
    res.status(500).json({ message: 'Failed to rename file' })
  }
})

export default router
