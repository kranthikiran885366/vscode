import express, { Router, Request, Response } from 'express'
import { authService } from '../services/AuthService'
import { authMiddleware, requireAuth } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'
import { isValidEmail } from '../utils/validators'
import { logger } from '../utils/logger'

const router: Router = express.Router()

// Apply auth middleware
router.use(authMiddleware)

// Sign up
router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    const { user, tokens } = await authService.register(name, email, password)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: user.toJSON(),
        tokens,
      },
    })
  })
)

// Login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body

    const { user, tokens } = await authService.login(email, password)

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens,
      },
    })
  })
)

// Get current user
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: any, res: Response) => {
    const user = await authService.getUserById(req.user.id)

    res.json({
      success: true,
      data: { user: user?.toJSON() },
    })
  })
)

// Update profile
router.put(
  '/profile',
  requireAuth,
  asyncHandler(async (req: any, res: Response) => {
    const { name, bio, avatar } = req.body

    const user = await authService.updateProfile(req.user.id, {
      name,
      bio,
      avatar,
    })

    res.json({
      success: true,
      message: 'Profile updated',
      data: { user: user.toJSON() },
    })
  })
)

// Change password
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req: any, res: Response) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        code: 'PASSWORDS_DO_NOT_MATCH',
      })
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword)

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  })
)

// Request password reset
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body

    const result = await authService.requestPasswordReset(email)

    // In production, send reset link via email
    // For now, return token (don't do this in production!)
    res.json({
      success: true,
      message: 'Password reset email sent',
      ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken }),
    })
  })
)

// Reset password with token
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { resetToken, newPassword, confirmPassword } = req.body

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
        code: 'PASSWORDS_DO_NOT_MATCH',
      })
    }

    await authService.resetPassword(resetToken, newPassword)

    res.json({
      success: true,
      message: 'Password reset successfully',
    })
  })
)

// Logout (client-side token removal)
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

export default router
