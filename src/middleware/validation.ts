// Validation Middleware - Giriş verilerini doğrulama
// API isteklerinde veri doğrulama ve sanitizasyon

import { NextRequest, NextResponse } from 'next/server'
import { LoginRequest, RegisterRequest } from '@/types/auth'

// Email format kontrolü
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Şifre güvenlik kontrolü
export function isValidPassword(password: string): boolean {
  // En az 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Username format kontrolü
export function isValidUsername(username: string): boolean {
  // En az 3 karakter, sadece harf, rakam ve _
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/
  return usernameRegex.test(username)
}

// Telefon format kontrolü
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

// SQL Injection koruması - tehlikeli karakterleri temizle
export function sanitizeString(input: string): string {
  return input
    .replace(/['"\\;]/g, '') // Tehlikeli karakterleri kaldır
    .trim() // Baş ve sondaki boşlukları kaldır
    .slice(0, 255) // Maksimum uzunluk sınırı
}

// XSS koruması - HTML karakterleri encode et
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Login request doğrulama
export function validateLoginRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Username/email kontrolü
  if (!data.username || typeof data.username !== 'string') {
    errors.push('Kullanıcı adı veya email zorunludur')
  } else if (data.username.length < 3) {
    errors.push('Kullanıcı adı en az 3 karakter olmalıdır')
  }

  // Şifre kontrolü
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Şifre zorunludur')
  } else if (data.password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Register request doğrulama
export function validateRegisterRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Email kontrolü
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email zorunludur')
  } else if (!isValidEmail(data.email)) {
    errors.push('Geçerli bir email adresi giriniz')
  }

  // Şifre kontrolü
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Şifre zorunludur')
  } else if (!isValidPassword(data.password)) {
    errors.push('Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir')
  }

  // Ad kontrolü
  if (!data.firstName || typeof data.firstName !== 'string') {
    errors.push('Ad zorunludur')
  } else if (data.firstName.length < 2) {
    errors.push('Ad en az 2 karakter olmalıdır')
  }

  // Soyad kontrolü
  if (!data.lastName || typeof data.lastName !== 'string') {
    errors.push('Soyad zorunludur')
  } else if (data.lastName.length < 2) {
    errors.push('Soyad en az 2 karakter olmalıdır')
  }

  // Username kontrolü
  if (!data.username || typeof data.username !== 'string') {
    errors.push('Kullanıcı adı zorunludur')
  } else if (!isValidUsername(data.username)) {
    errors.push('Kullanıcı adı en az 3 karakter olmalı, sadece harf, rakam ve _ içerebilir')
  }

  // Role kontrolü (isteğe bağlı)
  if (data.role && !['ADMIN', 'MANAGER', 'USER'].includes(data.role)) {
    errors.push('Geçersiz kullanıcı rolü')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Şifre değiştirme doğrulama
export function validateChangePasswordRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Mevcut şifre kontrolü
  if (!data.currentPassword || typeof data.currentPassword !== 'string') {
    errors.push('Mevcut şifre zorunludur')
  }

  // Yeni şifre kontrolü
  if (!data.newPassword || typeof data.newPassword !== 'string') {
    errors.push('Yeni şifre zorunludur')
  } else if (!isValidPassword(data.newPassword)) {
    errors.push('Yeni şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir')
  }

  // Şifre tekrarı kontrolü
  if (!data.confirmPassword || typeof data.confirmPassword !== 'string') {
    errors.push('Şifre tekrarı zorunludur')
  } else if (data.newPassword !== data.confirmPassword) {
    errors.push('Yeni şifreler eşleşmiyor')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Genel request doğrulama middleware'i
export function createValidationMiddleware<T>(
  validator: (data: any) => { isValid: boolean; errors: string[] }
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Request body'yi al
      const body = await request.json()
      
      // Doğrulama yap
      const validation = validator(body)
      
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: 'Geçersiz veri',
            details: validation.errors
          },
          { status: 400 }
        )
      }
      
      // Doğrulama başarılı, devam et
      return null
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Geçersiz JSON formatı'
        },
        { status: 400 }
      )
    }
  }
}

// Rate limiting için basit IP takibi
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Rate limiting kontrolü
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 dakika
): { allowed: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now()
  const ipData = requestCounts.get(ip)

  // İlk istek veya window süresi dolmuşsa
  if (!ipData || now > ipData.resetTime) {
    const resetTime = now + windowMs
    requestCounts.set(ip, { count: 1, resetTime })
    return {
      allowed: true,
      remainingRequests: maxRequests - 1,
      resetTime
    }
  }

  // Limit aşılmışsa
  if (ipData.count >= maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: ipData.resetTime
    }
  }

  // Request sayısını artır
  ipData.count++
  requestCounts.set(ip, ipData)

  return {
    allowed: true,
    remainingRequests: maxRequests - ipData.count,
    resetTime: ipData.resetTime
  }
}

// CORS header'ları ekle
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Content Security Policy header'ı ekle
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}
