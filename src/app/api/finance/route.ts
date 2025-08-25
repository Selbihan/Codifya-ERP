import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Transaction tablosundan gelir/gider hareketleri çek
    const finance = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        category: true,
        amount: true,
        date: true,
        description: true
      }
    });
    // type alanını Türkçe'ye çevir
    const result = finance.map((f: any) => ({
      ...f,
      type: f.type === 'INCOME' ? 'Gelir' : f.type === 'EXPENSE' ? 'Gider' : f.type
    }));
    return NextResponse.json({ finance: result });
  } catch (error) {
    return NextResponse.json({ error: 'Finans verileri alınamadı.' }, { status: 500 });
  }
}
