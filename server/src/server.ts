import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'

// Route imports
import authRoutes from './routes/auth'
import fileRoutes from './routes/files'
import projectRoutes from './routes/projects'
import aiRoutes from './routes/ai'
import executionRoutes from './routes/execution'
import gitRoutes from './routes/git'
import formatterRoutes from './routes/formatter'
import snippetsRoutes from './routes/snippets'
import organizationRoutes from './routes/organization'
import apiKeysRoutes from './routes/apiKeys'
import analyticsRoutes from './routes/analytics'

// Middleware imports
import { authMiddleware, requireAuth } from './middleware/auth'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logging'
import { apiLimiter, authLimiter, signupLimiter } from './middleware/rateLimiter'

// Config imports
import { getCorsConfig } from './config/cors'
import { initializePostgres, initializeMongoDB, healthCheck } from './config/database'

// WebSocket
import { initializeWebSocket } from './websocket'

// Logger
import { logger } from './utils/logger'

// Load environment variables
dotenv.config()

const app: Express = express()
const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Initialize WebSocket
initializeWebSocket(httpServer)

// Enhanced Security Middleware with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
}))

// Enhanced CORS with custom configuration
app.use(cors(getCorsConfig()))

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Request Logging Middleware
app.use(requestLogger)

// General API Rate Limiting
app.use('/api/', apiLimiter)

// Authentication Middleware
app.use(authMiddleware)

// Routes with specific rate limiters
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', signupLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/files', requireAuth, fileRoutes)
app.use('/api/projects', requireAuth, projectRoutes)
app.use('/api/ai', requireAuth, aiRoutes)
app.use('/api/execute', requireAuth, executionRoutes)
app.use('/api/git', requireAuth, gitRoutes)
app.use('/api/formatter', requireAuth, formatterRoutes)
app.use('/api/snippets', requireAuth, snippetsRoutes)
app.use('/api/organization', requireAuth, organizationRoutes)
app.use('/api/api-keys', requireAuth, apiKeysRoutes)
app.use('/api/analytics', requireAuth, analyticsRoutes)

// Enhanced Health check endpoint with database status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await healthCheck()
    
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date(),
      environment: NODE_ENV,
      database: dbHealth,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    })
  } catch (error) {
    logger.error('Health check error', 'HEALTH', error)
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
    })
  }
})

// Database status endpoint (admin only)
app.get('/api/admin/db-status', requireAuth, async (req: Request, res: Response) => {
  try {
    const dbHealth = await healthCheck()
    
    res.json({
      success: true,
      database: dbHealth,
    })
  } catch (error) {
    logger.error('Database status error', 'DATABASE', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get database status',
    })
  }
})

