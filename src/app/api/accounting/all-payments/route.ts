import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tüm ödemeleri getir
export async function GET(request: NextRequest) {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        order: {
          select: { orderNumber: true, customerId: true }
        }
      }
    });
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ödemeler alınamadı', error }, { status: 500 });
  }
}
