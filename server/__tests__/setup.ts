import dotenv from 'dotenv'

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencode-test'

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}
