import AuditLog from '../models/AuditLog'
import { logger } from '../utils/logger'

export interface AuditEntry {
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  status: 'success' | 'failure'
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
  timestamp: Date
}

export class SecurityService {
  /**
   * Log audit entry
   */
  async logAuditEntry(
    userId: string,
    userName: string,
    action: string,
    resource: string,
    resourceId: string,
    status: 'success' | 'failure',
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const entry = new AuditLog({
        userId,
        userName,
        action,
        resource,
        resourceId,
        status,
        ipAddress,
        userAgent,
        metadata,
        timestamp: new Date(),
      })

      await entry.save()
      logger.info('Audit logged', 'SECURITY_SERVICE', {
        userId,
        action,
        status,
      })
    } catch (error) {
      logger.error('Log audit error', 'SECURITY_SERVICE', error)
    }
  }

  /**
   * Get audit logs for user
   */
  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditEntry[]> {
    try {
      const logs = await AuditLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)

      return logs.map((log) => log.toObject())
    } catch (error) {
      logger.error('Get user audit logs error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Get audit logs for resource
   */
  async getResourceAuditLogs(resourceId: string, limit: number = 100): Promise<AuditEntry[]> {
    try {
      const logs = await AuditLog.find({ resourceId })
        .sort({ timestamp: -1 })
        .limit(limit)

      return logs.map((log) => log.toObject())
    } catch (error) {
      logger.error('Get resource audit logs error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Get recent failed login attempts
   */
  async getFailedLoginAttempts(
    userId: string,
    minutes: number = 60
  ): Promise<AuditEntry[]> {
    try {
      const cutoff = new Date(Date.now() - minutes * 60 * 1000)

      const logs = await AuditLog.find({
        userId,
        action: 'login',
        status: 'failure',
        timestamp: { $gte: cutoff },
      }).sort({ timestamp: -1 })

      return logs.map((log) => log.toObject())
    } catch (error) {
      logger.error('Get failed login attempts error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Check if account is locked due to failed attempts
   */
  async isAccountLocked(userId: string, maxAttempts: number = 5): Promise<boolean> {
    try {
      const attempts = await this.getFailedLoginAttempts(userId, 60)
      return attempts.length >= maxAttempts
    } catch (error) {
      logger.error('Check account locked error', 'SECURITY_SERVICE', error)
      return false
    }
  }

  /**
   * Get security report
   */
  async getSecurityReport(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const logs = await AuditLog.find({
        userId,
        timestamp: { $gte: startDate },
      })

      const successCount = logs.filter((l) => l.status === 'success').length
      const failureCount = logs.filter((l) => l.status === 'failure').length
      const actionBreakdown = this.getActionCounts(logs)
      const failedActions = logs.filter((l) => l.status === 'failure')

      return {
        userId,
        period: `${days} days`,
        totalEvents: logs.length,
        successCount,
        failureCount,
        successRate: logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(2) : 0,
        actionBreakdown,
        failedActions: failedActions.map((l) => ({
          action: l.action,
          resource: l.resource,
          timestamp: l.timestamp,
          ipAddress: l.ipAddress,
        })),
      }
    } catch (error) {
      logger.error('Get security report error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(userId: string): Promise<{
    isSuspicious: boolean
    alerts: string[]
  }> {
    try {
      const alerts: string[] = []

      // Check for multiple failed login attempts
      const failedAttempts = await this.getFailedLoginAttempts(userId, 60)
      if (failedAttempts.length >= 3) {
        alerts.push('Multiple failed login attempts detected')
      }

      // Check for unusual access times
      const oneHourAgo = new Date(Date.now() - 3600000)
      const recentLogs = await AuditLog.find({
        userId,
        timestamp: { $gte: oneHourAgo },
      })

      if (recentLogs.length > 100) {
        alerts.push('Unusual access frequency detected')
      }

      // Check for multiple IP addresses
      const uniqueIPs = new Set(
        recentLogs.map((l) => l.ipAddress).filter((ip) => ip)
      )
      if (uniqueIPs.size > 5) {
        alerts.push('Multiple IP addresses detected')
      }

      return {
        isSuspicious: alerts.length > 0,
        alerts,
      }
    } catch (error) {
      logger.error('Detect suspicious activity error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanup(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
      })

      logger.info('Audit logs cleanup completed', 'SECURITY_SERVICE', {
        deletedCount: result.deletedCount,
      })

      return result.deletedCount || 0
    } catch (error) {
      logger.error('Audit cleanup error', 'SECURITY_SERVICE', error)
      throw error
    }
  }

  /**
   * Helper: Count actions
   */
  private getActionCounts(logs: any[]): Record<string, number> {
    return logs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }
}

export const securityService = new SecurityService()
