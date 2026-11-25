import { logger } from '../utils/logger'

const OPENAI_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export const isLLMConfigured = (): boolean => !!process.env.OPENAI_API_KEY

/**
 * Sends a chat request to an OpenAI-compatible API. Returns null when no key is
 * configured or the call fails, so callers can fall back to canned replies.
 */
export async function chatCompletion(system: string, user: string): Promise<string | null> {
  if (!isLLMConfigured()) return null
  try {
    const res = await fetch(`${OPENAI_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      logger.warn('LLM request failed', 'LLM', { status: res.status })
      return null
    }
    const data: any = await res.json()
    return data.choices?.[0]?.message?.content ?? null
  } catch (error) {
    logger.warn('LLM request error', 'LLM', { error: (error as Error).message })
    return null
  }
}
