/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Project name validation
 */
export const isValidProjectName = (name: string): boolean => {
  return name && name.trim().length > 0 && name.length <= 255
}

/**
 * File name validation
 */
export const isValidFileName = (name: string): boolean => {
  // Disallow special characters but allow dots for file extensions
  const validNameRegex = /^[a-zA-Z0-9_\-\.]+$/
  return name && name.trim().length > 0 && validNameRegex.test(name)
}

/**
 * Language validation
 */
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'go',
  'rust',
  'html',
  'css',
  'sql',
  'markdown',
  'json',
  'xml',
  'yaml',
  'plaintext',
]

export const isValidLanguage = (language: string): boolean => {
  return SUPPORTED_LANGUAGES.includes(language.toLowerCase())
}

/**
 * MongoDB ObjectId validation
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-f]{24}$/.test(id)
}

/**
 * URL slug validation
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length <= 100
}

/**
 * User input sanitization
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 10000) // Limit length
}

/**
 * Batch validate emails
 */
export const validateEmails = (emails: string[]): { valid: string[]; invalid: string[] } => {
  const valid: string[] = []
  const invalid: string[] = []

  emails.forEach((email) => {
    if (isValidEmail(email)) {
      valid.push(email.toLowerCase())
    } else {
      invalid.push(email)
    }
  })

  return { valid, invalid }
}
