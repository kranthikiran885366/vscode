export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message)
  }
}

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('token', token)
  else localStorage.removeItem('token')
}

/**
 * Calls the backend through the Next.js `/api/*` rewrite, attaches the JWT and
 * unwraps the `{ success, data }` envelope used by the Express server.
 */
export async function api<T = any>(path: string, options: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = options
  const token = getToken()
  const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/auth/')) {
      setToken(null)
      window.location.href = '/auth/login'
    }
    const message = body?.message || body?.error?.message || `Request failed (${res.status})`
    const details = body?.error?.details?.errors || body?.details
    throw new ApiError(res.status, Array.isArray(details) ? `${message}: ${details.join(', ')}` : message, details)
  }
  return (body && typeof body === 'object' && 'data' in body ? body.data : body) as T
}

const EXTENSION_LANGUAGES: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', py: 'python', java: 'java',
  cpp: 'cpp', cc: 'cpp', c: 'cpp', h: 'cpp', go: 'go', rs: 'rust',
  html: 'html', htm: 'html', css: 'css', sql: 'sql', md: 'markdown',
  json: 'json', xml: 'xml', yml: 'yaml', yaml: 'yaml',
}

export function languageFromFileName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  return EXTENSION_LANGUAGES[ext] || 'plaintext'
}
