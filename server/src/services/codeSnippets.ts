export interface CodeSnippet {
  id?: string
  name: string
  prefix: string
  body: string[]
  description: string
  language?: string
  category?: string
  tags?: string[]
  author?: string
  isCustom?: boolean
  rating?: number
}

export class CodeSnippets {
  private static defaultSnippets: Record<string, CodeSnippet[]> = {
    javascript: [
      {
        name: 'Arrow Function',
        prefix: 'arf',
        body: ['const ${1:name} = (${2:params}) => {', '\t${3}', '};'],
        description: 'Create an arrow function',
        language: 'javascript',
        category: 'functions',
        tags: ['arrow', 'function'],
      },
      {
        name: 'For Loop',
        prefix: 'for',
        body: ['for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {', '\t${3}', '}'],
        description: 'Create a for loop',
        language: 'javascript',
        category: 'loops',
        tags: ['loop', 'for'],
      },
      {
        name: 'Promise',
        prefix: 'prom',
        body: [
          'new Promise((resolve, reject) => {',
          '\t${1}',
          '\tif (${2:condition}) {',
          '\t\tresolve(${3:value});',
          '\t} else {',
          '\t\treject(${4:error});',
          '\t}',
          '});',
        ],
        description: 'Create a new Promise',
        language: 'javascript',
        category: 'async',
        tags: ['promise', 'async'],
      },
      {
        name: 'Async Function',
        prefix: 'asdf',
        body: ['async function ${1:name}(${2:params}) {', '\t${3}', '}'],
        description: 'Create an async function',
        language: 'javascript',
        category: 'async',
        tags: ['async', 'function'],
      },
      {
        name: 'Try Catch',
        prefix: 'try',
        body: ['try {', '\t${1}', '} catch (${2:error}) {', '\t${3}', '}'],
        description: 'Create a try-catch block',
        language: 'javascript',
        category: 'error-handling',
        tags: ['try', 'catch', 'error'],
      },
      {
        name: 'REST API Call',
        prefix: 'fetch',
        body: [
          'fetch(\'${1:url}\', {',
          '\tmethod: \'${2:GET}\',',
          '\theaders: {',
          '\t\t\'Content-Type\': \'application/json\'',
          '\t}',
          '})',
          '.then(res => res.json())',
          '.then(data => ${3:console.log(data)})',
          '.catch(err => ${4:console.error(err)});',
        ],
        description: 'Fetch API call',
        language: 'javascript',
        category: 'api',
        tags: ['fetch', 'api', 'rest'],
      },
    ],
    python: [
      {
        name: 'Function',
        prefix: 'def',
        body: ['def ${1:function_name}(${2:params}):', '\t"""${3:docstring}"""', '\t${4:pass}'],
        description: 'Define a function',
        language: 'python',
      },
      {
        name: 'Class',
        prefix: 'class',
        body: ['class ${1:ClassName}:', '\t"""${2:docstring}"""', '\tdef __init__(self${3:, params}):', '\t\t${4:pass}'],
        description: 'Define a class',
        language: 'python',
      },
      {
        name: 'For Loop',
        prefix: 'for',
        body: ['for ${1:item} in ${2:iterable}:', '\t${3:pass}'],
        description: 'Create a for loop',
        language: 'python',
      },
      {
        name: 'If Statement',
        prefix: 'if',
        body: ['if ${1:condition}:', '\t${2:pass}', 'else:', '\t${3:pass}'],
        description: 'Create an if-else statement',
        language: 'python',
      },
      {
        name: 'Try Except',
        prefix: 'try',
        body: ['try:', '\t${1:pass}', 'except ${2:Exception}:', '\t${3:pass}'],
        description: 'Create a try-except block',
        language: 'python',
      },
    ],
    html: [
      {
        name: 'HTML Document',
        prefix: 'html',
        body: [
          '<!DOCTYPE html>',
          '<html lang="en">',
          '<head>',
          '\t<meta charset="UTF-8">',
          '\t<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          '\t<title>${1:Page Title}</title>',
          '</head>',
          '<body>',
          '\t${2}',
          '</body>',
          '</html>',
        ],
        description: 'Create an HTML document',
        language: 'html',
      },
    ],
  }

  static getSnippets(language: string): CodeSnippet[] {
    return this.defaultSnippets[language] || []
  }

  static expandSnippet(snippet: CodeSnippet): string {
    return snippet.body.join('\n')
  }

  static searchSnippets(language: string, query: string): CodeSnippet[] {
    const snippets = this.getSnippets(language)
    const lowerQuery = query.toLowerCase()

    return snippets.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.prefix.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
    )
  }

  static getSnippetByPrefix(language: string, prefix: string): CodeSnippet | undefined {
    const snippets = this.getSnippets(language)
    return snippets.find((s) => s.prefix === prefix.toLowerCase())
  }

  /**
   * Get snippets by category
   */
  static getSnippetsByCategory(language: string, category: string): CodeSnippet[] {
    const snippets = this.getSnippets(language)
    return snippets.filter((s) => s.category === category)
  }

  /**
   * Search snippets with filters
   */
  static advancedSearch(
    query: string,
    language?: string,
    category?: string,
    tags?: string[]
  ): CodeSnippet[] {
    let results: CodeSnippet[] = []

    // Get base snippets
    if (language) {
      results = this.getSnippets(language)
    } else {
      // Search all languages
      Object.values(this.defaultSnippets).forEach((snippets) => {
        results.push(...snippets)
      })
    }

    // Filter by query
    const lowerQuery = query.toLowerCase()
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.prefix.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
    )

    // Filter by category
    if (category) {
      results = results.filter((s) => s.category === category)
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter((s) => s.tags && tags.some((t) => s.tags!.includes(t)))
    }

    return results
  }

  /**
   * Get popular categories
   */
  static getCategories(language: string): string[] {
    const snippets = this.getSnippets(language)
    const categories = new Set<string>()
    snippets.forEach((s) => {
      if (s.category) {
        categories.add(s.category)
      }
    })
    return Array.from(categories).sort()
  }

  /**
   * Create custom snippet
   */
  static createCustomSnippet(
    name: string,
    prefix: string,
    body: string[],
    description: string,
    language: string,
    category?: string
  ): CodeSnippet {
    return {
      id: `custom_${Date.now()}_${Math.random()}`,
      name,
      prefix,
      body,
      description,
      language,
      category,
      isCustom: true,
      author: 'user',
    }
  }

  /**
   * Rate snippet
   */
  static rateSnippet(snippet: CodeSnippet, rating: number): CodeSnippet {
    return {
      ...snippet,
      rating: Math.max(1, Math.min(5, rating)),
    }
  }

  /**
   * Get trending snippets
   */
  static getTrendingSnippets(language?: string): CodeSnippet[] {
    let snippets: CodeSnippet[] = []

    if (language) {
      snippets = this.getSnippets(language)
    } else {
      Object.values(this.defaultSnippets).forEach((s) => {
        snippets.push(...s)
      })
    }

    // Sort by rating (if available) and return top 10
    return snippets.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10)
  }
}
