import { CorsOptions } from 'cors'

/**
 * CORS Configuration for different environments
 */
export const getCorsConfig = (): CorsOptions => {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'Accept',
      'Accept-Language',
      'Content-Language',
      'Last-Event-ID',
    ],
    exposedHeaders: [
      'Content-Length',
      'X-Total-Count',
      'X-Page-Count',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400, // 24 hours
  }
}

/**
 * CORS preflight handler
 */
export const corsPreflightHandler = (allowedOrigins: string[]) => {
  return (req: any, res: any) => {
    const origin = req.headers.origin
    if (!origin || allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin || '*')
      res.set('Access-Control-Allow-Credentials', 'true')
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
      res.set('Access-Control-Max-Age', '86400')
    }
    res.sendStatus(204)
  }
}
