export interface LanguageConfig {
  id: string
  name: string
  fileExtensions: string[]
  monacoLanguage: string
  icon?: string
  description: string
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    fileExtensions: ['.js', '.mjs', '.cjs'],
    monacoLanguage: 'javascript',
    description: 'JavaScript - Dynamic programming language for web',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    fileExtensions: ['.ts', '.tsx'],
    monacoLanguage: 'typescript',
    description: 'TypeScript - Typed superset of JavaScript',
  },
  python: {
    id: 'python',
    name: 'Python',
    fileExtensions: ['.py', '.pyw'],
    monacoLanguage: 'python',
    description: 'Python - High-level programming language',
  },
  java: {
    id: 'java',
    name: 'Java',
    fileExtensions: ['.java'],
    monacoLanguage: 'java',
    description: 'Java - Object-oriented programming language',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    fileExtensions: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
    monacoLanguage: 'cpp',
    description: 'C++ - General-purpose programming language',
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    fileExtensions: ['.cs'],
    monacoLanguage: 'csharp',
    description: 'C# - Modern object-oriented programming language',
  },
  go: {
    id: 'go',
    name: 'Go',
    fileExtensions: ['.go'],
    monacoLanguage: 'go',
    description: 'Go - Compiled, statically typed language',
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    fileExtensions: ['.rs'],
    monacoLanguage: 'rust',
    description: 'Rust - Systems programming language',
  },
  html: {
    id: 'html',
    name: 'HTML',
    fileExtensions: ['.html', '.htm'],
    monacoLanguage: 'html',
    description: 'HTML - Markup language for web pages',
  },
  css: {
    id: 'css',
    name: 'CSS',
    fileExtensions: ['.css'],
    monacoLanguage: 'css',
    description: 'CSS - Stylesheet language for styling',
  },
  scss: {
    id: 'scss',
    name: 'SCSS',
    fileExtensions: ['.scss'],
    monacoLanguage: 'scss',
    description: 'SCSS - CSS preprocessor with more features',
  },
  json: {
    id: 'json',
    name: 'JSON',
    fileExtensions: ['.json', '.jsonc'],
    monacoLanguage: 'json',
    description: 'JSON - Lightweight data-interchange format',
  },
  xml: {
    id: 'xml',
    name: 'XML',
    fileExtensions: ['.xml', '.svg'],
    monacoLanguage: 'xml',
    description: 'XML - Extensible Markup Language',
  },
  yaml: {
    id: 'yaml',
    name: 'YAML',
    fileExtensions: ['.yaml', '.yml'],
    monacoLanguage: 'yaml',
    description: 'YAML - Human-friendly data serialization format',
  },
  markdown: {
    id: 'markdown',
    name: 'Markdown',
    fileExtensions: ['.md', '.markdown'],
    monacoLanguage: 'markdown',
    description: 'Markdown - Lightweight markup language',
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    fileExtensions: ['.sh', '.bash'],
    monacoLanguage: 'shell',
    description: 'Bash - Unix shell and command language',
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    fileExtensions: ['.sql'],
    monacoLanguage: 'sql',
    description: 'SQL - Language for managing databases',
  },
  dockerfile: {
    id: 'dockerfile',
    name: 'Dockerfile',
    fileExtensions: ['Dockerfile'],
    monacoLanguage: 'dockerfile',
    description: 'Dockerfile - Configuration for Docker images',
  },
  plaintext: {
    id: 'plaintext',
    name: 'Plain Text',
    fileExtensions: ['.txt'],
    monacoLanguage: 'plaintext',
    description: 'Plain Text - Unformatted text file',
  },
}

export function detectLanguageFromFileName(fileName: string): string {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase()

  for (const [langId, config] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (config.fileExtensions.includes(ext) || config.fileExtensions.includes(fileName)) {
      return langId
    }
  }

  return 'plaintext'
}

export function getLanguageConfig(languageId: string): LanguageConfig {
  return SUPPORTED_LANGUAGES[languageId] || SUPPORTED_LANGUAGES['plaintext']
}

export function getAllLanguages(): LanguageConfig[] {
  return Object.values(SUPPORTED_LANGUAGES)
}

export function getLanguagesByCategory(category: 'web' | 'systems' | 'data' | 'scripting'): LanguageConfig[] {
  const categories: Record<string, string[]> = {
    web: ['javascript', 'typescript', 'html', 'css', 'scss'],
    systems: ['cpp', 'csharp', 'go', 'rust'],
    data: ['json', 'xml', 'yaml', 'sql'],
    scripting: ['python', 'bash', 'javascript'],
  }

  return categories[category]
    ?.map((id) => SUPPORTED_LANGUAGES[id])
    .filter((config): config is LanguageConfig => config !== undefined) || []
}
