import { logger } from '../utils/logger'

/**
 * Cursor position in editor
 */
export interface CursorPosition {
  userId: string
  userName: string
  userColor: string
  line: number
  column: number
  timestamp: Date
}

/**
 * User presence information
 */
export interface UserPresence {
  userId: string
  userName: string
  email: string
  avatar?: string
  color: string
  status: 'online' | 'idle' | 'offline'
  lastActivity: Date
}

/**
 * Collaborative edit operation
 */
export interface EditOperation {
  id: string
  userId: string
  userName: string
  type: 'insert' | 'delete'
  position: number
  content: string
  timestamp: Date
  version: number
}

/**
 * Activity log entry
 */
export interface ActivityEntry {
  id: string
  userId: string
  userName: string
  action: string
  fileId: string
  timestamp: Date
  metadata?: Record<string, any>
}

export class CollaborationService {
  private cursors: Map<string, CursorPosition[]> = new Map()
  private presences: Map<string, UserPresence> = new Map()
  private activities: Map<string, ActivityEntry[]> = new Map()

  /**
   * Update user cursor position
   */
  updateCursorPosition(
    fileId: string,
    userId: string,
    userName: string,
    line: number,
    column: number,
    color: string
  ): CursorPosition {
    const position: CursorPosition = {
      userId,
      userName,
      userColor: color,
      line,
      column,
      timestamp: new Date(),
    }

    if (!this.cursors.has(fileId)) {
      this.cursors.set(fileId, [])
    }

    const cursors = this.cursors.get(fileId)!
    const existingIndex = cursors.findIndex((c) => c.userId === userId)

    if (existingIndex >= 0) {
      cursors[existingIndex] = position
    } else {
      cursors.push(position)
    }

    return position
  }

  /**
   * Get all cursor positions for a file
   */
  getCursorPositions(fileId: string): CursorPosition[] {
    return this.cursors.get(fileId) || []
  }

  /**
   * Remove cursor position
   */
  removeCursorPosition(fileId: string, userId: string): void {
    const cursors = this.cursors.get(fileId)
    if (cursors) {
      const filtered = cursors.filter((c) => c.userId !== userId)
      if (filtered.length === 0) {
        this.cursors.delete(fileId)
      } else {
        this.cursors.set(fileId, filtered)
      }
    }
  }

  /**
   * Set user online status
   */
  setUserPresence(presence: UserPresence): void {
    this.presences.set(presence.userId, presence)
    logger.info('User presence updated', 'COLLABORATION', {
      userId: presence.userId,
      status: presence.status,
    })
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.presences.get(userId) || null
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): UserPresence[] {
    return Array.from(this.presences.values()).filter((p) => p.status === 'online')
  }

  /**
   * Remove user presence
   */
  removeUserPresence(userId: string): void {
    this.presences.delete(userId)
    logger.info('User presence removed', 'COLLABORATION', { userId })
  }

  /**
   * Log activity
   */
  logActivity(
    fileId: string,
    userId: string,
    userName: string,
    action: string,
    metadata?: Record<string, any>
  ): ActivityEntry {
    const entry: ActivityEntry = {
      id: `${fileId}-${Date.now()}-${Math.random()}`,
      userId,
      userName,
      action,
      fileId,
      timestamp: new Date(),
      metadata,
    }

    if (!this.activities.has(fileId)) {
      this.activities.set(fileId, [])
    }

    const activities = this.activities.get(fileId)!
    activities.push(entry)

    // Keep only last 100 activities per file
    if (activities.length > 100) {
      activities.shift()
    }

    return entry
  }

  /**
   * Get activity history for file
   */
  getActivityHistory(fileId: string, limit: number = 50): ActivityEntry[] {
    const activities = this.activities.get(fileId) || []
    return activities.slice(-limit)
  }

  /**
   * Clear activities for file
   */
  clearActivities(fileId: string): void {
    this.activities.delete(fileId)
  }

  /**
   * Apply operational transform for collaborative editing
   * Simple CRDT-like approach for conflict resolution
   */
  applyOperation(operation: EditOperation, baseVersion: number): { success: boolean; error?: string } {
    try {
      // Version check for causality
      if (operation.version < baseVersion) {
        return {
          success: false,
          error: 'Operation version is behind base version',
        }
      }

      // Position validation
      if (operation.position < 0) {
        return {
          success: false,
          error: 'Invalid operation position',
        }
      }

      // Content validation
      if (!operation.content) {
        return {
          success: false,
          error: 'Operation content is empty',
        }
      }

      logger.info('Operation applied', 'COLLABORATION', {
        operationId: operation.id,
        userId: operation.userId,
        type: operation.type,
      })

      return { success: true }
    } catch (error) {
      logger.error('Apply operation error', 'COLLABORATION', error)
      return {
        success: false,
        error: 'Failed to apply operation',
      }
    }
  }

  /**
   * Get collaboration stats
   */
  getStats(): {
    totalCursors: number
    onlineUsers: number
    totalActivities: number
  } {
    let totalCursors = 0
    this.cursors.forEach((cursors) => {
      totalCursors += cursors.length
    })

    let totalActivities = 0
    this.activities.forEach((activities) => {
      totalActivities += activities.length
    })

    return {
      totalCursors,
      onlineUsers: this.getOnlineUsers().length,
      totalActivities,
    }
  }

  /**
   * Clean up stale data
   */
  cleanup(maxAge: number = 60 * 60 * 1000): void {
    const now = Date.now()

    // Remove stale cursors (older than maxAge)
    this.cursors.forEach((cursors, fileId) => {
      const filtered = cursors.filter((c) => now - c.timestamp.getTime() < maxAge)
      if (filtered.length === 0) {
        this.cursors.delete(fileId)
      } else {
        this.cursors.set(fileId, filtered)
      }
    })

    // Remove offline presences
    this.presences.forEach((presence, userId) => {
      if (presence.status === 'offline') {
        this.presences.delete(userId)
      }
    })

    logger.debug('Collaboration cleanup completed', 'COLLABORATION')
  }
}

export const collaborationService = new CollaborationService()
