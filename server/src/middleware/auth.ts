import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AuthenticationError, AuthorizationError } from '../utils/errors'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
  token?: string
}

/**
 * Verify JWT token and attach user to request
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      logger.warn('Invalid token attempt', 'AUTH', { path: req.path })
      return next()
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    }
    req.token = token

    next()
  } catch (error) {
    logger.error('Auth middleware error', 'AUTH', error)
    next()
  }
}

/**
 * Require authentication
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
    })
  }
  next()
}

/**
 * Require admin role
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
    })
  }

  // TODO: Check user role from database
  // For now, we'll skip this check
  next()
}

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      }
      req.token = token
    }

    next()
  } catch (error) {
    logger.error('Optional auth middleware error', 'AUTH', error)
    next()
  }
}
