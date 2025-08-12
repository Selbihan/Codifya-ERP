import { Request, Response } from "express";
import { OrderService } from "../services/orderService";

export class OrderController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    this.orderService = orderService;
  }

  // Yeni sipariş oluşturma
  async createOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      const newOrder = await this.orderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      res.status(400).json({ error: message });
    }
  }

  // Tüm siparişleri listele
  async listOrders(req: Request, res: Response) {
    try {
      const { page, limit, status, customerId } = req.query;
      const options = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status as any,
        customerId: customerId as string | undefined,
      };
      const orders = await this.orderService.listOrders(options);
      res.json(orders);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sunucu hatası';
      res.status(500).json({ error: message });
    }
  }

  // ID’ye göre sipariş getir
  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      res.json(order);
    } catch (error: unknown) {
      const isNotFound = error instanceof Error && error.name === 'OrderNotFoundError';
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
      res.status(isNotFound ? 404 : 400).json({ error: message });
    }
  }

  // Sipariş güncelle
  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedOrder = await this.orderService.updateOrder(id, updateData);
      res.json(updatedOrder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Güncelleme hatası';
      res.status(400).json({ error: message });
    }
  }

  // Sipariş durumunu güncelle
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedOrder = await this.orderService.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Durum güncelleme hatası';
      res.status(400).json({ error: message });
    }
  }

  // Sipariş sil
  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedOrder = await this.orderService.deleteOrder(id);
      res.json(deletedOrder);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Silme hatası';
      res.status(400).json({ error: message });
    }
  }
}
