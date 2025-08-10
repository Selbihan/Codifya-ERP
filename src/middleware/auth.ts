// Auth Middleware - JWT Token Doğrulama ve Yetkilendirme
// API route'ları ve korumalı sayfalar için kimlik doğrulama

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { JWTPayload, UserRole } from '@/types/auth'

// Korumalı route'lar - giriş yapmış kullanıcı gerekli
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile', 
  '/crm',
  '/inventory',
  '/orders',
  '/accounting',
  '/api/auth/profile',
  '/api/auth/change-password'
]

// Admin route'ları - sadece admin erişebilir
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
  '/api/auth/users'
]

// Manager route'ları - manager ve admin erişebilir  
const MANAGER_ROUTES = [
  '/management',
  '/api/management'
]

// Public route'lar - herkes erişebilir
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register'
]

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Token doğrulama fonksiyonu
function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Route'un korumalı olup olmadığını kontrol et
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

// Route'un admin yetkisi gerektirip gerektirmediğini kontrol et
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

// Route'un manager yetkisi gerektirip gerektirmediğini kontrol et
function isManagerRoute(pathname: string): boolean {
  return MANAGER_ROUTES.some(route => pathname.startsWith(route))
}

// Route'un public olup olmadığını kontrol et
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))
}

// Ana middleware fonksiyonu
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Token'ı cookie'den al
  const token = request.cookies.get('token')?.value
  
  // Token'ı Authorization header'dan da kontrol et (API istekleri için)
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  
  const finalToken = token || bearerToken
  
  console.log(`🔐 Middleware: ${pathname}, Token: ${finalToken ? 'var' : 'yok'}`)

  // Public route ise direkt geç
  if (isPublicRoute(pathname)) {
    // Eğer kullanıcı giriş yapmışsa ve login/register sayfasındaysa dashboard'a yönlendir
    if (finalToken && (pathname === '/login' || pathname === '/register')) {
      const decoded = verifyToken(finalToken)
      if (decoded) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Korumalı route ise token kontrolü yap
  if (isProtectedRoute(pathname)) {
    if (!finalToken) {
      console.log('❌ Token yok, login sayfasına yönlendiriliyor')
      
      // API isteği ise 401 döndür
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Yetkilendirme gerekli' },
          { status: 401 }
        )
      }
      
      // Sayfa isteği ise login'e yönlendir
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Token'ı doğrula
    const decoded = verifyToken(finalToken)
    if (!decoded) {
      console.log('❌ Geçersiz token, login sayfasına yönlendiriliyor')
      
      // API isteği ise 401 döndür  
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Geçersiz token' },
          { status: 401 }
        )
      }
      
      // Sayfa isteği ise login'e yönlendir
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Admin route kontrolü
    if (isAdminRoute(pathname)) {
      if (decoded.role !== UserRole.ADMIN) {
        console.log('❌ Admin yetkisi gerekli')
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Admin yetkisi gerekli' },
            { status: 403 }
          )
        }
        
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Manager route kontrolü  
    if (isManagerRoute(pathname)) {
      if (decoded.role !== UserRole.ADMIN && decoded.role !== UserRole.MANAGER) {
        console.log('❌ Manager yetkisi gerekli')
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Manager yetkisi gerekli' },
            { status: 403 }
          )
        }
        
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // User bilgilerini header'a ekle (API route'ları için)
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId.toString())
    response.headers.set('x-user-email', decoded.email)
    response.headers.set('x-user-role', decoded.role)
    
    console.log(`✅ Yetkilendirme başarılı: ${decoded.email} (${decoded.role})`)
    return response
  }

  // Diğer durumlar için devam et
  return NextResponse.next()
}

// Middleware'in hangi route'larda çalışacağını belirle
export const config = {
  matcher: [
    // Tüm sayfalar (static dosyalar hariç)
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // API route'ları
    '/api/:path*'
  ]
}
