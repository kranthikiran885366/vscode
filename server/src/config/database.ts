import mongoose, { Connection } from 'mongoose'
import { Pool } from 'pg'
import { logger } from '../utils/logger'

// PostgreSQL Pool Configuration with optimized settings for production
const pgPool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'zencode',
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  min: parseInt(process.env.DB_POOL_MIN || '5'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statementTimeoutMillis: 30000,
  statement_timeout: 30000,
  application_name: 'zencode-ai',
})

// Track pool events
pgPool.on('error', (err) => {
  logger.error('Unexpected error on idle client', 'DATABASE_POOL', err)
})

pgPool.on('connect', () => {
  logger.debug('New PostgreSQL connection established', 'DATABASE_POOL')
})

pgPool.on('remove', () => {
  logger.debug('PostgreSQL connection removed from pool', 'DATABASE_POOL')
})

// MongoDB Connection
let mongoConnection: Connection | null = null

/**
 * Initialize PostgreSQL Connection Pool
 */
export async function initializePostgres(): Promise<Pool> {
  try {
    const client = await pgPool.connect()
    await client.query('SELECT 1')
    client.release()

    logger.info('PostgreSQL connection pool initialized', 'DATABASE', {
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
    })

    return pgPool
  } catch (error) {
    logger.error('Failed to initialize PostgreSQL', 'DATABASE', error)
    throw error
  }
}

/**
 * Initialize MongoDB Connection
 */
export async function initializeMongoDB(): Promise<Connection> {
  if (mongoConnection) {
    return mongoConnection
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode'

    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    })

    mongoConnection = connection.connection

    logger.info('MongoDB connected', 'DATABASE', {
      uri: mongoUri.replace(/:[^:]*@/, ':***@'),
    })

    return mongoConnection
  } catch (error) {
    logger.error('Failed to initialize MongoDB', 'DATABASE', error)
    throw error
  }
}

/**
 * Get PostgreSQL Connection Pool
 */
export function getPostgresPool(): Pool {
  return pgPool
}

/**
 * Get MongoDB Connection
 */
export function getMongoConnection(): Connection {
  if (!mongoConnection) {
    throw new Error('MongoDB not initialized. Call initializeMongoDB first.')
  }
  return mongoConnection
}

/**
 * Execute PostgreSQL Query
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pgPool.query(text, params)
    const duration = Date.now() - start
    logger.debug(`Query executed in ${duration}ms`, 'DATABASE_QUERY', { text, duration })
    return result
  } catch (error) {
    logger.error('Query execution failed', 'DATABASE_QUERY', { text, error })
    throw error
  }
}

/**
 * Close all Database Connections
 */
export async function closeConnections(): Promise<void> {
  try {
    await pgPool.end()
    if (mongoConnection) {
      await mongoose.disconnect()
    }
    logger.info('All database connections closed', 'DATABASE')
  } catch (error) {
    logger.error('Error closing database connections', 'DATABASE', error)
    throw error
  }
}

/**
 * Health Check for Databases
 */
export async function healthCheck(): Promise<{
  postgres: boolean
  mongodb: boolean
  poolStats?: any
}> {
  const health: any = {
    postgres: false,
    mongodb: false,
  }

  try {
    const pgClient = await pgPool.connect()
    await pgClient.query('SELECT 1')
    pgClient.release()
    health.postgres = true
    health.poolStats = {
      totalCount: pgPool.totalCount,
      idleCount: pgPool.idleCount,
      waitingCount: pgPool.waitingCount,
    }
  } catch (error) {
    logger.warn('PostgreSQL health check failed', 'DATABASE', error)
  }

  try {
    if (mongoConnection) {
      await mongoose.connection.db?.admin().ping()
      health.mongodb = true
    }
  } catch (error) {
    logger.warn('MongoDB health check failed', 'DATABASE', error)
  }

  return health
}

/**
 * Get Pool Statistics
 */
export function getPoolStats(): {
  totalCount: number
  idleCount: number
  waitingCount: number
} {
  return {
    totalCount: pgPool.totalCount,
    idleCount: pgPool.idleCount,
    waitingCount: pgPool.waitingCount,
  }
}

/**
 * Database transaction helper for PostgreSQL
 */
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pgPool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error('Transaction error', 'DATABASE_TRANSACTION', error)
    throw error
  } finally {
    client.release()
  }
}
