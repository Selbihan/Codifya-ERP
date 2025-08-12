import { PrismaClient, Order, Prisma } from "@/generated/prisma";
import { IOrdersRepository } from "../interfaces/IOrdersRepository";

export class OrdersRepository implements IOrdersRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(data: Prisma.OrderCreateInput): Promise<Order> {
        return await this.prisma.order.create({
            data
        });
    }

    async findById(id: string): Promise<Order | null> {
        return await this.prisma.order.findUnique({
            where: { id }
        });
    }

    async findAll(): Promise<Order[]> {
        return await this.prisma.order.findMany({
            orderBy: { orderDate: "desc" }
        });
    }

    async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
        return await this.prisma.order.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<Order> {
        return await this.prisma.order.delete({
            where: { id }
        });
    }
}
