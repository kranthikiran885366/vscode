import { authService } from '../../server/src/services/AuthService'
import User from '../../server/src/models/User'
import mongoose from 'mongoose'

// Mock User model
jest.mock('../../server/src/models/User')

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user with valid credentials', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        toJSON: () => ({ id: 'user_id', name: 'John Doe', email: 'john@example.com' }),
        save: jest.fn().mockResolvedValue(true),
      }

      ;(User as any).findOne = jest.fn().mockResolvedValue(null)
      ;(User as any).mockImplementation(() => mockUser)

      const result = await authService.register('John Doe', 'john@example.com', 'SecurePassword123!')

      expect(result.user).toBeDefined()
      expect(result.tokens.accessToken).toBeDefined()
      expect(result.tokens.refreshToken).toBeDefined()
    })

    it('should throw error for invalid email', async () => {
      await expect(
        authService.register('John Doe', 'invalid-email', 'SecurePassword123!')
      ).rejects.toThrow('Invalid email format')
    })

    it('should throw error for weak password', async () => {
      await expect(
        authService.register('John Doe', 'john@example.com', 'weak')
      ).rejects.toThrow('Password does not meet requirements')
    })

    it('should throw error if email already exists', async () => {
      ;(User as any).findOne = jest.fn().mockResolvedValue({ _id: 'existing_user' })

      await expect(
        authService.register('John Doe', 'john@example.com', 'SecurePassword123!')
      ).rejects.toThrow('Email already registered')
    })
  })

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'john@example.com',
        name: 'John Doe',
        password: 'hashed_password',
        isLocked: jest.fn().mockReturnValue(false),
        comparePassword: jest.fn().mockResolvedValue(true),
        incLoginAttempts: jest.fn(),
        resetLoginAttempts: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 'user_id', email: 'john@example.com', name: 'John Doe' }),
      }

      ;(User as any).findOne = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser),
        })

      const result = await authService.login('john@example.com', 'SecurePassword123!')

      expect(result.user).toBeDefined()
      expect(result.tokens.accessToken).toBeDefined()
    })

    it('should throw error for invalid password', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
        incLoginAttempts: jest.fn(),
      }

      ;(User as any).findOne = jest
        .fn()
        .mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUser),
        })

      await expect(authService.login('john@example.com', 'WrongPassword')).rejects.toThrow(
        'Invalid email or password'
      )
    })
  })

  describe('changePassword', () => {
    it('should change password with valid old password', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        password: 'old_hashed',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      }

      ;(User as any).findById = jest.fn().mockResolvedValue(mockUser)

      await expect(
        authService.changePassword('user_id', 'OldPassword123!', 'NewPassword456!')
      ).resolves.not.toThrow()

      expect(mockUser.save).toHaveBeenCalled()
    })

    it('should throw error for incorrect old password', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        password: 'old_hashed',
        comparePassword: jest.fn().mockResolvedValue(false),
      }

      ;(User as any).findById = jest.fn().mockResolvedValue(mockUser)

      await expect(
        authService.changePassword('user_id', 'WrongPassword', 'NewPassword456!')
      ).rejects.toThrow('Current password is incorrect')
    })
  })
})
