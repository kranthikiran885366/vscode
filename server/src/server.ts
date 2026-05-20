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

// Middleware imports
import { authMiddleware, requireAuth } from './middleware/auth'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logging'

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

// Security Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Request Logging Middleware
app.use(requestLogger)

// Authentication Middleware
app.use(authMiddleware)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', requireAuth, fileRoutes)
app.use('/api/projects', requireAuth, projectRoutes)
app.use('/api/ai', requireAuth, aiRoutes)
app.use('/api/execute', requireAuth, executionRoutes)
app.use('/api/git', requireAuth, gitRoutes)
app.use('/api/formatter', requireAuth, formatterRoutes)
app.use('/api/snippets', requireAuth, snippetsRoutes)

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date(),
    environment: NODE_ENV,
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
