import { Request, Response, NextFunction } from 'express'
import { AppError, isAppError } from '../utils/errors'
import { logger } from '../utils/logger'

export interface ErrorResponse {
  success: false
  message: string
  code: string
  details?: any
  stack?: string
}

/**
 * Global error handler middleware
 * Must be the last middleware registered
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  const status = err.statusCode || 500
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isAppError(err)) {
    logger.error(err.message, 'ERROR_HANDLER', {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    })

    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_SERVER_ERROR',
      ...(err.details && { details: err.details }),
      ...(isDevelopment && { stack: err.stack }),
    }

    return res.status(err.statusCode).json(response)
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    logger.error('MongoDB Error', 'DATABASE', err)

    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0]
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Database error',
      code: 'DATABASE_ERROR',
      ...(isDevelopment && { details: err.message }),
    })
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }))

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: errors,
    })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    })
  }

  // Generic error handling
  logger.error('Unhandled Error', 'ERROR_HANDLER', err)

  const response: ErrorResponse = {
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack,
    }),
  }

  res.status(500).json(response)
}

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
  })
}

/**
 * Async handler wrapper to catch errors in async routes
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
