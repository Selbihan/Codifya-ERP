import { NextRequest, NextResponse } from 'next/server';  // Next.js API
import { prisma } from '@/lib/prisma';                     // Database
import bcrypt from 'bcryptjs';                             // Password karşılaştırma
import jwt from 'jsonwebtoken';                            // Token oluşturma

interface LoginRequest{
username:string;
password:string;
} 

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;
    if(!username || !password){
      return NextResponse.json(
        {
          error: 'Kullanıcı adı ve şifre alanları zorunludur.'
        },
        { status: 400 }
      );
    }

    if(password.length<8){
      return NextResponse.json({
        error:'Password en az 8 karakter uzunluğunda olmalıdır.'
      },
      { status: 400 }
    )
    }
    
    // Kullanıcıyı username ile bul
    const user = await prisma.user.findFirst({
      where: { username: username }
    });

    // Kullanıcı bulunamazsa hata ver
    if (!user) {
      return NextResponse.json(
        {
          error: 'Kullanıcı adı veya şifre hatalı.'
        },
        { status: 401 }
      );
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      return NextResponse.json(
        {
          error: 'Hesabınız deaktif durumda.'
        },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et (hash karşılaştırması)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Kullanıcı adı veya şifre hatalı.'
        },
        { status: 401 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Başarılı login response
    return NextResponse.json({
      message: 'Giriş başarılı',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        code: user.code,
        role: user.role,
        department: user.department,
        language: user.language
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
      },
      { status: 500 }
    );
  }
}