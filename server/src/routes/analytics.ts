import express, { Router, Response } from 'express'
import { analyticsService } from '../services/AnalyticsService'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest, requireAuth } from '../middleware/auth'

const router: Router = express.Router()

// Track an event (internal use)
router.post(
  '/events',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { action, resource, resourceId, metadata } = req.body

    await analyticsService.trackEvent(
      req.user!.id,
      action,
      resource,
      resourceId,
      metadata
    )

    res.json({
      success: true,
      message: 'Event tracked',
    })
  })
)

// Get user analytics
router.get(
  '/user',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30

    const analytics = await analyticsService.getUserAnalytics(req.user!.id, days)

    res.json({
      success: true,
      data: { analytics },
    })
  })
)

// Get resource analytics
router.get(
  '/resource/:resourceId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { resourceId } = req.params
    const resource = (req.query.resource as string) || 'project'

    const analytics = await analyticsService.getResourceAnalytics(resourceId, resource)

    res.json({
      success: true,
      data: { analytics },
    })
  })
)

// Get organization analytics
router.get(
  '/organization/:organizationId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params
    const days = parseInt(req.query.days as string) || 30

    // Get organization analytics across all members
    const analytics = await analyticsService.getOrganizationAnalytics(organizationId, days)

    res.json({
      success: true,
      data: { analytics },
    })
  })
)

// Get team productivity stats
router.get(
  '/team/productivity/:organizationId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params
    const days = parseInt(req.query.days as string) || 30

    const stats = await analyticsService.getTeamProductivityStats(organizationId, days)

    res.json({
      success: true,
      data: { stats },
    })
  })
)

// Get code statistics
router.get(
  '/code-stats/:projectId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const stats = await analyticsService.getProjectCodeStats(projectId)

    res.json({
      success: true,
      data: { stats },
    })
  })
)

export default router
