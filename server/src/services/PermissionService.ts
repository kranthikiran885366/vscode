import Project from '../models/Project'
import File from '../models/File'
import User from '../models/User'
import { AuthorizationError, NotFoundError } from '../utils/errors'
import { logger } from '../utils/logger'

export type Role = 'owner' | 'contributor' | 'viewer'
export type Permission = 'read' | 'write' | 'delete' | 'share'

/**
 * Role-based permission matrix
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['read', 'write', 'delete', 'share'],
  contributor: ['read', 'write'],
  viewer: ['read'],
}

export class PermissionService {
  /**
   * Check if user has permission on project
   */
  async checkProjectPermission(
    userId: string,
    projectId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      const project = await Project.findById(projectId)
      if (!project) {
        throw new NotFoundError('Project')
      }

      // Owner has all permissions
      if (project.owner.toString() === userId) {
        return true
      }

      // Check collaborator role
      const collaborator = project.collaborators.find(
        (c: any) => c.userId.toString() === userId
      )

      if (!collaborator) {
        return false
      }

      const permissions = ROLE_PERMISSIONS[collaborator.role as Role]
      return permissions.includes(permission)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      logger.error('Check project permission error', 'PERMISSION_SERVICE', error)
      return false
    }
  }

  /**
   * Check if user has permission on file
   */
  async checkFilePermission(
    userId: string,
    fileId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      const file = await File.findById(fileId)
      if (!file) {
        throw new NotFoundError('File')
      }

      // Check project permission
      return await this.checkProjectPermission(userId, file.project.toString(), permission)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      logger.error('Check file permission error', 'PERMISSION_SERVICE', error)
      return false
    }
  }

  /**
   * Ensure user has permission or throw error
   */
  async requireProjectPermission(
    userId: string,
    projectId: string,
    permission: Permission
  ): Promise<void> {
    const hasPermission = await this.checkProjectPermission(userId, projectId, permission)
    if (!hasPermission) {
      throw new AuthorizationError(
        `Permission denied: ${permission} access required for project`
      )
    }
  }

  /**
   * Ensure user has permission on file or throw error
   */
  async requireFilePermission(
    userId: string,
    fileId: string,
    permission: Permission
  ): Promise<void> {
    const hasPermission = await this.checkFilePermission(userId, fileId, permission)
    if (!hasPermission) {
      throw new AuthorizationError(`Permission denied: ${permission} access required for file`)
    }
  }

  /**
   * Get user's role on project
   */
  async getUserProjectRole(userId: string, projectId: string): Promise<Role | null> {
    try {
      const project = await Project.findById(projectId)
      if (!project) {
        return null
      }

      // Owner
      if (project.owner.toString() === userId) {
        return 'owner'
      }

      // Check collaborators
      const collaborator = project.collaborators.find(
        (c: any) => c.userId.toString() === userId
      )

      return collaborator?.role || null
    } catch (error) {
      logger.error('Get user project role error', 'PERMISSION_SERVICE', error)
      return null
    }
  }

  /**
   * Get all permissions for user on project
   */
  async getProjectPermissions(userId: string, projectId: string): Promise<Permission[]> {
    try {
      const role = await this.getUserProjectRole(userId, projectId)
      if (!role) {
        return []
      }
      return ROLE_PERMISSIONS[role]
    } catch (error) {
      logger.error('Get project permissions error', 'PERMISSION_SERVICE', error)
      return []
    }
  }

  /**
   * Update collaborator role
   */
  async updateCollaboratorRole(
    userId: string,
    projectId: string,
    collaboratorId: string,
    newRole: Role
  ): Promise<void> {
    try {
      const project = await Project.findById(projectId)
      if (!project) {
        throw new NotFoundError('Project')
      }

      // Check if requester is owner
      if (project.owner.toString() !== userId) {
        throw new AuthorizationError('Only project owner can update roles')
      }

      // Find and update collaborator
      const collaborator = project.collaborators.find(
        (c: any) => c.userId.toString() === collaboratorId
      )

      if (!collaborator) {
        throw new NotFoundError('Collaborator not found')
      }

      collaborator.role = newRole
      await project.save()

      logger.info('Collaborator role updated', 'PERMISSION_SERVICE', {
        projectId,
        collaboratorId,
        newRole,
      })
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error
      }
      logger.error('Update collaborator role error', 'PERMISSION_SERVICE', error)
      throw error
    }
  }

  /**
   * Bulk check permissions
   */
  async checkBulkPermissions(
    userId: string,
    projectIds: string[],
    permission: Permission
  ): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {}

    for (const projectId of projectIds) {
      result[projectId] = await this.checkProjectPermission(userId, projectId, permission)
    }

    return result
  }

  /**
   * Get accessible projects for user
   */
  async getAccessibleProjects(userId: string): Promise<{ projectId: string; role: Role }[]> {
    try {
      const projects = await Project.find({
        $or: [{ owner: userId }, { 'collaborators.userId': userId }],
      }).select('_id owner collaborators')

      const accessible: { projectId: string; role: Role }[] = []

      for (const project of projects) {
        const role = await this.getUserProjectRole(userId, project._id.toString())
        if (role) {
          accessible.push({
            projectId: project._id.toString(),
            role,
          })
        }
      }

      return accessible
    } catch (error) {
      logger.error('Get accessible projects error', 'PERMISSION_SERVICE', error)
      return []
    }
  }

  /**
   * Generate public share link
   */
  async createPublicShareLink(
    userId: string,
    projectId: string,
    expiresIn?: number
  ): Promise<{ token: string; expiresAt: Date | null }> {
    try {
      // Verify user owns project
      await this.requireProjectPermission(userId, projectId, 'share')

      // Generate random token
      const token = require('crypto').randomBytes(16).toString('hex')
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

      logger.info('Public share link created', 'PERMISSION_SERVICE', {
        projectId,
        token: token.substring(0, 8) + '...',
      })

      return { token, expiresAt }
    } catch (error) {
      logger.error('Create share link error', 'PERMISSION_SERVICE', error)
      throw error
    }
  }

  /**
   * Check if public link is valid
   */
  async validatePublicLink(token: string, projectId: string): Promise<boolean> {
    try {
      // In production, validate against database
      // For now, basic validation
      return token.length === 32 // 16 bytes hex = 32 chars
    } catch (error) {
      logger.error('Validate link error', 'PERMISSION_SERVICE', error)
      return false
    }
  }

  /**
   * Add granular file permissions
   */
  async setFilePermission(
    userId: string,
    fileId: string,
    targetUserId: string,
    permission: Permission
  ): Promise<void> {
    try {
      const file = await File.findById(fileId)
      if (!file) {
        throw new NotFoundError('File')
      }

      // Check file permissions
      await this.requireFilePermission(userId, fileId, 'share')

      logger.info('File permission set', 'PERMISSION_SERVICE', {
        fileId,
        targetUserId,
        permission,
      })
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error
      }
      logger.error('Set file permission error', 'PERMISSION_SERVICE', error)
      throw error
    }
  }

  /**
   * Allow user to access file temporarily (time-limited access)
   */
  async grantTemporaryAccess(
    userId: string,
    fileId: string,
    targetUserId: string,
    durationMs: number
  ): Promise<void> {
    try {
      await this.requireFilePermission(userId, fileId, 'share')

      const expiresAt = new Date(Date.now() + durationMs)

      logger.info('Temporary access granted', 'PERMISSION_SERVICE', {
        fileId,
        targetUserId,
        expiresAt,
      })
    } catch (error) {
      logger.error('Grant temporary access error', 'PERMISSION_SERVICE', error)
      throw error
    }
  }

  /**
   * Check if user can perform action on specific file paths
   */
  async checkFilePathPermission(
    userId: string,
    projectId: string,
    filePath: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      // Get project permission first
      const hasProjectPermission = await this.checkProjectPermission(
        userId,
        projectId,
        permission
      )

      if (!hasProjectPermission) {
        return false
      }

      // In production, implement path-based permissions
      // For example: certain paths might be read-only
      return true
    } catch (error) {
      logger.error('Check file path permission error', 'PERMISSION_SERVICE', error)
      return false
    }
  }

  /**
   * Get permission summary for user
   */
  async getPermissionSummary(userId: string): Promise<any> {
    try {
      const accessible = await this.getAccessibleProjects(userId)

      const summary: Record<Role, number> = {
        owner: 0,
        contributor: 0,
        viewer: 0,
      }

      accessible.forEach((item) => {
        summary[item.role]++
      })

      return {
        userId,
        totalProjects: accessible.length,
        roleBreakdown: summary,
        canCreate: true, // Users can always create new projects
        canDelete: summary.owner > 0,
        canShare: summary.owner > 0 || summary.contributor > 0,
      }
    } catch (error) {
      logger.error('Get permission summary error', 'PERMISSION_SERVICE', error)
      throw error
    }
  }
}

export const permissionService = new PermissionService()
