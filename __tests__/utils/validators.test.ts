import { validateEmail, validatePassword, validateProjectName } from '../../server/src/utils/validators'

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      expect(validatePassword('SecurePass123!')).toBe(true)
      expect(validatePassword('AnotherGood123!')).toBe(true)
    })

    it('should reject weak password', () => {
      expect(validatePassword('short')).toBe(false)
      expect(validatePassword('nouppercase123')).toBe(false)
      expect(validatePassword('NOLOWERCASE123')).toBe(false)
      expect(validatePassword('NoNumbers!')).toBe(false)
      expect(validatePassword('NoSpecial123')).toBe(false)
    })
  })

  describe('validateProjectName', () => {
    it('should validate correct project name', () => {
      expect(validateProjectName('My Project')).toBe(true)
      expect(validateProjectName('project-name')).toBe(true)
      expect(validateProjectName('project_123')).toBe(true)
    })

    it('should reject invalid project name', () => {
      expect(validateProjectName('')).toBe(false)
      expect(validateProjectName('a')).toBe(false)
      expect(validateProjectName('x'.repeat(256))).toBe(false)
    })
  })
})
