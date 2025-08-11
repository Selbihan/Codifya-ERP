// Uygulama yapılandırması (merkezi config)
// Ortam değişkenlerini tek noktadan okuyup doğrular

interface AppConfig {
  env: string
  isDev: boolean
  isProd: boolean
  databaseUrl: string
  jwtSecret: string
  rateLimit: {
    windowMs: number
    max: number
  }
  logging: {
    level: string
  }
}

function required(name: string, fallback?: string): string {
  const val = process.env[name] || fallback
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  databaseUrl: required('DATABASE_URL', ''),
  jwtSecret: required('JWT_SECRET', 'dev-secret'),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100')
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}

export type { AppConfig }
