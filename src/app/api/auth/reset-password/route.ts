import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Token ve yeni şifre zorunludur.' }, { status: 400 });
    }
    // Token'ı bul ve geçerliliğini kontrol et
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Token geçersiz veya süresi dolmuş.' }, { status: 400 });
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    // Kullanıcının şifresini güncelle
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });
    // Token'ı sil
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ success: true, message: 'Şifre başarıyla güncellendi.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Bir hata oluştu.' }, { status: 500 });
  }
}
