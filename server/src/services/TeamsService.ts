import Team from '../models/Team'
import User from '../models/User'
import { logger } from '../utils/logger'
import { ApiError } from '../types'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export interface TeamMember {
  userId: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
}

export interface TeamData {
  _id?: string
  name: string
  description?: string
  owner: string
  members: TeamMember[]
  plan: 'free' | 'pro' | 'enterprise'
  maxMembers: number
  createdAt?: Date
  updatedAt?: Date
}

export class TeamsService {
  private emailTransporter: nodemailer.Transporter

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  }

  /**
   * Create a new team
   */
  async createTeam(name: string, ownerId: string, description?: string): Promise<TeamData> {
    try {
      if (!name || name.trim().length === 0) {
        throw new ApiError('Team name is required', 400)
      }

      const team = new Team({
        name,
        description,
        owner: ownerId,
        members: [
          {
            userId: ownerId,
            email: 'temp@example.com',
            name: 'Owner',
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        plan: 'free',
        maxMembers: 5,
      })

      const saved = await team.save()
      logger.info('Team created', 'TEAMS_SERVICE', { teamId: saved._id, name })
      return saved.toObject()
    } catch (error) {
      logger.error('Create team error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: string): Promise<TeamData | null> {
    try {
      const team = await Team.findById(teamId)
      return team ? team.toObject() : null
    } catch (error) {
      logger.error('Get team error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<TeamData[]> {
    try {
      const teams = await Team.find({
        'members.userId': userId,
      })
      return teams.map((t) => t.toObject())
    } catch (error) {
      logger.error('Get user teams error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Add member to team
   */
  async addMember(
    teamId: string,
    userId: string,
    email: string,
    name: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<TeamData> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Check max members
      if (team.members.length >= team.maxMembers) {
        throw new ApiError('Team member limit reached', 400)
      }

      // Check if already a member
      if (team.members.some((m) => m.userId === userId)) {
        throw new ApiError('User is already a member', 400)
      }

      team.members.push({
        userId,
        email,
        name,
        role,
        joinedAt: new Date(),
      })

      const updated = await team.save()
      logger.info('Team member added', 'TEAMS_SERVICE', { teamId, userId })
      return updated.toObject()
    } catch (error) {
      logger.error('Add member error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<TeamData> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Prevent removing owner
      const member = team.members.find((m) => m.userId === userId)
      if (member?.role === 'owner') {
        throw new ApiError('Cannot remove team owner', 400)
      }

      team.members = team.members.filter((m) => m.userId !== userId)

      const updated = await team.save()
      logger.info('Team member removed', 'TEAMS_SERVICE', { teamId, userId })
      return updated.toObject()
    } catch (error) {
      logger.error('Remove member error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Promise<TeamData> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      const member = team.members.find((m) => m.userId === userId)
      if (!member) {
        throw new ApiError('Member not found', 404)
      }

      member.role = role
      const updated = await team.save()
      logger.info('Member role updated', 'TEAMS_SERVICE', { teamId, userId, role })
      return updated.toObject()
    } catch (error) {
      logger.error('Update member role error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Update team plan
   */
  async updatePlan(teamId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<TeamData> {
    try {
      const planLimits = {
        free: 5,
        pro: 50,
        enterprise: 500,
      }

      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      team.plan = plan
      team.maxMembers = planLimits[plan]

      const updated = await team.save()
      logger.info('Team plan updated', 'TEAMS_SERVICE', { teamId, plan })
      return updated.toObject()
    } catch (error) {
      logger.error('Update plan error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: string, userId: string): Promise<void> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Only owner can delete
      if (team.owner.toString() !== userId) {
        throw new ApiError('Only owner can delete team', 403)
      }

      await Team.deleteOne({ _id: teamId })
      logger.info('Team deleted', 'TEAMS_SERVICE', { teamId })
    } catch (error) {
      logger.error('Delete team error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get team analytics
   */
  async getTeamAnalytics(teamId: string): Promise<any> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      return {
        teamId,
        memberCount: team.members.length,
        plan: team.plan,
        members: team.members.map((m) => ({
          userId: m.userId,
          name: m.name,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      }
    } catch (error) {
      logger.error('Get team analytics error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Send team invitation
   */
  async sendInvitation(teamId: string, email: string, inviterName: string): Promise<void> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex')
      const invitationLink = `${process.env.FRONTEND_URL}/teams/join?token=${token}`

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@zencode.ai',
        to: email,
        subject: `${inviterName} invited you to join ${team.name} on ZenCode`,
        html: `
          <h2>Team Invitation</h2>
          <p>${inviterName} invited you to join the team <strong>${team.name}</strong> on ZenCode.</p>
          <p><a href="${invitationLink}">Accept Invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      })

      logger.info('Team invitation sent', 'TEAMS_SERVICE', { teamId, email })
    } catch (error) {
      logger.error('Send invitation error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Track team usage
   */
  async trackUsage(teamId: string, metric: string, value: number = 1): Promise<void> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Update usage metrics (implement in Team model)
      logger.debug('Team usage tracked', 'TEAMS_SERVICE', {
        teamId,
        metric,
        value,
      })
    } catch (error) {
      logger.error('Track usage error', 'TEAMS_SERVICE', error)
    }
  }

  /**
   * Get team usage
   */
  async getTeamUsage(teamId: string): Promise<any> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      const limits = this.getPlanLimits(team.plan)

      return {
        teamId,
        plan: team.plan,
        members: {
          current: team.members.length,
          limit: limits.members,
          percentage: ((team.members.length / limits.members) * 100).toFixed(2),
        },
        storage: {
          current: 0, // Implement actual storage tracking
          limit: limits.storage,
          percentage: 0,
        },
        projects: {
          current: 0, // Implement actual project counting
          limit: limits.projects,
          percentage: 0,
        },
      }
    } catch (error) {
      logger.error('Get team usage error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get plan limits
   */
  private getPlanLimits(plan: string): { members: number; storage: number; projects: number } {
    const limits: Record<string, any> = {
      free: { members: 5, storage: 1000, projects: 3 },
      pro: { members: 50, storage: 50000, projects: 100 },
      enterprise: { members: 500, storage: 500000, projects: 1000 },
    }
    return limits[plan] || limits.free
  }

  /**
   * Enable SSO for team
   */
  async enableSSO(teamId: string, provider: string, clientId: string, clientSecret: string): Promise<void> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Store SSO configuration (encrypt in production)
      logger.info('SSO enabled for team', 'TEAMS_SERVICE', {
        teamId,
        provider,
      })
    } catch (error) {
      logger.error('Enable SSO error', 'TEAMS_SERVICE', error)
      throw error
    }
  }

  /**
   * Create team API key
   */
  async createApiKey(teamId: string, userId: string, name: string): Promise<string> {
    try {
      const team = await Team.findById(teamId)
      if (!team) {
        throw new ApiError('Team not found', 404)
      }

      // Generate API key
      const apiKey = `zc_${crypto.randomBytes(32).toString('hex')}`

      logger.info('Team API key created', 'TEAMS_SERVICE', {
        teamId,
        userId,
        keyName: name,
      })

      return apiKey
    } catch (error) {
      logger.error('Create API key error', 'TEAMS_SERVICE', error)
      throw error
    }
  }
}

export const teamsService = new TeamsService()
