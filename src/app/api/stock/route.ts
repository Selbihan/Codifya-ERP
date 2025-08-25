import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        stockMovements: { select: { type: true, quantity: true } }
      }
    });
    const result = products.map((p: any) => {
      // Başlangıç stokunu product.stock'tan al, hareketleri ekle
      let stock = p.stock || 0;
      for (const m of p.stockMovements) {
        if (m.type === 'IN' || m.type === 'ADJUSTMENT') stock += m.quantity;
        if (m.type === 'OUT') stock -= m.quantity;
      }
      return {
        id: p.id,
        name: p.name,
        stock,
        min: p.minStock
      };
    });
    return NextResponse.json({ stock: result });
  } catch (error) {
    return NextResponse.json({ error: 'Stoklar alınamadı.' }, { status: 500 });
  }
}
