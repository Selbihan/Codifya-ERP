import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

interface RegisterRequest{
  email: string;
  password:string;
  firstName: string;
  lastName: string;
  username: string;
  role?: 'ADMIN' | 'MANAGER' | 'USER';  
}

// POST Handler Fonksiyonu - HTTP POST isteklerini karşılar
export async function POST(request:NextRequest) {
  const body:RegisterRequest =await request.json();
  const { email, password, firstName, lastName, username, role='USER' } = body;
try{
  if(!email || !password || !username){
    return NextResponse.json(
      { error: 'Email, kullanıcı adı ve şifre alanları zorunludur.' },
      { status: 400 }
    );
  }

  // Email format kontrolü
  if(!email.includes('@')|| !email.includes('.')){
    return NextResponse.json(
      {
        error: 'Geçersiz email formatı'
      },
      { status: 400 }
    );  
  }

  // password güvenlik kontrolü
  if(password.length<8){
    return NextResponse.json(
      {
        error: 'Password en az 8 karakter olmalıdır'
      },
      { status: 400 }
    );
  } 

  // Email tekil kontrolü
  const existingEmail = await prisma.user.findUnique({
    where : { email: email }
  });
    if (existingEmail) {
      return NextResponse.json(
        {
          error: 'Bu email zaten kayıtlı.'
        },
        { status: 400 }
      );
    }

  // Username tekil kontrolü
  const existingUser = await prisma.user.findFirst({
    where : { username: username }
  });
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Bu kullanıcı adı zaten kayıtlı.'
        },
        { status: 400 }
      );
    }

 
  // Password'u hash'le
  const hashedPassword = await bcrypt.hash(password, 10);

  //Kullanıcıyı veritabanına ekleme
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: firstName && lastName ? firstName + ' ' + lastName : username,
      username: username,
      role: role,
      createdBy: null,
      code: username, 
    }
  });

  // 9. Başarılı sonucu geri döndür (password'u gösterme!)
  return NextResponse.json({
    message: 'Kullanıcı başarıyla oluşturuldu',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      code: user.code,
      role: user.role
    }
  }, { status: 201 });

} catch (error) {
  // Hata detaylarını console'a yazdır
  console.error('Register API Error:', error);
  
  // Prisma hata türlerini kontrol et
  if (error instanceof Error) {
    // Prisma unique constraint hatası
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          error: 'Bu email veya username zaten kullanılıyor.',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Prisma validation hatası
    if (error.message.includes('Invalid') || error.message.includes('Required')) {
      return NextResponse.json(
        {
          error: 'Geçersiz veri formatı.',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    // Database bağlantı hatası
    if (error.message.includes('connect') || error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Veritabanı bağlantı hatası.',
          details: error.message
        },
        { status: 503 }
      );
    }
  }
  
  // Genel hata durumu - development modunda detayları göster
  return NextResponse.json(
    {
      error: 'Bir hata oluştu.',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
    },
    { status: 500 }
  );
}
}

// password güvenlik kontrolü
