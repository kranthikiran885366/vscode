import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zencode-secret-key-please-change-in-production'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'zencode-refresh-secret-please-change-in-production'
const ACCESS_TOKEN_EXPIRY = '1h'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  id: string
  email: string
  name: string
}

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as DecodedToken
  } catch (error) {
    return null
  }
}

/**
 * Decode token without verification (for inspection)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken | null
  } catch (error) {
    return null
  }
}

/**
 * Get token expiry time in seconds
 */
export const getTokenExpiryTime = (token: string): number => {
  const decoded = decodeToken(token)
  if (!decoded) return 0
  return decoded.exp - Math.floor(Date.now() / 1000)
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiryTime = getTokenExpiryTime(token)
  return expiryTime <= 0
}
