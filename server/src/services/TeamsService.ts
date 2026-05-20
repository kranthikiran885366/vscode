import Team from '../models/Team'
import { logger } from '../utils/logger'
import { ApiError } from '../types'

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
}

export const teamsService = new TeamsService()
