import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import http from 'http'

// Route imports
import authRoutes from './routes/auth'
import fileRoutes from './routes/files'
import projectRoutes from './routes/projects'
import aiRoutes from './routes/ai'
import executionRoutes from './routes/execution'
import gitRoutes from './routes/git'
import { initializeWebSocket } from './websocket'

// Load environment variables
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode'

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Auth middleware
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

app.use((req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    req.user = decoded
  } catch (err) {
    console.error('Invalid token:', err)
  }

  next()
})

// Protected route middleware
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', requireAuth, fileRoutes)
app.use('/api/projects', requireAuth, projectRoutes)
app.use('/api/ai', requireAuth, aiRoutes)
app.use('/api/execute', requireAuth, executionRoutes)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not found' })
})

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

export default app
