import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface LoggingRequest extends Request {
  startTime?: number
}

/**
 * Request/response logging middleware
 */
export const requestLogger = (req: LoggingRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now()

  // Skip logging for health checks
  if (req.path === '/api/health') {
    return next()
  }

  // Log request
  logger.logRequest(req.method, req.path, (req as any).user?.id)

  // Capture original send function
  const originalSend = res.send

  // Override send to log response
  res.send = function (data: any) {
    const duration = Date.now() - (req.startTime || 0)
    logger.logResponse(req.method, req.path, res.statusCode, duration, (req as any).user?.id)

    // Call original send
    return originalSend.call(this, data)
  }

  next()
}

/**
 * Extract client IP address
 */
export const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown'
  )
}

/**
 * Extract user agent
 */
export const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown'
}
