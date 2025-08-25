import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Sadece raporlar için sade sipariş listesi
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customer: { select: { name: true } },
        orderDate: true,
        status: true,
        items: { select: { price: true, quantity: true } }
      }
    });
    const result = orders.map((order: any) => {
      const total = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer?.name || '',
        amount: total,
        date: order.orderDate,
        status: order.status
      };
    });
    return NextResponse.json({ orders: result });
  } catch (error) {
    return NextResponse.json({ error: 'Siparişler alınamadı.' }, { status: 500 });
  }
}
