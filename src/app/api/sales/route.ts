import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customer: { select: { name: true } },
        items: { select: { product: { select: { name: true } }, quantity: true, price: true } },
        orderDate: true,
        status: true
      }
    });
    // Her satış için toplamı hesapla ve ilk ürünü, müşteri adını düzleştir
    const result = sales.map((sale: any) => {
      const total = sale.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      return {
        id: sale.id,
        orderNumber: sale.orderNumber,
        product: sale.items[0]?.product?.name || '',
        customer: sale.customer?.name || '',
        amount: total,
        date: sale.orderDate,
        status: sale.status
      };
    });
    return NextResponse.json({ sales: result });
  } catch (error) {
    return NextResponse.json({ error: 'Satışlar alınamadı.' }, { status: 500 });
  }
}
