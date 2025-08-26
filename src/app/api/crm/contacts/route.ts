import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: { contacts } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Bilinmeyen hata' }, { status: 500 });
  }
}
