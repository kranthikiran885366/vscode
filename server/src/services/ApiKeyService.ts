import crypto from 'crypto'
import { logger } from '../utils/logger'
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors'

export interface ApiKeyData {
  id: string
  userId: string
  key: string
  name: string
  description?: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: Date
  createdAt: Date
  expiresAt?: Date
  rateLimit?: number
}

// In production, use a database model instead of in-memory storage
const apiKeys: Map<string, ApiKeyData> = new Map()

export class ApiKeyService {
  /**
   * Generate a new API key
   */
  async generateApiKey(
    userId: string,
    name: string,
    description?: string,
    permissions: string[] = [],
    expiresAt?: Date
  ): Promise<{ id: string; key: string; apiKey: ApiKeyData }> {
    try {
      if (!name || name.trim().length === 0) {
        throw new ValidationError('API key name is required')
      }

      if (permissions.length === 0) {
        throw new ValidationError('At least one permission must be specified')
      }

      // Generate random API key
      const keyId = crypto.randomBytes(12).toString('hex')
      const keySecret = crypto.randomBytes(32).toString('hex')
      const key = `sk_${keyId}_${keySecret}`

      const apiKey: ApiKeyData = {
        id: keyId,
        userId,
        key,
        name,
        description,
        permissions,
        isActive: true,
        createdAt: new Date(),
        expiresAt,
      }

      // Store API key (in production, encrypt and store in database)
      apiKeys.set(keyId, apiKey)

      logger.info('API key generated', 'API_KEY_SERVICE', {
        userId,
        keyId,
      })

      return {
        id: keyId,
        key, // Only return full key at creation time
        apiKey,
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }
      logger.error('Generate API key error', 'API_KEY_SERVICE', error)
      throw error
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(key: string): Promise<ApiKeyData | null> {
    try {
      // Extract key ID from key format: sk_<id>_<secret>
      const parts = key.split('_')
      if (parts.length !== 3 || parts[0] !== 'sk') {
        return null
      }

      const keyId = parts[1]
      const apiKey = apiKeys.get(keyId)

      if (!apiKey) {
        return null
      }

      // Check if key is active
      if (!apiKey.isActive) {
        return null
      }

      // Check if key has expired
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return null
      }

      // Verify the full key matches (constant time comparison to prevent timing attacks)
      if (!crypto.timingSafeEqual(Buffer.from(apiKey.key), Buffer.from(key))) {
        return null
      }

      // Update last used timestamp
      apiKey.lastUsedAt = new Date()

      return apiKey
    } catch (error) {
      logger.error('Validate API key error', 'API_KEY_SERVICE', error)
      return null
    }
  }

  /**
   * Get user's API keys
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
    try {
      const keys: ApiKeyData[] = []
      for (const [, apiKey] of apiKeys) {
        if (apiKey.userId === userId) {
          // Don't return full key in list view
          keys.push({
            ...apiKey,
            key: apiKey.key.substring(0, 20) + '...',
          })
        }
      }

      return keys
    } catch (error) {
      logger.error('Get user API keys error', 'API_KEY_SERVICE', error)
      throw error
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    try {
      const apiKey = apiKeys.get(keyId)

      if (!apiKey) {
        throw new NotFoundError('API key')
      }

      if (apiKey.userId !== userId) {
        throw new AuthorizationError('Cannot revoke API key belonging to another user')
      }

      apiKeys.delete(keyId)

      logger.info('API key revoked', 'API_KEY_SERVICE', {
        userId,
        keyId,
      })
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error
      }
      logger.error('Revoke API key error', 'API_KEY_SERVICE', error)
      throw error
    }
  }

  /**
   * Update API key
   */
  async updateApiKey(
    userId: string,
    keyId: string,
    updates: {
      name?: string
      description?: string
      permissions?: string[]
      isActive?: boolean
    }
  ): Promise<ApiKeyData> {
    try {
      const apiKey = apiKeys.get(keyId)

      if (!apiKey) {
        throw new NotFoundError('API key')
      }

      if (apiKey.userId !== userId) {
        throw new AuthorizationError('Cannot update API key belonging to another user')
      }

      if (updates.name) {
        apiKey.name = updates.name
      }

      if (updates.description !== undefined) {
        apiKey.description = updates.description
      }

      if (updates.permissions) {
        apiKey.permissions = updates.permissions
      }

      if (updates.isActive !== undefined) {
        apiKey.isActive = updates.isActive
      }

      logger.info('API key updated', 'API_KEY_SERVICE', {
        userId,
        keyId,
      })

      return apiKey
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error
      }
      logger.error('Update API key error', 'API_KEY_SERVICE', error)
      throw error
    }
  }

  /**
   * Check if API key has permission
   */
  hasPermission(apiKey: ApiKeyData, requiredPermission: string): boolean {
    return apiKey.permissions.includes(requiredPermission) || apiKey.permissions.includes('*')
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(userId: string, keyId: string): Promise<any> {
    try {
      const apiKey = apiKeys.get(keyId)

      if (!apiKey) {
        throw new NotFoundError('API key')
      }

      if (apiKey.userId !== userId) {
        throw new AuthorizationError('Cannot access stats for API key belonging to another user')
      }

      return {
        keyId,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
        isActive: apiKey.isActive,
        permissions: apiKey.permissions,
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AuthorizationError) {
        throw error
      }
      logger.error('Get API key stats error', 'API_KEY_SERVICE', error)
      throw error
    }
  }
}

export const apiKeyService = new ApiKeyService()
