import User, { IUser } from '../models/User'
import { generateTokenPair, TokenPayload } from '../utils/jwt'
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password'
import { isValidEmail } from '../utils/validators'
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors'
import { logger } from '../utils/logger'
import crypto from 'crypto'

export class AuthService {
  /**
   * Register a new user
   */
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Validate inputs
      if (!name || !email || !password) {
        throw new ValidationError('Name, email, and password are required')
      }

      if (!isValidEmail(email)) {
        throw new ValidationError('Invalid email format')
      }

      if (name.length < 2 || name.length > 100) {
        throw new ValidationError('Name must be between 2 and 100 characters')
      }

      const passwordValidation = validatePasswordStrength(password)
      if (!passwordValidation.isValid) {
        throw new ValidationError('Password does not meet requirements', {
          errors: passwordValidation.errors,
        })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        throw new ConflictError('Email already registered')
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        isVerified: false,
        isActive: true,
        role: 'user',
      })

      await user.save()

      logger.info('User registered successfully', 'AUTH_SERVICE', { email })

      // Generate tokens
      const tokenPayload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }

      const tokens = generateTokenPair(tokenPayload)

      return {
        user: user.toJSON() as IUser,
        tokens,
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error
      }
      logger.error('Registration error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new ValidationError('Email and password are required')
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+password +lockUntil +loginAttempts'
      )

      if (!user) {
        throw new AuthenticationError('Invalid email or password')
      }

      // Check if account is locked
      if (user.isLocked()) {
        const lockUntil = user.lockUntil?.getTime() || 0
        const waitMinutes = Math.ceil((lockUntil - Date.now()) / 60000)
        throw new AuthenticationError(
          `Account locked. Please try again in ${waitMinutes} minutes`,
          { retryAfter: waitMinutes * 60 }
        )
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password)
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts()
        throw new AuthenticationError('Invalid email or password')
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts()
      }

      // Update last login
      user.lastLoginAt = new Date()
      await user.save()

      logger.info('User logged in successfully', 'AUTH_SERVICE', { email })

      // Generate tokens
      const tokenPayload: TokenPayload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      }

      const tokens = generateTokenPair(tokenPayload)

      return {
        user: user.toJSON() as IUser,
        tokens,
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error
      }
      logger.error('Login error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password')
      if (!user) {
        throw new NotFoundError('User')
      }

      // Verify old password
      const isOldPasswordValid = await comparePassword(oldPassword, user.password)
      if (!isOldPasswordValid) {
        throw new AuthenticationError('Current password is incorrect')
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new ValidationError('New password does not meet requirements', {
          errors: passwordValidation.errors,
        })
      }

      // Hash and save new password
      const hashedPassword = await hashPassword(newPassword)
      user.password = hashedPassword
      await user.save()

      logger.info('Password changed successfully', 'AUTH_SERVICE', { userId })
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      logger.error('Change password error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+passwordResetToken +passwordResetExpiresAt'
      )
      if (!user) {
        // Don't reveal if email exists
        throw new NotFoundError('User with that email')
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

      // Set token with 1 hour expiry
      user.passwordResetToken = hashedToken
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()

      logger.info('Password reset requested', 'AUTH_SERVICE', { email })

      return { resetToken }
    } catch (error) {
      logger.error('Request password reset error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      // Hash token to find user
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { $gt: new Date() },
      }).select('+passwordResetToken +passwordResetExpiresAt +password')

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token')
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(newPassword)
      if (!passwordValidation.isValid) {
        throw new ValidationError('Password does not meet requirements', {
          errors: passwordValidation.errors,
        })
      }

      // Hash and save new password
      const hashedPassword = await hashPassword(newPassword)
      user.password = hashedPassword
      user.passwordResetToken = undefined as any
      user.passwordResetExpiresAt = undefined as any
      await user.save()

      logger.info('Password reset successfully', 'AUTH_SERVICE')
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError
      ) {
        throw error
      }
      logger.error('Reset password error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId)
      return user
    } catch (error) {
      logger.error('Get user error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; bio?: string; avatar?: string }
  ): Promise<IUser> {
    try {
      if (updates.name && (updates.name.length < 2 || updates.name.length > 100)) {
        throw new ValidationError('Name must be between 2 and 100 characters')
      }

      const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      if (!user) {
        throw new NotFoundError('User')
      }

      logger.info('User profile updated', 'AUTH_SERVICE', { userId })
      return user
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Update profile error', 'AUTH_SERVICE', error)
      throw error
    }
  }
}

export const authService = new AuthService()
