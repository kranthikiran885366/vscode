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
import nodemailer from 'nodemailer'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export class AuthService {
  private emailTransporter: nodemailer.Transporter

  constructor() {
    // Initialize email transporter with real SMTP configuration
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  }

  /**
   * Send verification email
   */
  private async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@zencode.ai',
        to: email,
        subject: 'Verify Your ZenCode Email Address',
        html: `
          <h2>Welcome to ZenCode AI!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        `,
      })

      logger.info('Verification email sent', 'AUTH_SERVICE', { email })
    } catch (error) {
      logger.error('Failed to send verification email', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Send password reset email
   */
  private async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@zencode.ai',
        to: email,
        subject: 'Reset Your ZenCode Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      })

      logger.info('Password reset email sent', 'AUTH_SERVICE', { email })
    } catch (error) {
      logger.error('Failed to send password reset email', 'AUTH_SERVICE', error)
      throw error
    }
  }

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

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<IUser> {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: { $gt: new Date() },
      })

      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token')
      }

      user.isVerified = true
      user.emailVerificationToken = undefined as any
      user.emailVerificationExpiresAt = undefined as any
      await user.save()

      logger.info('Email verified successfully', 'AUTH_SERVICE', { userId: user._id })
      return user
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      logger.error('Email verification error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+emailVerificationToken +emailVerificationExpiresAt'
      )

      if (!user) {
        throw new NotFoundError('User with that email')
      }

      if (user.isVerified) {
        throw new ValidationError('Email already verified')
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

      user.emailVerificationToken = hashedToken
      user.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await user.save()

      await this.sendVerificationEmail(email, verificationToken)

      logger.info('Verification email resent', 'AUTH_SERVICE', { email })
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Resend verification error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Setup 2FA (Two-Factor Authentication)
   */
  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new NotFoundError('User')
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `ZenCode (${user.email})`,
        issuer: 'ZenCode AI',
      })

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url || '')

      logger.info('2FA setup initiated', 'AUTH_SERVICE', { userId })

      return {
        secret: secret.base32,
        qrCode,
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      logger.error('2FA setup error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Verify and enable 2FA
   */
  async enable2FA(userId: string, secret: string, token: string): Promise<void> {
    try {
      const isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
      })

      if (!isValid) {
        throw new AuthenticationError('Invalid 2FA token')
      }

      const user = await User.findById(userId).select('+twoFactorSecret')
      if (!user) {
        throw new NotFoundError('User')
      }

      user.twoFactorSecret = secret
      user.twoFactorEnabled = true
      await user.save()

      logger.info('2FA enabled successfully', 'AUTH_SERVICE', { userId })
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Enable 2FA error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Verify 2FA token
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret')
      if (!user || !user.twoFactorSecret) {
        throw new NotFoundError('User or 2FA not enabled')
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
      })

      return isValid
    } catch (error) {
      logger.error('2FA verification error', 'AUTH_SERVICE', error)
      return false
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password +twoFactorSecret')
      if (!user) {
        throw new NotFoundError('User')
      }

      // Verify password for security
      const isPasswordValid = await comparePassword(password, user.password)
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid password')
      }

      user.twoFactorEnabled = false
      user.twoFactorSecret = undefined as any
      await user.save()

      logger.info('2FA disabled successfully', 'AUTH_SERVICE', { userId })
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof NotFoundError) {
        throw error
      }
      logger.error('Disable 2FA error', 'AUTH_SERVICE', error)
      throw error
    }
  }

  /**
   * Request password reset and send email
   */
  async requestPasswordResetWithEmail(email: string): Promise<void> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        '+passwordResetToken +passwordResetExpiresAt'
      )
      if (!user) {
        // Don't reveal if email exists
        logger.warn('Password reset requested for non-existent email', 'AUTH_SERVICE', { email })
        return
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

      user.passwordResetToken = hashedToken
      user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()

      // Send email
      await this.sendPasswordResetEmail(email, resetToken)

      logger.info('Password reset email sent', 'AUTH_SERVICE', { email })
    } catch (error) {
      logger.error('Request password reset error', 'AUTH_SERVICE', error)
      throw error
    }
  }
}

export const authService = new AuthService()
