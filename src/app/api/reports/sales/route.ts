import { NextRequest } from 'next/server';
import { OrderService } from '@/modules/orders/services/orderService';
import { OrdersRepository } from '@/repositories/implementations/orderRepository';
import { successResponse, errorResponse } from '@/utils/api';

const orderService = new OrderService(new OrdersRepository());

// GET /api/reports/sales?from=2025-08-01&to=2025-08-31&customer=...&product=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const customer = searchParams.get('customer');
    const product = searchParams.get('product');
    const status = searchParams.get('status');

    // Tüm siparişleri detaylı çek
    const { orders: allOrders } = await orderService.getOrders({});
    // Filtrele
  let filtered = allOrders as any[];
  if (from) filtered = filtered.filter((o: any) => new Date(o.orderDate) >= new Date(from));
  if (to) filtered = filtered.filter((o: any) => new Date(o.orderDate) <= new Date(to));
  if (customer) filtered = filtered.filter((o: any) => o.customerId === customer);
  if (status) filtered = filtered.filter((o: any) => o.status === status);
  if (product) filtered = filtered.filter((o: any) => Array.isArray(o.items) && o.items.some((i: any) => i.productId === product));

    // Tablo için düz veri
    const rows = filtered.flatMap((order: any) =>
      Array.isArray(order.items) ? order.items.map((item: any) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        date: order.orderDate,
        customer: order.customer?.name || '',
        product: item.product?.name || '',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.total,
        status: order.status
      })) : []
    );
    return successResponse(rows);
  } catch (error) {
    return errorResponse('Satış raporu alınamadı', 500);
  }
}
