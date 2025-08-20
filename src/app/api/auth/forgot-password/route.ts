import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { sendResetEmail } from '@/lib/email'; // Gerçek projede e-posta gönderimi için
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'E-posta zorunludur' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı' }, { status: 404 });
    }
    // Token üret
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 dakika geçerli
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: expires
      }
    });
    // E-posta gönderimi (dummy)
    // await sendResetEmail(email, token);
    console.log(`Şifre sıfırlama linki: http://localhost:3000/reset-password?token=${token}`);
    return NextResponse.json({ success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Bir hata oluştu' }, { status: 500 });
  }
}
