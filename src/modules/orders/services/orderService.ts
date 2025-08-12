import { IOrdersRepository } from "@/repositories/interfaces/IOrdersRepository";
import { Order, Prisma } from "@/generated/prisma";
import { 
  CreateOrderDTO, 
  UpdateOrderDTO, 
  CreateOrderItemDTO,
  UpdateOrderItemDTO 
} from "@/types/orders";
import { OrderStatus } from "@/modules/orders/types";
import { OrderFilters, CreateOrderRequest } from '@/modules/orders/types'

// Custom error classes
export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order with ID ${id} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderDataError extends Error {
  constructor(message: string) {
    super(`Invalid order data: ${message}`);
    this.name = 'InvalidOrderDataError';
  }
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(`Order validation failed: ${message}`);
    this.name = 'OrderValidationError';
  }
}

export class OrderService {
  private orderRepo: IOrdersRepository;

  constructor(orderRepository: IOrdersRepository) {
    this.orderRepo = orderRepository;
  }

  /**
   * Yeni sipariş oluşturur
   * İş kuralları ve validasyonlar içerir
   */
  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    // Validasyonlar
    await this.validateOrderData(orderData);
    
    // İş kuralları
    const processedData = await this.processOrderCreation(orderData);
    
    // Sipariş numarası benzersizlik kontrolü
    await this.ensureUniqueOrderNumber(orderData.orderNumber);

