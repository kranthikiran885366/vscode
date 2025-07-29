const express = require("express")
const passport = require("passport")
const crypto = require("crypto")
const speakeasy = require("speakeasy")
const QRCode = require("qrcode")
const User = require("../models/User")
const { body, validationResult } = require("express-validator")
const { authenticateToken } = require("../middleware/auth")
const { sendEmail } = require("../utils/email")
const logger = require("../utils/logger")
const jwt = require("jsonwebtoken") // Import jwt

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username must be 3-30 characters and contain only letters, numbers, and underscores"),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("firstName").trim().isLength({ min: 1 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 1 }).withMessage("Last name is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { username, email, password, firstName, lastName } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? "Email already registered" : "Username already taken",
        })
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        emailVerificationToken: crypto.randomBytes(32).toString("hex"),
      })

      user.updateSubscriptionLimits()
      await user.save()

      // Send verification email
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          template: "email-verification",
          data: {
            name: user.firstName,
            verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`,
          },
        })
      } catch (emailError) {
        logger.error("Failed to send verification email:", emailError)
      }

      // Generate tokens
      const token = user.generateAuthToken()
      const refreshToken = user.generateRefreshToken()

      logger.info(`New user registered: ${user.email}`)

      res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email for verification.",
        data: {
          user: user.toJSON(),
          token,
          refreshToken,
        },
      })
    } catch (error) {
      logger.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty().withMessage("Password is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password, twoFactorCode } = req.body

      // Find user
      const user = await User.findOne({ email })
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        })
      }

      // Two-factor authentication check
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            message: "Two-factor authentication code required",
          })
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: twoFactorCode,
          window: 2,
        })

        if (!verified) {
          return res.status(401).json({
            success: false,
            message: "Invalid two-factor authentication code",
          })
        }
      }

      // Update login info
      user.lastLogin = new Date()
      user.loginCount += 1
      await user.save()

      // Generate tokens
      const token = user.generateAuthToken()
      const refreshToken = user.generateRefreshToken()

      logger.info(`User logged in: ${user.email}`)

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          token,
          refreshToken,
        },
      })
    } catch (error) {
      logger.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
  try {
    const token = req.user.generateAuthToken()
    const refreshToken = req.user.generateRefreshToken()

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&refresh=${refreshToken}`)
  } catch (error) {
    logger.error("Google OAuth callback error:", error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }))

router.get("/github/callback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
  try {
    const token = req.user.generateAuthToken()
    const refreshToken = req.user.generateRefreshToken()

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&refresh=${refreshToken}`)
  } catch (error) {
    logger.error("GitHub OAuth callback error:", error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      })
    }

    const newToken = user.generateAuthToken()
    const newRefreshToken = user.generateRefreshToken()

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    logger.error("Token refresh error:", error)
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    })
  }
})

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // In a production environment, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    logger.error("Logout error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Verify email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body

    const user = await User.findOne({ emailVerificationToken: token })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      })
    }

    user.emailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    logger.info(`Email verified for user: ${user.email}`)

    res.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error) {
    logger.error("Email verification error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Setup 2FA
router.post("/setup-2fa", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    const secret = speakeasy.generateSecret({
      name: `CodePlatform (${user.email})`,
      issuer: "CodePlatform",
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url)

    // Temporarily store the secret (don't save to DB yet)
    req.session.tempTwoFactorSecret = secret.base32

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
      },
    })
  } catch (error) {
    logger.error("2FA setup error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Verify and enable 2FA
router.post("/verify-2fa", authenticateToken, async (req, res) => {
  try {
    const { code } = req.body
    const tempSecret = req.session.tempTwoFactorSecret

    if (!tempSecret) {
      return res.status(400).json({
        success: false,
        message: "No 2FA setup in progress",
      })
    }

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token: code,
      window: 2,
    })

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      })
    }

    // Save the secret and enable 2FA
    const user = await User.findById(req.user.userId)
    user.twoFactorSecret = tempSecret
    user.twoFactorEnabled = true
    await user.save()

    // Clear temporary secret
    delete req.session.tempTwoFactorSecret

    logger.info(`2FA enabled for user: ${user.email}`)

    res.json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    })
  } catch (error) {
    logger.error("2FA verification error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Disable 2FA
router.post(
  "/disable-2fa",
  authenticateToken,
  [body("password").notEmpty().withMessage("Password is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { password } = req.body
      const user = await User.findById(req.user.userId)

      if (!(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        })
      }

      user.twoFactorSecret = undefined
      user.twoFactorEnabled = false
      await user.save()

      logger.info(`2FA disabled for user: ${user.email}`)

      res.json({
        success: true,
        message: "Two-factor authentication disabled successfully",
      })
    } catch (error) {
      logger.error("2FA disable error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },
)

module.exports = router
