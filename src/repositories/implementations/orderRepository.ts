import { Order, Prisma } from "@/generated/prisma";
import { IOrdersRepository } from "../interfaces/IOrdersRepository";
import { prisma } from "@/lib/prisma";

export class OrdersRepository implements IOrdersRepository {

    async create(data: Prisma.OrderCreateInput): Promise<Order> {
        return await prisma.order.create({
            data
        });
    }

    async findById(id: string): Promise<Order | null> {
        return await prisma.order.findUnique({
            where: { id }
        });
    }

    async findAll(): Promise<Order[]> {
        return await prisma.order.findMany({
            orderBy: { orderDate: "desc" },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: { select: { id: true, name: true, price: true } }
                    }
                }
            }
        });
    }

    async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
        return await prisma.order.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Order> {
        // Önce order_items silinsin
        await prisma.orderItem.deleteMany({ where: { orderId: id } });
        // Sonra sipariş silinsin
        return await prisma.order.delete({
            where: { id }
        });
    }
}
