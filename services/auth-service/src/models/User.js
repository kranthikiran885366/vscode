const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.githubId
      },
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    subscription: {
      type: String,
      enum: ["free", "pro", "team", "enterprise"],
      default: "free",
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "dark",
      },
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        collaboration: { type: Boolean, default: true },
      },
      editor: {
        fontSize: { type: Number, default: 14 },
        tabSize: { type: Number, default: 2 },
        wordWrap: { type: Boolean, default: true },
        minimap: { type: Boolean, default: true },
        autoSave: { type: Boolean, default: true },
      },
    },
    // OAuth fields
    googleId: String,
    githubId: String,
    githubUsername: String,
    // Security
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorSecret: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    // Activity tracking
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Usage limits
    usageLimits: {
      projectsCount: { type: Number, default: 0 },
      maxProjects: { type: Number, default: 5 },
      storageUsed: { type: Number, default: 0 },
      maxStorage: { type: Number, default: 100 * 1024 * 1024 }, // 100MB
      aiRequestsToday: { type: Number, default: 0 },
      maxAiRequests: { type: Number, default: 50 },
      lastAiRequestReset: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ googleId: 1 })
userSchema.index({ githubId: 1 })

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const payload = {
    userId: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    subscription: this.subscription,
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })
}

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const payload = {
    userId: this._id,
    type: "refresh",
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  })
}

// Check if user can create more projects
userSchema.methods.canCreateProject = function () {
  return this.usageLimits.projectsCount < this.usageLimits.maxProjects
}

// Check if user can make AI requests
userSchema.methods.canMakeAiRequest = function () {
  const today = new Date()
  const lastReset = new Date(this.usageLimits.lastAiRequestReset)

  // Reset daily counter if it's a new day
  if (today.toDateString() !== lastReset.toDateString()) {
    this.usageLimits.aiRequestsToday = 0
    this.usageLimits.lastAiRequestReset = today
  }

  return this.usageLimits.aiRequestsToday < this.usageLimits.maxAiRequests
}

// Update usage limits based on subscription
userSchema.methods.updateSubscriptionLimits = function () {
  const limits = {
    free: {
      maxProjects: 5,
      maxStorage: 100 * 1024 * 1024, // 100MB
      maxAiRequests: 50,
    },
    pro: {
      maxProjects: 50,
      maxStorage: 1024 * 1024 * 1024, // 1GB
      maxAiRequests: 500,
    },
    team: {
      maxProjects: 200,
      maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
      maxAiRequests: 2000,
    },
    enterprise: {
      maxProjects: -1, // unlimited
      maxStorage: -1, // unlimited
      maxAiRequests: -1, // unlimited
    },
  }

  const subscriptionLimits = limits[this.subscription] || limits.free
  this.usageLimits.maxProjects = subscriptionLimits.maxProjects
  this.usageLimits.maxStorage = subscriptionLimits.maxStorage
  this.usageLimits.maxAiRequests = subscriptionLimits.maxAiRequests
}

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

// Transform output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  delete user.emailVerificationToken
  delete user.passwordResetToken
  delete user.twoFactorSecret
  return user
}

module.exports = mongoose.model("User", userSchema)
