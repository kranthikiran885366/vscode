import express, { Router, Response } from 'express'
import { apiKeyService } from '../services/ApiKeyService'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest, requireAuth } from '../middleware/auth'
import { apiKeyLimiter } from '../middleware/rateLimiter'

const router: Router = express.Router()

// Generate new API key
router.post(
  '/',
  requireAuth,
  apiKeyLimiter,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, permissions, expiresAt } = req.body

    const { id, key, apiKey } = await apiKeyService.generateApiKey(
      req.user!.id,
      name,
      description,
      permissions,
      expiresAt ? new Date(expiresAt) : undefined
    )

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        id,
        key, // Only returned at creation time
        apiKey,
      },
    })
  })
)

// Get user's API keys
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const apiKeys = await apiKeyService.getUserApiKeys(req.user!.id)

    res.json({
      success: true,
      data: { apiKeys },
    })
  })
)

// Get API key stats
router.get(
  '/:keyId/stats',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { keyId } = req.params

    const stats = await apiKeyService.getApiKeyStats(req.user!.id, keyId)

    res.json({
      success: true,
      data: { stats },
    })
  })
)

// Update API key
router.put(
  '/:keyId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { keyId } = req.params
    const updates = req.body

    const apiKey = await apiKeyService.updateApiKey(req.user!.id, keyId, updates)

    res.json({
      success: true,
      message: 'API key updated successfully',
      data: { apiKey },
    })
  })
)

// Revoke API key
router.delete(
  '/:keyId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { keyId } = req.params

    await apiKeyService.revokeApiKey(req.user!.id, keyId)

    res.json({
      success: true,
      message: 'API key revoked successfully',
    })
  })
)

export default router
