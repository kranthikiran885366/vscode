import rateLimit from 'express-rate-limit'

const isTest = process.env.NODE_ENV === 'test'
const multiplier = process.env.NODE_ENV === 'production' ? 1 : 10

const userOrIp = (req: any) => req.user?.id || req.ip

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000 * multiplier,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isTest || req.path === '/health',
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20 * multiplier,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
})

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10 * multiplier,
  message: { success: false, message: 'Too many accounts created from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
})

export const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: userOrIp,
  message: { success: false, message: 'Too many code executions, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
})

export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  keyGenerator: userOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
})

export function createRateLimiter(options: {
  windowMs?: number
  max?: number
  message?: string
  keyGenerator?: (req: any) => string
}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.max || 100,
    message: options.message || 'Too many requests',
    keyGenerator: options.keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
  })
}
