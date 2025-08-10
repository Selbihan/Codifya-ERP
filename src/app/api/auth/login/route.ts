import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import { loginController } from '@/modules/auth/controllers/loginController'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { identifier, password } = body
    const user = await loginController({ identifier, password })

    // Token'ı HTTP Only cookie olarak ayarla (manual header ile)
    const cookie = serialize('token', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 gün
    })

    const response = NextResponse.json({ message: 'Giriş başarılı', user })
    response.headers.set('Set-Cookie', cookie)
    return response
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Bir hata oluştu' }, { status: 400 })
  }
}