import File, { IFile } from '../models/File'
import Project from '../models/Project'
import AuditLog from '../models/AuditLog'
import { ValidationError, AuthorizationError, NotFoundError } from '../utils/errors'
import { isValidFileName, isValidObjectId, isValidLanguage } from '../utils/validators'
import { logger } from '../utils/logger'

export class FileService {
  /**
   * Create a new file
   */
  async createFile(
    projectId: string,
    userId: string,
    name: string,
    language?: string,
    content: string = ''
  ): Promise<IFile> {
    try {
      // Validate inputs
      if (!isValidObjectId(projectId)) {
        throw new ValidationError('Invalid project ID')
      }

      if (!isValidFileName(name)) {
        throw new ValidationError('Invalid file name')
      }

      if (language && !isValidLanguage(language)) {
        throw new ValidationError('Unsupported language')
      }

      // Check project access
      const project = await Project.findById(projectId)
      if (!project) {
        throw new NotFoundError('Project')
      }

      const hasAccess =
        project.owner.toString() === userId ||
        project.collaborators.some((c: any) => c.userId.toString() === userId)

      if (!hasAccess) {
        throw new AuthorizationError('Access denied')
      }

      // Create file
      const file = new File({
        name,
        path: `/${projectId}/${name}`,
        project: projectId,
        owner: userId,
        content,
        language: language || 'plaintext',
        lastModifiedBy: userId,
        lineCount: content.split('\n').length,
        size: content.length,
      })

      // Create initial version
      file.versions.push({
        versionNumber: 1,
        content,
        author: userId as any,
        message: 'Initial version',
        createdAt: new Date(),
      })

      await file.save()

      // Update project stats
      project.stats.totalFiles = (project.stats.totalFiles || 0) + 1
      project.stats.totalLines = (project.stats.totalLines || 0) + file.lineCount
      project.stats.lastActivity = new Date()
      project.files.push(file._id as any)
      await project.save()

      // Log audit
      await this.logAudit(userId, 'CREATE', 'FILE', file._id.toString(), {
        fileName: name,
        projectId,
      })

      logger.info('File created', 'FILE_SERVICE', { fileId: file._id, projectId, userId })

      return file
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Create file error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string, userId: string): Promise<IFile> {
    try {
      if (!isValidObjectId(fileId)) {
        throw new ValidationError('Invalid file ID')
      }

      const file = await File.findById(fileId).populate('owner', 'name email')

      if (!file || file.isDeleted) {
        throw new NotFoundError('File')
      }

      // Check access
      const project = await Project.findById(file.project)
      if (!project) {
        throw new NotFoundError('Project')
      }

      const hasAccess =
        project.owner.toString() === userId ||
        project.collaborators.some((c: any) => c.userId.toString() === userId)

      if (!hasAccess && !project.isPublic) {
        throw new AuthorizationError('Access denied')
      }

      return file
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Get file error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Get all files in a project
   */
  async getProjectFiles(projectId: string, userId: string): Promise<IFile[]> {
    try {
      if (!isValidObjectId(projectId)) {
        throw new ValidationError('Invalid project ID')
      }

      // Check project access
      const project = await Project.findById(projectId)
      if (!project) {
        throw new NotFoundError('Project')
      }

      const hasAccess =
        project.owner.toString() === userId ||
        project.collaborators.some((c: any) => c.userId.toString() === userId)

      if (!hasAccess && !project.isPublic) {
        throw new AuthorizationError('Access denied')
      }

      const files = await File.find({
        project: projectId,
        isDeleted: false,
      })
        .populate('owner', 'name email')
        .populate('lastModifiedBy', 'name email')

      return files
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Get project files error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Update file content
   */
  async updateFileContent(
    fileId: string,
    userId: string,
    content: string,
    message?: string
  ): Promise<IFile> {
    try {
      const file = await this.getFile(fileId, userId)

      // Check if user can edit (owner or contributor)
      const project = await Project.findById(file.project)
      if (!project) {
        throw new NotFoundError('Project')
      }

      const isOwner = project.owner.toString() === userId
      const isContributor = project.collaborators.some(
        (c: any) => c.userId.toString() === userId && (c.role === 'owner' || c.role === 'contributor')
      )

      if (!isOwner && !isContributor) {
        throw new AuthorizationError('Permission denied to edit file')
      }

      // Store old content for audit
      const oldContent = file.content

      // Update file
      file.content = content
      file.size = content.length
      file.isDirty = true
      file.lastModifiedBy = userId as any
      file.lineCount = content.split('\n').length

      // Create new version
      const newVersionNumber = (file.currentVersion || 0) + 1
      file.versions.push({
        versionNumber: newVersionNumber,
        content,
        author: userId as any,
        message: message || 'File updated',
        createdAt: new Date(),
      })

      file.currentVersion = newVersionNumber

      // Keep only last 50 versions
      if (file.versions.length > 50) {
        file.versions = file.versions.slice(-50)
      }

      await file.save()

      // Update project stats
      project.stats.totalLines =
        (project.stats.totalLines || 0) - oldContent.split('\n').length + file.lineCount
      project.stats.lastActivity = new Date()
      project.lastModified = new Date()
      await project.save()

      // Log audit
      await this.logAudit(userId, 'UPDATE', 'FILE', fileId)

      logger.info('File updated', 'FILE_SERVICE', { fileId, userId, versionNumber: newVersionNumber })

      return file
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Update file error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Rename file
   */
  async renameFile(fileId: string, userId: string, newName: string): Promise<IFile> {
    try {
      const file = await this.getFile(fileId, userId)

      // Check ownership
      if (file.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only file owner can rename file')
      }

      if (!isValidFileName(newName)) {
        throw new ValidationError('Invalid file name')
      }

      const oldName = file.name
      file.name = newName
      file.path = file.path.replace(oldName, newName)
      await file.save()

      // Log audit
      await this.logAudit(userId, 'UPDATE', 'FILE', fileId, {
        oldName,
        newName,
      })

      logger.info('File renamed', 'FILE_SERVICE', { fileId, oldName, newName })

      return file
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Rename file error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Delete file (soft delete)
   */
  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const file = await this.getFile(fileId, userId)

      // Check ownership
      if (file.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only file owner can delete file')
      }

      // Soft delete
      file.isDeleted = true
      file.deletedAt = new Date()
      await file.save()

      // Remove from project
      const project = await Project.findById(file.project)
      if (project) {
        project.files = project.files.filter((f) => f.toString() !== fileId)
        project.stats.totalFiles = Math.max(0, (project.stats.totalFiles || 1) - 1)
        await project.save()
      }

      // Log audit
      await this.logAudit(userId, 'DELETE', 'FILE', fileId)

      logger.info('File deleted', 'FILE_SERVICE', { fileId, userId })
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Delete file error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Get file version history
   */
  async getFileVersions(fileId: string, userId: string): Promise<any[]> {
    try {
      const file = await this.getFile(fileId, userId)
      return file.versions || []
    } catch (error) {
      logger.error('Get file versions error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Restore file to specific version
   */
  async restoreVersion(fileId: string, userId: string, versionNumber: number): Promise<IFile> {
    try {
      const file = await this.getFile(fileId, userId)

      const version = file.versions.find((v) => v.versionNumber === versionNumber)
      if (!version) {
        throw new ValidationError('Version not found')
      }

      // Update file to version content
      file.content = version.content
      file.size = version.content.length
      file.lineCount = version.content.split('\n').length
      file.isDirty = true
      file.lastModifiedBy = userId as any

      // Create new version pointing to restored content
      const newVersionNumber = (file.currentVersion || 0) + 1
      file.versions.push({
        versionNumber: newVersionNumber,
        content: version.content,
        author: userId as any,
        message: `Restored from version ${versionNumber}`,
        createdAt: new Date(),
      })

      file.currentVersion = newVersionNumber
      await file.save()

      logger.info('File version restored', 'FILE_SERVICE', {
        fileId,
        restoredVersion: versionNumber,
        newVersion: newVersionNumber,
      })

      return file
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Restore version error', 'FILE_SERVICE', error)
      throw error
    }
  }

  /**
   * Log audit trail
   */
  private async logAudit(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes?: any
  ) {
    try {
      const auditLog = new AuditLog({
        userId,
        action,
        resource,
        resourceId,
        changes,
        status: 'success',
      })

      await auditLog.save()
    } catch (error) {
      logger.error('Audit log error', 'FILE_SERVICE', error)
    }
  }
}

export const fileService = new FileService()
