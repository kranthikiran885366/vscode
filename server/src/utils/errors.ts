/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(401, message, 'AUTHENTICATION_ERROR', details)
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: any) {
    super(403, message, 'AUTHORIZATION_ERROR', details)
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND_ERROR')
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Conflict error (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT_ERROR', details)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(429, message, 'RATE_LIMIT_ERROR', { retryAfter })
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Internal server error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details)
    Object.setPrototypeOf(this, InternalServerError.prototype)
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(
    public service: string,
    message: string = 'External service unavailable',
    details?: any
  ) {
    super(503, message, 'EXTERNAL_SERVICE_ERROR', { service, ...details })
    Object.setPrototypeOf(this, ExternalServiceError.prototype)
  }
}

/**
 * Check if error is an AppError
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError
}
