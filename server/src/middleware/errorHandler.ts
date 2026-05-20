import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { ApiError } from '../types'

/**
 * Error handling middleware
 */
export function errorHandler(err: Error | ApiError, req: Request, res: Response, next: NextFunction) {
  const status = err instanceof ApiError ? err.statusCode : 500
  const message = err.message || 'Internal server error'

  // Log the error
  logger.error(`[${req.method}] ${req.path}`, 'ERROR_HANDLER', {
    status,
    message,
    stack: err.stack,
    body: req.body,
  })

  // Send error response
  res.status(status).json({
    success: false,
    error: {
      message,
      code: err instanceof ApiError ? err.code : 'INTERNAL_ERROR',
      status,
    },
    timestamp: new Date().toISOString(),
  })
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      status: 404,
    },
  })
}
