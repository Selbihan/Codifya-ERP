// Register API Route Handler
// POST /api/auth/register - Kullanıcı kaydı

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/modules/auth/services/authService'
import { validateRegisterRequest, checkRateLimit, addCorsHeaders, addSecurityHeaders } from '@/middleware/validation'
import { RegisterRequest } from '@/types/auth'

// AuthService instance'ı oluştur
const authService = new AuthService()

// POST - Kullanıcı kaydı
export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü - IP'yi headers'dan al
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, 3, 60 * 60 * 1000) // 1 saatte 3 kayıt
    
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: 'Çok fazla kayıt denemesi',
          message: 'Lütfen daha sonra tekrar deneyin',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      )
      
      return addCorsHeaders(addSecurityHeaders(response))
    }

    // Request body'yi al ve doğrula
    const body = await request.json()
    const validation = validateRegisterRequest(body)
    
    if (!validation.isValid) {
      const response = NextResponse.json(
        {
          error: 'Geçersiz kayıt verisi',
          details: validation.errors
        },
        { status: 400 }
      )
      
      return addCorsHeaders(addSecurityHeaders(response))
    }

    // Register işlemini gerçekleştir
    const registerData: RegisterRequest = {
      email: body.email.trim().toLowerCase(),
      password: body.password,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      username: body.username.trim(),
      role: body.role || 'USER' // Varsayılan rol USER
    }

    // AuthService'i kullan - hata durumunda exception fırlatır
    const result = await authService.register(registerData)

    // Başarılı kayıt - JWT'yi cookie olarak set et
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
        remainingAttempts: rateLimit.remainingRequests
      },
      { status: 201 }
    )

    // JWT'yi HttpOnly cookie olarak set et
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 saat
      path: '/'
    })

    return addCorsHeaders(addSecurityHeaders(response))

  } catch (error) {
    console.error('Register API Error:', error)
    
    // Service layer'dan gelen hata mesajını kullan
    const errorMessage = error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu'
    
    // Duplicate key hataları için özel mesaj
    let statusCode = 400
    if (errorMessage.includes('Email') || errorMessage.includes('Username')) {
      statusCode = 409 // Conflict
    }
    
    const response = NextResponse.json(
      {
        error: 'Kayıt başarısız',
        message: errorMessage
      },
      { status: statusCode }
    )
    
    return addCorsHeaders(addSecurityHeaders(response))
  }
}

// OPTIONS - CORS pre-flight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  return addCorsHeaders(response)
}

