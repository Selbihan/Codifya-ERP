// Prisma client OrderStatus export etmiyorsa domain union tipini kullan
// Tek kaynak olarak modules/orders/types içindeki union kullanılabilir
import type { OrderStatus } from '@/modules/orders/types'


/**
 * Yeni sipariş oluşturmak için gerekli veriler
 */
export interface CreateOrderDTO {
  orderNumber: string;
  customerId: string;
  status?: OrderStatus;
  totalAmount: number;
  taxAmount?: number;
  discount?: number;
  notes?: string;
  orderDate?: Date;
  createdBy: number;
  items: CreateOrderItemDTO[];
}

/**
 * Sipariş güncellemek için gerekli veriler
 */
export interface UpdateOrderDTO {
  status?: OrderStatus;
  totalAmount?: number;
  taxAmount?: number;
  discount?: number;
  notes?: string;
  orderDate?: Date;
  items?: UpdateOrderItemDTO[];
}

/**
 * Sipariş kalemi oluşturma DTO'su
 */
export interface CreateOrderItemDTO {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Sipariş kalemi güncelleme DTO'su
 */
export interface UpdateOrderItemDTO {
  id?: string; // Mevcut kalem güncellemede kullanılır
  productId?: string;
  quantity?: number;
  price?: number;
}
