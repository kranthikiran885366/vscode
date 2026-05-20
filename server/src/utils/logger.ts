enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  error?: any
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatLog(entry: LogEntry): string {
    const logObj = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.data && { data: entry.data }),
      ...(entry.error && { error: entry.error }),
      ...(entry.stack && { stack: entry.stack }),
    }
    return JSON.stringify(logObj)
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: any) {
    const timestamp = new Date().toISOString()
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(data && { data }),
      ...(error && { error: error.message || String(error) }),
      ...(error?.stack && { stack: error.stack }),
    }

    const logMessage = this.formatLog(entry)

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) console.log('[DEBUG]', logMessage)
        break
      case LogLevel.INFO:
        console.log('[INFO]', logMessage)
        break
      case LogLevel.WARN:
        console.warn('[WARN]', logMessage)
        break
      case LogLevel.ERROR:
        console.error('[ERROR]', logMessage)
        break
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.log(LogLevel.WARN, message, context, data)
  }

  error(message: string, context?: string, error?: any) {
    this.log(LogLevel.ERROR, message, context, undefined, error)
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, userId?: string, data?: any) {
    this.info(`${method} ${path}`, 'API_REQUEST', { userId, ...data })
  }

  /**
   * Log API response
   */
  logResponse(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    this.info(`${method} ${path} - ${statusCode}`, 'API_RESPONSE', { userId, duration })
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, collection: string, duration: number, error?: any) {
    if (error) {
      this.error(`Database ${operation} failed on ${collection}`, 'DATABASE', error)
    } else {
      this.info(`Database ${operation} on ${collection}`, 'DATABASE', { duration })
    }
  }
}

export const logger = new Logger()
