import { prisma } from '@/lib/prisma';

type StockMovementListItem = {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string };
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
};

export class StockMovementService {
  async getAllStockMovements(): Promise<StockMovementListItem[]> {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(mv => ({ ...mv, reference: mv.reference ?? undefined, createdBy: String(mv.createdBy) }));
  }

  async createStockMovement(data: any): Promise<StockMovementListItem> {
    // Burada stok güncelleme ve validasyon işlemleri yapılmalı
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('Ürün bulunamadı');
    const previousStock = product.stock;
    let newStock = previousStock;
    if (data.type === 'IN') newStock += data.quantity;
    else if (data.type === 'OUT') newStock -= data.quantity;
    else if (data.type === 'ADJUSTMENT') newStock = data.quantity;
    if (newStock < 0) throw new Error('Stok negatif olamaz');
    await prisma.product.update({ where: { id: data.productId }, data: { stock: newStock } });
    const movement = await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        previousStock,
        newStock,
        reason: data.reason,
        reference: data.reference,
        createdBy: data.createdBy || 'system',
      },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });
    return { ...movement, reference: movement.reference ?? undefined, createdBy: String(movement.createdBy) };
  }
}
