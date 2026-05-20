import rateLimit, { Options } from 'express-rate-limit'
import RedisStore from 'connect-redis'
import { createClient } from 'redis'
import { logger } from '../utils/logger'

// Create Redis client for rate limiting
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
})

redisClient.on('error', (err) => {
  logger.error('Redis rate limiter error', 'RATE_LIMITER', err)
})

redisClient.on('connect', () => {
  logger.info('Redis rate limiter connected', 'RATE_LIMITER')
})

const store = new RedisStore({
  client: redisClient,
  prefix: 'rl:',
})

// General API rate limiter
export const apiLimiter = rateLimit({
  store: store as any,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health'
  },
} as Options)

// Authentication rate limiter (stricter)
export const authLimiter = rateLimit({
  store: store as any,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
} as Options)

// Signup rate limiter
export const signupLimiter = rateLimit({
  store: store as any,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 signup attempts per hour
  message: 'Too many accounts created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
} as Options)

// Code execution rate limiter
export const executionLimiter = rateLimit({
  store: store as any,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 executions per minute
  keyGenerator: (req: any) => {
    return req.user?.id || req.ip // Use user ID if authenticated
  },
  message: 'Too many code executions, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
} as Options)

// API key operations rate limiter
export const apiKeyLimiter = rateLimit({
  store: store as any,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each user to 20 API key operations per hour
  keyGenerator: (req: any) => {
    return req.user?.id || req.ip
  },
  standardHeaders: true,
  legacyHeaders: false,
} as Options)

// Custom rate limiter factory
export function createRateLimiter(options: {
  windowMs?: number
  max?: number
  message?: string
  keyGenerator?: (req: any) => string
}) {
  return rateLimit({
    store: store as any,
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    keyGenerator: options.keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
  } as Options)
}
