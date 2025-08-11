// Merkezi logging sistemi
import { config } from '@/config'
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

export type ILogger = {
  error(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  debug(message: string, context?: Record<string, any>): void
}

export class Logger implements ILogger {
  private isDevelopment = config.isDev
  private levelPriority: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
  }
  private currentLevel: LogLevel = (config.logging.level as LogLevel) || LogLevel.INFO

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }
  }

  private shouldLog(level: LogLevel) {
    return this.levelPriority[level] <= this.levelPriority[this.currentLevel]
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return
    const logEntry = this.formatLog(level, message, context)
    const base = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`
    if (this.isDevelopment) {
      const colorMap: Record<LogLevel, string> = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[90m'
      }
      const reset = '\x1b[0m'
      console.log(`${colorMap[level]}${base}${reset}`, context || '')
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }
}

export const logger = new Logger() 