import dotenv from 'dotenv'
import http from 'http'
import mongoose from 'mongoose'
import { app } from './app'
import { initializeWebSocket } from './websocket'
import { logger } from './utils/logger'

dotenv.config()

const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode'
const NODE_ENV = process.env.NODE_ENV || 'development'

initializeWebSocket(httpServer)

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
