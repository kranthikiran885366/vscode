import { logger } from '../utils/logger'
import { ValidationError, NotFoundError, AuthorizationError, ConflictError } from '../utils/errors'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  owner: string
  members: OrganizationMember[]
  settings: OrganizationSettings
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationMember {
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
  invitedBy?: string
  invitedAt?: Date
  status: 'active' | 'invited' | 'pending'
}

export interface OrganizationSettings {
  publicProjects: boolean
  requireEmailVerification: boolean
  twoFactorRequired: boolean
  maxMembers?: number
  maxProjects?: number
  apiRateLimit?: number
}

// In production, use a database model instead of in-memory storage
const organizations: Map<string, Organization> = new Map()

export class OrganizationService {
  /**
   * Create a new organization
   */
  async createOrganization(
    userId: string,
    name: string,
    slug: string,
    description?: string
  ): Promise<Organization> {
    try {
      if (!name || name.trim().length < 2) {
        throw new ValidationError('Organization name must be at least 2 characters')
      }

      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        throw new ValidationError('Invalid organization slug format')
      }

      // Check if slug already exists
      for (const [, org] of organizations) {
        if (org.slug === slug) {
          throw new ConflictError('Organization slug already exists')
        }
      }

      const org: Organization = {
        id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        slug,
        description,
        owner: userId,
        members: [
          {
            userId,
            role: 'owner',
            joinedAt: new Date(),
            status: 'active',
          },
        ],
        settings: {
          publicProjects: false,
          requireEmailVerification: true,
          twoFactorRequired: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      organizations.set(org.id, org)

      logger.info('Organization created', 'ORGANIZATION_SERVICE', {
        organizationId: org.id,
        userId,
      })

      return org
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof ConflictError
      ) {
        throw error
      }
      logger.error('Create organization error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string, userId: string): Promise<Organization> {
    try {
      const org = organizations.get(organizationId)

      if (!org) {
        throw new NotFoundError('Organization')
      }

      // Check if user has access
      const member = org.members.find((m) => m.userId === userId)
      if (!member) {
        throw new AuthorizationError('Access denied')
      }

      return org
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error
      }
      logger.error('Get organization error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      const userOrgs: Organization[] = []

      for (const [, org] of organizations) {
        if (org.members.some((m) => m.userId === userId)) {
          userOrgs.push(org)
        }
      }

      return userOrgs
    } catch (error) {
      logger.error('Get user organizations error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganization(
    organizationId: string,
    userId: string,
    updates: Partial<Organization>
  ): Promise<Organization> {
    try {
      const org = await this.getOrganization(organizationId, userId)

      // Check if user is owner or admin
      const member = org.members.find((m) => m.userId === userId)
      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new AuthorizationError('Insufficient permissions')
      }

      if (updates.name) {
        org.name = updates.name
      }

      if (updates.description !== undefined) {
        org.description = updates.description
      }

      if (updates.settings) {
        org.settings = { ...org.settings, ...updates.settings }
      }

      org.updatedAt = new Date()

      logger.info('Organization updated', 'ORGANIZATION_SERVICE', {
        organizationId,
        userId,
      })

      return org
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error
      }
      logger.error('Update organization error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Add member to organization
   */
  async inviteMember(
    organizationId: string,
    userId: string,
    memberEmail: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<Organization> {
    try {
      const org = await this.getOrganization(organizationId, userId)

      // Check if user is owner
      const member = org.members.find((m) => m.userId === userId)
      if (member?.role !== 'owner') {
        throw new AuthorizationError('Only owner can invite members')
      }

      // Check max members
      if (org.settings.maxMembers && org.members.length >= org.settings.maxMembers) {
        throw new ValidationError('Maximum members limit reached')
      }

      // Check if member already exists
      if (org.members.some((m) => m.userId === memberEmail)) {
        throw new ConflictError('Member already exists in organization')
      }

      org.members.push({
        userId: memberEmail,
        role,
        joinedAt: new Date(),
        invitedBy: userId,
        invitedAt: new Date(),
        status: 'invited',
      })

      logger.info('Member invited to organization', 'ORGANIZATION_SERVICE', {
        organizationId,
        memberEmail,
      })

      return org
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError ||
        error instanceof ConflictError
      ) {
        throw error
      }
      logger.error('Invite member error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    organizationId: string,
    userId: string,
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<Organization> {
    try {
      const org = await this.getOrganization(organizationId, userId)

      // Check if user is owner
      const member = org.members.find((m) => m.userId === userId)
      if (member?.role !== 'owner') {
        throw new AuthorizationError('Only owner can update member roles')
      }

      const memberToUpdate = org.members.find((m) => m.userId === memberId)
      if (!memberToUpdate) {
        throw new NotFoundError('Member')
      }

      // Prevent removing last owner
      if (memberToUpdate.role === 'owner' && role !== 'owner') {
        const ownerCount = org.members.filter((m) => m.role === 'owner').length
        if (ownerCount === 1) {
          throw new ValidationError('Organization must have at least one owner')
        }
      }

      memberToUpdate.role = role

      logger.info('Member role updated', 'ORGANIZATION_SERVICE', {
        organizationId,
        memberId,
        newRole: role,
      })

      return org
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError
      ) {
        throw error
      }
      logger.error('Update member role error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Remove member from organization
   */
  async removeMember(
    organizationId: string,
    userId: string,
    memberId: string
  ): Promise<Organization> {
    try {
      const org = await this.getOrganization(organizationId, userId)

      // Check if user is owner
      const member = org.members.find((m) => m.userId === userId)
      if (member?.role !== 'owner') {
        throw new AuthorizationError('Only owner can remove members')
      }

      // Prevent removing last owner
      const memberToRemove = org.members.find((m) => m.userId === memberId)
      if (memberToRemove?.role === 'owner') {
        const ownerCount = org.members.filter((m) => m.role === 'owner').length
        if (ownerCount === 1) {
          throw new ValidationError('Cannot remove the last owner')
        }
      }

      org.members = org.members.filter((m) => m.userId !== memberId)

      logger.info('Member removed from organization', 'ORGANIZATION_SERVICE', {
        organizationId,
        memberId,
      })

      return org
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError
      ) {
        throw error
      }
      logger.error('Remove member error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string, userId: string): Promise<void> {
    try {
      const org = await this.getOrganization(organizationId, userId)

      // Check if user is owner
      if (org.owner !== userId) {
        throw new AuthorizationError('Only owner can delete organization')
      }

      organizations.delete(organizationId)

      logger.info('Organization deleted', 'ORGANIZATION_SERVICE', {
        organizationId,
        userId,
      })
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof AuthorizationError
      ) {
        throw error
      }
      logger.error('Delete organization error', 'ORGANIZATION_SERVICE', error)
      throw error
    }
  }
}

export const organizationService = new OrganizationService()
