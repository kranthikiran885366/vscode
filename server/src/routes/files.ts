import express, { Router, Response } from 'express'
import { fileService } from '../services/FileService'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router: Router = express.Router()

// Get all files in a project
router.get(
  '/project/:projectId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const files = await fileService.getProjectFiles(projectId, req.user!.id)

    res.json({
      success: true,
      data: { files },
    })
  })
)

// Get single file
router.get(
  '/:fileId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params
    const file = await fileService.getFile(fileId, req.user!.id)

    res.json({
      success: true,
      data: { file },
    })
  })
)

// Create new file
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, name, language, content } = req.body

    const file = await fileService.createFile(projectId, req.user!.id, name, language, content)

    res.status(201).json({
      success: true,
      message: 'File created successfully',
      data: { file },
    })
  })
)

// Update file content
router.put(
  '/:fileId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params
    const { content, message } = req.body

    const file = await fileService.updateFileContent(fileId, req.user!.id, content, message)

    res.json({
      success: true,
      message: 'File updated successfully',
      data: { file },
    })
  })
)

// Delete file
router.delete(
  '/:fileId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params
    await fileService.deleteFile(fileId, req.user!.id)

    res.json({
      success: true,
      message: 'File deleted successfully',
    })
  })
)

// Rename file
router.patch(
  '/:fileId/rename',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params
    const { newName } = req.body

    const file = await fileService.renameFile(fileId, req.user!.id, newName)

    res.json({
      success: true,
      message: 'File renamed successfully',
      data: { file },
    })
  })
)

// Get file versions
router.get(
  '/:fileId/versions',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params
    const versions = await fileService.getFileVersions(fileId, req.user!.id)

    res.json({
      success: true,
      data: { versions },
    })
  })
)

// Restore file to specific version
router.post(
  '/:fileId/restore/:versionNumber',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId, versionNumber } = req.params
    const file = await fileService.restoreVersion(fileId, req.user!.id, parseInt(versionNumber))

    res.json({
      success: true,
      message: 'File restored successfully',
      data: { file },
    })
  })
)

export default router
