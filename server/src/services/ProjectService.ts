import Project, { IProject } from '../models/Project'
import File from '../models/File'
import User from '../models/User'
import AuditLog from '../models/AuditLog'
import { ValidationError, AuthorizationError, NotFoundError } from '../utils/errors'
import { isValidProjectName, isValidObjectId } from '../utils/validators'
import { logger } from '../utils/logger'

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(
    userId: string,
    name: string,
    description?: string,
    language?: string
  ): Promise<IProject> {
    try {
      if (!isValidProjectName(name)) {
        throw new ValidationError('Invalid project name')
      }

      const project = new Project({
        name,
        description: description || '',
        owner: userId,
        language: language || 'javascript',
        visibility: 'private',
      })

      await project.save()

      // Create default README file
      const readme = new File({
        name: 'README.md',
        path: `/README.md`,
        project: project._id,
        owner: userId,
        content: `# ${name}\n\n${description || 'A new project'}\n`,
        language: 'markdown',
        lastModifiedBy: userId,
      })

      await readme.save()
      project.files.push(readme._id as any)
      project.stats.totalFiles = 1
      await project.save()

      // Log audit
      await this.logAudit(userId, 'CREATE', 'PROJECT', project._id.toString())

      logger.info('Project created', 'PROJECT_SERVICE', { projectId: project._id, userId })

      return project
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      logger.error('Create project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Get project by ID with access check
   */
  async getProject(projectId: string, userId: string, bypassAuth: boolean = false): Promise<IProject> {
    try {
      if (!isValidObjectId(projectId)) {
        throw new ValidationError('Invalid project ID')
      }

      const project = await Project.findById(projectId)
        .populate('owner', 'name email avatar')
        .populate('files')

      if (!project) {
        throw new NotFoundError('Project')
      }

      // Check access
      if (!bypassAuth && !this.hasProjectAccess(project, userId)) {
        throw new AuthorizationError('Access denied')
      }

      return project
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Get project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Get all user projects
   */
  async getUserProjects(
    userId: string,
    options: { includeArchived?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ projects: IProject[]; total: number }> {
    try {
      const { includeArchived = false, limit = 50, offset = 0 } = options

      const query: any = {
        $or: [
          { owner: userId },
          { 'collaborators.userId': userId },
        ],
      }

      if (!includeArchived) {
        query.isArchived = false
      }

      const projects = await Project.find(query)
        .populate('owner', 'name email avatar')
        .sort({ lastModified: -1 })
        .limit(limit)
        .skip(offset)

      const total = await Project.countDocuments(query)

      return { projects, total }
    } catch (error) {
      logger.error('Get user projects error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    updates: Partial<IProject>
  ): Promise<IProject> {
    try {
      const project = await this.getProject(projectId, userId)

      // Check if user is owner
      if (project.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only project owner can update project')
      }

      // Update allowed fields
      if (updates.name) {
        if (!isValidProjectName(updates.name)) {
          throw new ValidationError('Invalid project name')
        }
        project.name = updates.name
      }

      if (updates.description !== undefined) {
        project.description = updates.description
      }

      if (updates.visibility) {
        project.visibility = updates.visibility
      }

      if (updates.settings) {
        project.settings = { ...project.settings, ...updates.settings }
      }

      if (updates.tags) {
        project.tags = updates.tags
      }

      project.lastModified = new Date()
      await project.save()

      // Log audit
      await this.logAudit(userId, 'UPDATE', 'PROJECT', projectId, {
        before: { name: project.name },
        after: updates,
      })

      logger.info('Project updated', 'PROJECT_SERVICE', { projectId, userId })

      return project
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Update project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      const project = await this.getProject(projectId, userId)

      // Check if user is owner
      if (project.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only project owner can delete project')
      }

      // Delete all files
      await File.deleteMany({ project: projectId })

      // Delete project
      await Project.findByIdAndDelete(projectId)

      // Log audit
      await this.logAudit(userId, 'DELETE', 'PROJECT', projectId)

      logger.info('Project deleted', 'PROJECT_SERVICE', { projectId, userId })
    } catch (error) {
      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Delete project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Add collaborator
   */
  async addCollaborator(
    projectId: string,
    userId: string,
    collaboratorEmail: string,
    role: 'contributor' | 'viewer' = 'contributor'
  ): Promise<IProject> {
    try {
      const project = await this.getProject(projectId, userId)

      // Check ownership
      if (project.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only project owner can add collaborators')
      }

      // Find collaborator user
      const collaborator = await User.findOne({ email: collaboratorEmail.toLowerCase() })
      if (!collaborator) {
        throw new NotFoundError('User with that email')
      }

      // Check if already collaborator
      const isAlreadyCollaborator = project.collaborators.some(
        (c) => c.userId.toString() === collaborator._id.toString()
      )

      if (isAlreadyCollaborator) {
        throw new ValidationError('User is already a collaborator')
      }

      // Add collaborator
      project.collaborators.push({
        userId: collaborator._id as any,
        role,
        addedAt: new Date(),
      })

      await project.save()

      // Log audit
      await this.logAudit(userId, 'SHARE', 'PROJECT', projectId, {
        collaborator: collaboratorEmail,
        role,
      })

      logger.info('Collaborator added', 'PROJECT_SERVICE', {
        projectId,
        collaborator: collaboratorEmail,
      })

      return project
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Add collaborator error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Remove collaborator
   */
  async removeCollaborator(
    projectId: string,
    userId: string,
    collaboratorId: string
  ): Promise<IProject> {
    try {
      const project = await this.getProject(projectId, userId)

      // Check ownership
      if (project.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only project owner can remove collaborators')
      }

      project.collaborators = project.collaborators.filter(
        (c) => c.userId.toString() !== collaboratorId
      )

      await project.save()

      // Log audit
      await this.logAudit(userId, 'UPDATE', 'PROJECT', projectId, {
        action: 'removed_collaborator',
        collaboratorId,
      })

      logger.info('Collaborator removed', 'PROJECT_SERVICE', {
        projectId,
        collaboratorId,
      })

      return project
    } catch (error) {
      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Remove collaborator error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Check if user has access to project
   */
  private hasProjectAccess(project: any, userId: string): boolean {
    if (project.owner._id.toString() === userId) {
      return true
    }

    if (project.visibility === 'public') {
      return true
    }

    return project.collaborators.some((c: any) => c.userId.toString() === userId)
  }

  /**
   * Archive project
   */
  async archiveProject(projectId: string, userId: string): Promise<IProject> {
    try {
      const project = await this.getProject(projectId, userId)

      if (project.owner._id.toString() !== userId) {
        throw new AuthorizationError('Only project owner can archive project')
      }

      project.isArchived = true
      await project.save()

      await this.logAudit(userId, 'ARCHIVE', 'PROJECT', projectId)

      logger.info('Project archived', 'PROJECT_SERVICE', { projectId, userId })

      return project
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Archive project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Restore archived project
   */
  async restoreProject(projectId: string, userId: string): Promise<IProject> {
    try {
      if (!isValidObjectId(projectId)) {
        throw new ValidationError('Invalid project ID')
      }

      const project = await Project.findById(projectId)
      if (!project) {
        throw new NotFoundError('Project')
      }

      if (project.owner.toString() !== userId) {
        throw new AuthorizationError('Only project owner can restore project')
      }

      project.isArchived = false
      await project.save()

      await this.logAudit(userId, 'RESTORE', 'PROJECT', projectId)

      logger.info('Project restored', 'PROJECT_SERVICE', { projectId, userId })

      return project
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Restore project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Search projects
   */
  async searchProjects(
    userId: string,
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ projects: IProject[]; total: number }> {
    try {
      const { limit = 20, offset = 0 } = options

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
        $and: [
          {
            $or: [
              { owner: userId },
              { 'collaborators.userId': userId },
            ],
          },
        ],
      }

      const projects = await Project.find(searchQuery)
        .populate('owner', 'name email avatar')
        .sort({ lastModified: -1 })
        .limit(limit)
        .skip(offset)

      const total = await Project.countDocuments(searchQuery)

      logger.info('Projects searched', 'PROJECT_SERVICE', { userId, query, total })

      return { projects, total }
    } catch (error) {
      logger.error('Search projects error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Export project data
   */
  async exportProject(projectId: string, userId: string): Promise<string> {
    try {
      const project = await this.getProject(projectId, userId)

      const files = await File.find({ project: projectId })

      const exportData = {
        project: {
          name: project.name,
          description: project.description,
          language: project.language,
          tags: project.tags,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
        files: files.map((f) => ({
          name: f.name,
          path: f.path,
          content: f.content,
          language: f.language,
          lineCount: f.lineCount,
        })),
      }

      await this.logAudit(userId, 'EXPORT', 'PROJECT', projectId)

      logger.info('Project exported', 'PROJECT_SERVICE', { projectId, userId })

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Export project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Duplicate project
   */
  async duplicateProject(projectId: string, userId: string): Promise<IProject> {
    try {
      const originalProject = await this.getProject(projectId, userId)

      // Create new project
      const newProject = new Project({
        name: `${originalProject.name} (Copy)`,
        description: originalProject.description,
        owner: userId,
        language: originalProject.language,
        visibility: 'private',
        tags: originalProject.tags,
      })

      await newProject.save()

      // Copy files
      const originalFiles = await File.find({ project: projectId })
      for (const file of originalFiles) {
        const newFile = new File({
          name: file.name,
          path: file.path,
          project: newProject._id,
          owner: userId,
          content: file.content,
          language: file.language,
          lastModifiedBy: userId,
        })

        await newFile.save()
        newProject.files.push(newFile._id as any)
      }

      newProject.stats.totalFiles = originalFiles.length
      await newProject.save()

      await this.logAudit(userId, 'DUPLICATE', 'PROJECT', projectId, {
        newProjectId: newProject._id,
      })

      logger.info('Project duplicated', 'PROJECT_SERVICE', {
        originalProjectId: projectId,
        newProjectId: newProject._id,
        userId,
      })

      return newProject
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Duplicate project error', 'PROJECT_SERVICE', error)
      throw error
    }
  }

  /**
   * Update project stats
   */
  async updateProjectStats(projectId: string): Promise<void> {
    try {
      const files = await File.find({ project: projectId, isDeleted: false })

      let totalLines = 0
      for (const file of files) {
        totalLines += file.lineCount || 0
      }

      await Project.findByIdAndUpdate(
        projectId,
        {
          'stats.totalFiles': files.length,
          'stats.totalLines': totalLines,
          'stats.lastActivity': new Date(),
        },
        { new: true }
      )

      logger.debug('Project stats updated', 'PROJECT_SERVICE', { projectId })
    } catch (error) {
      logger.error('Update project stats error', 'PROJECT_SERVICE', error)
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
      logger.error('Audit log error', 'PROJECT_SERVICE', error)
    }
  }
}

export const projectService = new ProjectService()
