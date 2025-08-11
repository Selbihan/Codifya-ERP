import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// GET /api/auth/profile - Oturum bilgisini döner
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET || 'gizliAnahtar'
    try {
      const decoded: any = jwt.verify(token, secret)
      return NextResponse.json({ success: true, user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
        name: decoded.username // Geçici: kullanıcı adı name olarak
      }})
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Geçersiz oturum' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Profil alınamadı' }, { status: 500 })
  }
}

export async function OPTIONS() { return NextResponse.json({}) }
