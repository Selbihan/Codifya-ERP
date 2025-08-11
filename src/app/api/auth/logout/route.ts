import { NextResponse } from 'next/server'

// POST /api/auth/logout - Kullanıcı çıkışı
export async function POST() {
  // Hem login hem register farklı cookie isimleri kullanmış olabilir
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı' })

  // 'token' cookie (login) temizle
  response.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 })
  // 'auth-token' cookie (register sonrası) temizle
  response.cookies.set('auth-token', '', { httpOnly: true, path: '/', maxAge: 0 })

  return response
}

export async function OPTIONS() {
  return NextResponse.json({})
}
