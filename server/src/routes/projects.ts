import express, { Router, Response } from 'express'
import { projectService } from '../services/ProjectService'
import { permissionService } from '../services/PermissionService'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router: Router = express.Router()

// Get all user projects
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const { projects, total } = await projectService.getUserProjects(req.user!.id, {
      limit,
      offset,
    })

    res.json({
      success: true,
      data: { projects, total },
      pagination: { limit, offset, total },
    })
  })
)

// Get single project
router.get(
  '/:projectId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const project = await projectService.getProject(projectId, req.user!.id)

    const permissions = await permissionService.getProjectPermissions(req.user!.id, projectId)

    res.json({
      success: true,
      data: {
        project,
        permissions,
      },
    })
  })
)

// Create new project
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, language } = req.body
    const project = await projectService.createProject(req.user!.id, name, description, language)

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    })
  })
)

// Update project
router.put(
  '/:projectId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const updates = req.body

    const project = await projectService.updateProject(projectId, req.user!.id, updates)

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    })
  })
)

// Delete project
router.delete(
  '/:projectId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    await projectService.deleteProject(projectId, req.user!.id)

    res.json({
      success: true,
      message: 'Project deleted successfully',
    })
  })
)

// Add collaborator
router.post(
  '/:projectId/collaborators',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const { email, role = 'contributor' } = req.body

    const project = await projectService.addCollaborator(
      projectId,
      req.user!.id,
      email,
      role
    )

    res.json({
      success: true,
      message: 'Collaborator added successfully',
      data: { project },
    })
  })
)

// Update collaborator role
router.put(
  '/:projectId/collaborators/:collaboratorId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, collaboratorId } = req.params
    const { role } = req.body

    await permissionService.updateCollaboratorRole(projectId, req.user!.id, collaboratorId, role)

    const project = await projectService.getProject(projectId, req.user!.id)

    res.json({
      success: true,
      message: 'Collaborator role updated',
      data: { project },
    })
  })
)

// Remove collaborator
router.delete(
  '/:projectId/collaborators/:collaboratorId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, collaboratorId } = req.params

    const project = await projectService.removeCollaborator(projectId, req.user!.id, collaboratorId)

    res.json({
      success: true,
      message: 'Collaborator removed successfully',
      data: { project },
    })
  })
)

// Archive project
router.post(
  '/:projectId/archive',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const project = await projectService.archiveProject(projectId, req.user!.id)

    res.json({
      success: true,
      message: 'Project archived successfully',
      data: { project },
    })
  })
)

// Restore archived project
router.post(
  '/:projectId/restore',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const project = await projectService.restoreProject(projectId, req.user!.id)

    res.json({
      success: true,
      message: 'Project restored successfully',
      data: { project },
    })
  })
)

// Search projects
router.get(
  '/search/:query',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { query } = req.params
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const { projects, total } = await projectService.searchProjects(req.user!.id, query, {
      limit,
      offset,
    })

    res.json({
      success: true,
      data: { projects, total },
      pagination: { limit, offset, total },
    })
  })
)

// Export project
router.get(
  '/:projectId/export',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const exportData = await projectService.exportProject(projectId, req.user!.id)

    res.set('Content-Type', 'application/json')
    res.set('Content-Disposition', `attachment; filename="project-${projectId}.json"`)
    res.send(exportData)
  })
)

// Duplicate project
router.post(
  '/:projectId/duplicate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const project = await projectService.duplicateProject(projectId, req.user!.id)

    res.status(201).json({
      success: true,
      message: 'Project duplicated successfully',
      data: { project },
    })
  })
)

// Update project stats
router.post(
  '/:projectId/update-stats',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    await projectService.updateProjectStats(projectId)

    res.json({
      success: true,
      message: 'Project stats updated',
    })
  })
)

export default router
