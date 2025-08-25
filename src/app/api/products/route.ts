import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ürünleri ve her ürünün toplam satış miktarını (OrderItem.quantity toplamı) çek
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        orderItems: { select: { quantity: true } }
      }
    });
    // Her ürün için toplam satış miktarını hesapla
    const result = products.map((p: {
      id: string;
      name: string;
      stock: number;
      price: number;
      orderItems: { quantity: number }[];
    }) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      price: p.price,
      sales: p.orderItems.reduce((sum: number, oi: { quantity: number }) => sum + oi.quantity, 0)
    }));
    return NextResponse.json({ products: result });
  } catch (error) {
    return NextResponse.json({ error: 'Ürünler alınamadı.' }, { status: 500 });
  }
}
