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
   * Track performance metric
   */
  async trackPerformance(
    userId: string,
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event = new Analytics({
        userId,
        action: 'PERFORMANCE',
        resource: metric,
        resourceId: metric,
        metadata: { value, ...metadata },
        timestamp: new Date(),
      })

      await event.save()

      logger.debug('Performance metric tracked', 'ANALYTICS_SERVICE', {
        userId,
        metric,
        value,
      })
    } catch (error) {
      logger.error('Track performance error', 'ANALYTICS_SERVICE', error)
    }
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(userId: string, days: number = 7): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const events = await Analytics.find({
        userId,
        action: 'PERFORMANCE',
        timestamp: { $gte: startDate },
      })

      const metrics: Record<string, any> = {}

      events.forEach((event) => {
        const metric = event.resource
        if (!metrics[metric]) {
          metrics[metric] = []
        }
        metrics[metric].push((event.metadata as any)?.value || 0)
      })

      const report: Record<string, any> = {}
      Object.entries(metrics).forEach(([metric, values]: [string, any]) => {
        const nums = values as number[]
        report[metric] = {
          count: nums.length,
          average: nums.length > 0 ? (nums.reduce((a: number, b: number) => a + b) / nums.length).toFixed(2) : 0,
          max: Math.max(...nums),
          min: Math.min(...nums),
        }
      })

      return {
        userId,
        period: `${days} days`,
        metrics: report,
      }
    } catch (error) {
      logger.error('Get performance report error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(userId: string): Promise<any> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayEvents = await Analytics.find({
        userId,
        timestamp: { $gte: today },
      })

      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)

      const weekEvents = await Analytics.find({
        userId,
        timestamp: { $gte: thisWeek },
      })

      const thisMonth = new Date()
      thisMonth.setDate(thisMonth.getDate() - 30)

      const monthEvents = await Analytics.find({
        userId,
        timestamp: { $gte: thisMonth },
      })

      return {
        today: {
          eventCount: todayEvents.length,
          topAction: this.getTopItems(todayEvents, 'action', 1)[0]?.name,
        },
        thisWeek: {
          eventCount: weekEvents.length,
          avgPerDay: (weekEvents.length / 7).toFixed(2),
        },
        thisMonth: {
          eventCount: monthEvents.length,
          avgPerDay: (monthEvents.length / 30).toFixed(2),
        },
      }
    } catch (error) {
      logger.error('Get dashboard summary error', 'ANALYTICS_SERVICE', error)
      throw error
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, feature: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const event = new Analytics({
        userId,
        action: 'FEATURE_USE',
        resource: feature,
        resourceId: feature,
        metadata,
        timestamp: new Date(),
      })

      await event.save()

      logger.debug('Feature usage tracked', 'ANALYTICS_SERVICE', {
        userId,
        feature,
      })
    } catch (error) {
      logger.error('Track feature usage error', 'ANALYTICS_SERVICE', error)
    }
  }

  /**
   * Get feature adoption
   */
  async getFeatureAdoption(feature: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const events = await Analytics.find({
        resource: feature,
        action: 'FEATURE_USE',
        timestamp: { $gte: startDate },
      })

      const uniqueUsers = new Set(events.map((e) => e.userId))

      return {
        feature,
        period: `${days} days`,
        totalUsage: events.length,
        uniqueUsers: uniqueUsers.size,
        adoptionRate: `${((uniqueUsers.size / (await Analytics.distinct('userId'))) * 100).toFixed(2)}%`,
      }
    } catch (error) {
      logger.error('Get feature adoption error', 'ANALYTICS_SERVICE', error)
      throw error
    }
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