    // Repository'ye gönder
    return await this.orderRepo.create(processedData);
  }

  /**
   * Route katmanındaki CreateOrderRequest + createdBy parametresini destekler
   */
  async createOrderFromRequest(req: CreateOrderRequest, createdBy: number): Promise<Order> {
    const dto: CreateOrderDTO = {
      orderNumber: this.generateOrderNumber(),
      customerId: req.customerId,
      status: OrderStatus.PENDING,
      totalAmount: 0, // Hesaplanacak
      taxAmount: 0,
      discount: req.discount || 0,
      notes: req.notes,
      orderDate: new Date(),
      createdBy,
      items: req.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: 0 })) // Fiyat lookup TODO
    }

    // Ürün fiyatlarını bağlayıp total hesaplaması yapılmalı (TODO)
    return this.createOrder(dto)
  }

  /**
   * Filtrelenmiş siparişleri getirir (şimdilik in-memory filtre; repository geliştirilince optimize edilecek)
   */
  async getOrders(filters: OrderFilters): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number; }> {
    const all = await this.orderRepo.findAll()
    let filtered = all
    if (filters.search) {
      filtered = filtered.filter(o => o.orderNumber.includes(filters.search!) || (o.notes || '').includes(filters.search!))
    }
    if (filters.customerId) {
      filtered = filtered.filter(o => o.customerId === filters.customerId)
    }
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status)
    }
    // Tarih aralığı kontrolü (orderDate)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      filtered = filtered.filter(o => new Date(o.orderDate) >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      filtered = filtered.filter(o => new Date(o.orderDate) <= to)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)
    return { orders: paged, total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }
  }

  /**
   * Sipariş geçmişi (şimdilik placeholder)
   */
  async getOrderHistory(id: string): Promise<{ order: Order; statusHistory: Array<{ status: OrderStatus; changedAt: Date }>; }> {
    const order = await this.getOrderById(id)
    // TODO: Gerçek history tablosu eklenince güncellenecek
    return {
      order,
      statusHistory: [ { status: order.status as OrderStatus, changedAt: new Date(order.updatedAt) } ]
    }
  }

  private generateOrderNumber(): string {
    return 'ORD-' + Date.now().toString(36).toUpperCase()
  }

  /**
   * Tüm siparişleri listeler (sayfalama ve filtreleme ile)
   */
  async listOrders(options?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    customerId?: string;
  }): Promise<Order[]> {
    // TODO: Repository'ye filtreleme parametreleri eklendiğinde güncellenecek
    return await this.orderRepo.findAll();
  }

  /**
   * ID'ye göre sipariş getirir
   */
  async getOrderById(id: string): Promise<Order> {
    if (!id || id.trim() === '') {
      throw new InvalidOrderDataError('Order ID is required');
    }

    const order = await this.orderRepo.findById(id);
    
    if (!order) {
      throw new OrderNotFoundError(id);
    }

    return order;
  }

  /**
   * Siparişi günceller
   */
  async updateOrder(id: string, updateData: UpdateOrderDTO): Promise<Order> {
    // Mevcut siparişin varlığını kontrol et
    await this.getOrderById(id);

    // Güncelleme verilerini validate et
    await this.validateUpdateData(updateData);

    // İş kurallarını uygula
    const processedData = await this.processOrderUpdate(updateData);

    return await this.orderRepo.update(id, processedData);
  }

  /**
   * Sipariş durumunu günceller
   */
  async updateOrderStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const existingOrder = await this.getOrderById(id);
    
    // Durum geçişi kontrolü
    this.validateStatusTransition(existingOrder.status as OrderStatus, newStatus);

    return await this.orderRepo.update(id, { status: newStatus });
  }

  /**
   * Siparişi siler (soft delete tercih edilebilir)
   */
  async deleteOrder(id: string): Promise<Order> {
    // Mevcut siparişin varlığını kontrol et
    await this.getOrderById(id);

    // Silme işlemi öncesi kontroller
    await this.validateOrderDeletion(id);

    return await this.orderRepo.delete(id);
  }

  /**
   * Müşterinin siparişlerini getirir
   */
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    if (!customerId || customerId.trim() === '') {
      throw new InvalidOrderDataError('Customer ID is required');
    }

    // TODO: Repository'de customer bazlı filtreleme eklendiğinde güncellenecek
    const allOrders = await this.orderRepo.findAll();
    return allOrders.filter(order => order.customerId === customerId);
  }

  /**
   * Sipariş istatistiklerini getirir
   */
  async getOrderStatistics(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }> {
    const allOrders = await this.orderRepo.findAll();
    
    return {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === OrderStatus.PENDING).length,
      confirmed: allOrders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      processing: allOrders.filter(o => o.status === OrderStatus.PROCESSING).length,
      shipped: allOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: allOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelled: allOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
    };
  }

  /**
   * Dashboard uyumlu istatistik alias'ı
   * Geçici olarak mevcut getOrderStatistics sonucunu döner.
   * İleride ek metrikler (aylık ciro, AOV, son 7 gün trendi vb.) buraya eklenecek.
   */
  async getOrderStats() {
    return this.getOrderStatistics();
  }

  /**
   * Sipariş verilerini validate eder
   */
  private async validateOrderData(data: CreateOrderDTO): Promise<void> {
    if (!data.orderNumber || data.orderNumber.trim() === '') {
      throw new OrderValidationError('Order number is required');
    }

    if (!data.customerId || data.customerId.trim() === '') {
      throw new OrderValidationError('Customer ID is required');
    }

    if (data.totalAmount < 0) {
      throw new OrderValidationError('Total amount cannot be negative');
    }

    if (data.taxAmount && data.taxAmount < 0) {
      throw new OrderValidationError('Tax amount cannot be negative');
    }

    if (data.discount && data.discount < 0) {
      throw new OrderValidationError('Discount cannot be negative');
    }

    if (!data.items || data.items.length === 0) {
      throw new OrderValidationError('Order must have at least one item');
    }

    // Sipariş kalemlerini validate et
    data.items.forEach((item, index) => {
      this.validateOrderItem(item, index);
    });
  }

  /**
   * Sipariş kalemini validate eder
   */
  private validateOrderItem(item: CreateOrderItemDTO, index: number): void {
    if (!item.productId || item.productId.trim() === '') {
      throw new OrderValidationError(`Item ${index + 1}: Product ID is required`);
    }

    if (item.quantity <= 0) {
      throw new OrderValidationError(`Item ${index + 1}: Quantity must be greater than 0`);
    }

    if (item.price < 0) {
      throw new OrderValidationError(`Item ${index + 1}: Price cannot be negative`);
    }
  }

  /**
   * Güncelleme verilerini validate eder
   */
  private async validateUpdateData(data: UpdateOrderDTO): Promise<void> {
    if (data.totalAmount !== undefined && data.totalAmount < 0) {
      throw new OrderValidationError('Total amount cannot be negative');
    }

    if (data.taxAmount !== undefined && data.taxAmount < 0) {
      throw new OrderValidationError('Tax amount cannot be negative');
    }

    if (data.discount !== undefined && data.discount < 0) {
      throw new OrderValidationError('Discount cannot be negative');
    }

    if (data.items) {
      data.items.forEach((item, index) => {
        if (item.quantity !== undefined && item.quantity <= 0) {
          throw new OrderValidationError(`Item ${index + 1}: Quantity must be greater than 0`);
        }

        if (item.price !== undefined && item.price < 0) {
          throw new OrderValidationError(`Item ${index + 1}: Price cannot be negative`);
        }
      });
    }
  }

  /**
   * Sipariş numarası benzersizlik kontrolü
   */
  private async ensureUniqueOrderNumber(orderNumber: string): Promise<void> {
    // TODO: Repository'de orderNumber ile arama metodu eklendiğinde aktif edilecek
    // const existingOrder = await this.orderRepo.findByOrderNumber(orderNumber);
    // if (existingOrder) {
    //   throw new OrderValidationError(`Order number ${orderNumber} already exists`);
    // }
  }

  /**
   * Sipariş oluşturma iş kurallarını uygular
   */
  private async processOrderCreation(data: CreateOrderDTO): Promise<Prisma.OrderCreateInput> {
    // Toplam tutar hesaplama
    const calculatedTotal = this.calculateOrderTotal(data.items, data.discount, data.taxAmount);
    
    // Eğer gelen total ile hesaplanan farklıysa, hesaplanan değeri kullan
    if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
      console.warn(`Order total mismatch. Calculated: ${calculatedTotal}, Provided: ${data.totalAmount}`);
    }

    // OrderItem'ları oluştur
    const orderItems = data.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }));

    // Prisma input formatına dönüştür
    return {
      orderNumber: data.orderNumber,
      status: data.status || OrderStatus.PENDING,
      totalAmount: calculatedTotal,
      taxAmount: data.taxAmount || 0,
      discount: data.discount || 0,
      notes: data.notes,
      orderDate: data.orderDate || new Date(),
      customer: {
        connect: { id: data.customerId }
      },
      createdByUser: {
        connect: { id: data.createdBy }
      },
      items: {
        create: orderItems
      }
    };
  }

  /**
   * Sipariş güncelleme iş kurallarını uygular
   */
  private async processOrderUpdate(data: UpdateOrderDTO): Promise<Prisma.OrderUpdateInput> {
    const updateData: Prisma.OrderUpdateInput = {};

    // Temel alanları kopyala
    if (data.status !== undefined) updateData.status = data.status;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
    if (data.taxAmount !== undefined) updateData.taxAmount = data.taxAmount;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.orderDate !== undefined) updateData.orderDate = data.orderDate;

    // TODO: OrderItem güncellemeleri için daha karmaşık logic gerekli
    // Bu özellik ayrı bir metot olarak implement edilmeli

    return updateData;
  }

  /**
   * Sipariş toplam tutarını hesaplar
   */
  private calculateOrderTotal(
    items: CreateOrderItemDTO[], 
    discount: number = 0, 
    taxAmount: number = 0
  ): number {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return subtotal - discount + taxAmount;
  }

  /**
   * Durum geçişi kontrolü yapar
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [], // Final state
      [OrderStatus.CANCELLED]: [] // Final state
    };

    const allowedTransitions = validTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new OrderValidationError(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Sipariş silme öncesi kontroller
   */
  private async validateOrderDeletion(id: string): Promise<void> {
    const order = await this.getOrderById(id);
    
    // Teslim edilmiş veya işlemde olan siparişler silinemez
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.PROCESSING) {
      throw new OrderValidationError(
        `Cannot delete order with status ${order.status}`
      );
    }

    // TODO: Ödeme kontrolü
    // if (order.payments && order.payments.length > 0) {
    //   throw new OrderValidationError('Cannot delete order with existing payments');
    // }
  }
}