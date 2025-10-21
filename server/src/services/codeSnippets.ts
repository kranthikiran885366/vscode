export interface CodeSnippet {
  name: string
  prefix: string
  body: string[]
  description: string
  language?: string
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
      },
      {
        name: 'For Loop',
        prefix: 'for',
        body: ['for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {', '\t${3}', '}'],
        description: 'Create a for loop',
        language: 'javascript',
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
      },
      {
        name: 'Async Function',
        prefix: 'asdf',
        body: ['async function ${1:name}(${2:params}) {', '\t${3}', '}'],
        description: 'Create an async function',
        language: 'javascript',
      },
      {
        name: 'Try Catch',
        prefix: 'try',
        body: ['try {', '\t${1}', '} catch (${2:error}) {', '\t${3}', '}'],
        description: 'Create a try-catch block',
        language: 'javascript',
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
}
