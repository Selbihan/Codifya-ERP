import { Order, Prisma } from "@/generated/prisma"; 

export interface IOrdersRepository {
    create(data: Prisma.OrderCreateInput): Promise<Order>;
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
    update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
    delete(id: string): Promise<Order>;
}