// API Features Endpoint - Documents all available services and endpoints
app.get('/api/features', (req: Request, res: Response) => {
  res.json({
    success: true,
    version: '1.0.0',
    features: {
      authentication: {
        description: 'Complete authentication system with JWT, 2FA, and email verification',
        endpoints: [
          'POST /api/auth/signup - User registration',
          'POST /api/auth/login - User login with JWT',
          'POST /api/auth/refresh - Refresh access token',
          'POST /api/auth/verify-email - Email verification',
          'POST /api/auth/change-password - Change user password',
          'POST /api/auth/2fa/setup - Setup 2FA',
          'POST /api/auth/2fa/enable - Enable 2FA',
          'POST /api/auth/2fa/verify - Verify 2FA token',
          'GET /api/auth/me - Get current user info',
        ],
        count: 9,
      },
      projects: {
        description: 'Project management with collaboration, archiving, and export',
        endpoints: [
          'GET /api/projects - List user projects',
          'POST /api/projects - Create new project',
          'GET /api/projects/:id - Get project details',
          'PUT /api/projects/:id - Update project',
          'DELETE /api/projects/:id - Delete project',
          'POST /api/projects/:id/archive - Archive project',
          'POST /api/projects/:id/duplicate - Duplicate project',
          'GET /api/projects/:id/export - Export project',
        ],
        count: 8,
      },
      files: {
        description: 'File management with versioning, diffs, and bulk operations',
        endpoints: [
          'GET /api/files - List project files',
          'POST /api/files - Create file',
          'PUT /api/files/:id - Update file',
          'DELETE /api/files/:id - Delete file',
          'GET /api/files/:id/versions - File version history',
          'POST /api/files/:id/restore - Restore file version',
          'GET /api/files/:id/diff - Get file diff',
          'POST /api/files/bulk/create - Bulk create files',
        ],
        count: 8,
      },
      collaboration: {
        description: 'Real-time collaboration with WebSocket support',
        endpoints: [
          'WebSocket Events: user:presence, file:edit, cursor:move',
          'Operational Transform for conflict-free editing',
          'User cursor tracking and awareness',
        ],
        count: 3,
      },
      git: {
        description: 'Git integration for version control',
        endpoints: [
          'GET /api/git/:projectId/status - Git status',
          'POST /api/git/:projectId/commit - Create commit',
          'POST /api/git/:projectId/push - Push to remote',
          'GET /api/git/:projectId/log - Commit history',
          'POST /api/git/:projectId/merge - Merge branches',
        ],
        count: 5,
      },
      execution: {
        description: 'Code execution in sandboxed environments',
        endpoints: [
          'POST /api/execute - Execute code (Node, Python, JS)',
          'Timeout protection (configurable)',
          'Real-time output streaming',
          'Resource limits enforced',
        ],
        count: 4,
      },
      formatter: {
        description: 'Code formatting with Prettier and ESLint',
        endpoints: [
          'POST /api/formatter/format - Format code',
          'GET /api/formatter/presets - Available presets',
          'POST /api/formatter/config - Save custom config',
        ],
        count: 3,
      },
      snippets: {
        description: 'Code snippet management and sharing',
        endpoints: [
          'GET /api/snippets - List snippets',
          'POST /api/snippets - Create snippet',
          'GET /api/snippets/:id - Get snippet',
          'DELETE /api/snippets/:id - Delete snippet',
        ],
        count: 4,
      },
      organization: {
        description: 'Organization and team management',
        endpoints: [
          'POST /api/organization - Create organization',
          'GET /api/organization/:id - Get org details',
          'POST /api/organization/:id/members - Add member',
          'DELETE /api/organization/:id/members/:memberId - Remove member',
        ],
        count: 4,
      },
      apiKeys: {
        description: 'API key management for programmatic access',
        endpoints: [
          'POST /api/api-keys - Generate API key',
          'GET /api/api-keys - List API keys',
          'DELETE /api/api-keys/:keyId - Revoke API key',
          'POST /api/api-keys/:keyId/rotate - Rotate key',
        ],
        count: 4,
      },
      analytics: {
        description: 'Activity tracking and analytics',
        endpoints: [
          'GET /api/analytics/activity - User activity',
          'GET /api/analytics/team-stats - Team statistics',
          'GET /api/analytics/code-stats - Code metrics',
          'GET /api/analytics/organization - Org analytics',
        ],
        count: 4,
      },
      ai: {
        description: 'AI-powered code assistance',
        endpoints: [
          'POST /api/ai/complete - Code completion',
          'POST /api/ai/generate - Generate code',
          'POST /api/ai/explain - Explain code',
          'POST /api/ai/refactor - Suggest refactoring',
        ],
        count: 4,
      },
    },
    totalServices: 12,
    totalEndpoints: 55,
    totalFeatures: 60,
    description: 'ZenCode AI - Enterprise IDE with 40+ features and real-time collaboration',
  })
})

// 404 handler
app.use(notFoundHandler)

// Global Error Handler (must be last)
app.use(errorHandler)

// MongoDB Connection
mongoose
  .connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    logger.info('Connected to MongoDB', 'DATABASE', {
      uri: MONGODB_URI.replace(/:[^:]*@/, ':***@'), // Hide password
    })

    // Start server with HTTP
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, 'SERVER', {
        environment: NODE_ENV,
        websocket: 'initialized',
      })

      console.log('\n=================================')
      console.log('✅ ZenCode AI Server Started')
      console.log(`📍 Port: ${PORT}`)
      console.log(`🌍 Environment: ${NODE_ENV}`)
      console.log(`🔗 MongoDB: Connected`)
      console.log('=================================\n')
    })
  })
  .catch((err) => {
    logger.error('MongoDB connection error', 'DATABASE', err)
    console.error('❌ Failed to start server:', err.message)
    process.exit(1)
  })

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully', 'SERVER')
  httpServer.close(() => {
    mongoose.connection.close()
    logger.info('Server shutdown complete', 'SERVER')
    process.exit(0)
  })
})

export default httpServer
