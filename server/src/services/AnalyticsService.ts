import Analytics from '../models/Analytics'
import { logger } from '../utils/logger'

export interface AnalyticsEvent {
  userId: string
  action: string
  resource: string
  resourceId: string
  metadata?: Record<string, any>
  timestamp: Date
}

export class AnalyticsService {
  /**
   * Track an event
   */
  async trackEvent(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event = new Analytics({
        userId,
        action,
        resource,
        resourceId,
        metadata,
        timestamp: new Date(),
      })

      await event.save()
      logger.debug('Event tracked', 'ANALYTICS_SERVICE', { userId, action, resource })
    } catch (error) {
      logger.error('Track event error', 'ANALYTICS_SERVICE', error)
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const events = await Analytics.find({
        userId,
        timestamp: { $gte: startDate },
      })

      const grouped = events.reduce(
        (acc, event) => {
          const date = new Date(event.timestamp).toISOString().split('T')[0]
          if (!acc[date]) acc[date] = []
          acc[date].push(event)
          return acc
        },
        {} as Record<string, any[]>
      )

      return {
        userId,
        period: `${days} days`,
        totalEvents: events.length,
        eventsByDate: grouped,
        topActions: this.getTopItems(events, 'action', 10),
        topResources: this.getTopItems(events, 'resource', 10),
      }
    } catch (error) {
      logger.error('Get user analytics error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get resource analytics
   */
  async getResourceAnalytics(
    resourceId: string,
    resource: string = 'project'
  ): Promise<any> {
    try {
      const events = await Analytics.find({
        resourceId,
        resource,
      })

      return {
        resourceId,
        resource,
        totalEvents: events.length,
        totalUsers: new Set(events.map((e) => e.userId)).size,
        actionBreakdown: this.getItemCounts(events, 'action'),
        eventTimeline: events.map((e) => ({
          action: e.action,
          userId: e.userId,
          timestamp: e.timestamp,
        })),
      }
    } catch (error) {
      logger.error('Get resource analytics error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const events = await Analytics.find({
        timestamp: { $gte: startDate },
      })

      const uniqueUsers = new Set(events.map((e) => e.userId)).size
      const eventsByAction = this.getItemCounts(events, 'action')

      return {
        period: `${days} days`,
        totalEvents: events.length,
        uniqueUsers,
        averageEventsPerUser: (events.length / uniqueUsers).toFixed(2),
        eventsByAction,
        eventsByResource: this.getItemCounts(events, 'resource'),
      }
    } catch (error) {
      logger.error('Get system analytics error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Clean up old events
   */
  async cleanup(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await Analytics.deleteMany({
        timestamp: { $lt: cutoffDate },
      })

      logger.info('Analytics cleanup completed', 'ANALYTICS_SERVICE', {
        deletedCount: result.deletedCount,
      })

      return result.deletedCount || 0
    } catch (error) {
      logger.error('Analytics cleanup error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Helper: Get top items by frequency
   */
  private getTopItems(
    events: any[],
    field: string,
    limit: number = 10
  ): Array<{ name: string; count: number }> {
    const counts = this.getItemCounts(events, field)
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Helper: Count item occurrences
   */
  private getItemCounts(events: any[], field: string): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        const value = event[field]
        acc[value] = (acc[value] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }
}

export const analyticsService = new AnalyticsService()
