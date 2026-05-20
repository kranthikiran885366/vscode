import express, { Router, Response } from 'express'
import { organizationService } from '../services/OrganizationService'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest, requireAuth } from '../middleware/auth'

const router: Router = express.Router()

// Create organization
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, slug, description } = req.body

    const organization = await organizationService.createOrganization(
      req.user!.id,
      name,
      slug,
      description
    )

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: { organization },
    })
  })
)

// Get user's organizations
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const organizations = await organizationService.getUserOrganizations(req.user!.id)

    res.json({
      success: true,
      data: { organizations },
    })
  })
)

// Get organization details
router.get(
  '/:organizationId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params

    const organization = await organizationService.getOrganization(organizationId, req.user!.id)

    res.json({
      success: true,
      data: { organization },
    })
  })
)

// Update organization
router.put(
  '/:organizationId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params
    const updates = req.body

    const organization = await organizationService.updateOrganization(
      organizationId,
      req.user!.id,
      updates
    )

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization },
    })
  })
)

// Invite member to organization
router.post(
  '/:organizationId/members/invite',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params
    const { email, role = 'member' } = req.body

    const organization = await organizationService.inviteMember(
      organizationId,
      req.user!.id,
      email,
      role
    )

    res.json({
      success: true,
      message: 'Member invited successfully',
      data: { organization },
    })
  })
)

// Update member role
router.put(
  '/:organizationId/members/:memberId/role',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId, memberId } = req.params
    const { role } = req.body

    const organization = await organizationService.updateMemberRole(
      organizationId,
      req.user!.id,
      memberId,
      role
    )

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: { organization },
    })
  })
)

// Remove member from organization
router.delete(
  '/:organizationId/members/:memberId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId, memberId } = req.params

    const organization = await organizationService.removeMember(
      organizationId,
      req.user!.id,
      memberId
    )

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { organization },
    })
  })
)

// Delete organization
router.delete(
  '/:organizationId',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { organizationId } = req.params

    await organizationService.deleteOrganization(organizationId, req.user!.id)

    res.json({
      success: true,
      message: 'Organization deleted successfully',
    })
  })
)

export default router
