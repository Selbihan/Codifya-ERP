import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '../base/baseRepository'
import {
  IPaymentRepository,
  CreatePaymentDTO,
  UpdatePaymentDTO,
  PaymentFilters,
  PaymentMethod,
  PaymentStatus
} from '../interfaces/paymentRepository'
import { Payment, Order, User } from '@/types'

// Prisma'dan dönen veriyi User tipine uygun şekilde map'le
function mapUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: "",
    role: "USER",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Prisma'dan dönen veriyi Order tipine uygun şekilde map'le (basit versiyon)
function mapOrder(prismaOrder: any): Order {
  return {
    id: prismaOrder.id,
    orderNumber: prismaOrder.orderNumber,
    customerId: prismaOrder.customerId, // Burada sadece customerId var
    status: prismaOrder.status,
    totalAmount: prismaOrder.totalAmount,
    taxAmount: prismaOrder.taxAmount,
    discount: prismaOrder.discount,
    notes: prismaOrder.notes,
    orderDate: prismaOrder.orderDate,
    createdAt: prismaOrder.createdAt,
    updatedAt: prismaOrder.updatedAt,
    createdBy: prismaOrder.createdBy,
  }
}

function mapPayment(prismaPayment: any): Payment {
  return {
    id: prismaPayment.id,
    orderId: prismaPayment.orderId,
    amount: prismaPayment.amount,
    method: prismaPayment.method,
    status: prismaPayment.status,
    reference: prismaPayment.reference,
    paymentDate: prismaPayment.paymentDate,
    createdAt: prismaPayment.createdAt,
    updatedAt: prismaPayment.updatedAt
  }
}

export class PaymentRepository extends BaseRepository<Payment, CreatePaymentDTO, UpdatePaymentDTO, PaymentFilters>
  implements IPaymentRepository {

  constructor(prisma: PrismaClient) {
    super(prisma, 'payment')
  }

  // BaseRepository metodlarını override ederek mapping kullan
  async create(data: CreatePaymentDTO): Promise<Payment> {
    try {
      const result = await this.prisma.payment.create({
        data,
        include: this.getIncludeRelations()
      })
      return mapPayment(result)
    } catch (error) {
      throw new Error(`Error creating payment: ${error}`)
    }
  }

  async findById(id: string): Promise<Payment | null> {
    try {
      const result = await this.prisma.payment.findUnique({
        where: { id },
        include: this.getIncludeRelations()
      })
      return result ? mapPayment(result) : null
    } catch (error) {
      throw new Error(`Error finding payment by id: ${error}`)
    }
  }

  async update(id: string, data: UpdatePaymentDTO): Promise<Payment> {
    try {
      const result = await this.prisma.payment.update({
        where: { id },
        data,
        include: this.getIncludeRelations()
      })
      return mapPayment(result)
    } catch (error) {
      throw new Error(`Error updating payment: ${error}`)
    }
  }

  async findMany(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      const where = this.buildWhereClause(filters)
      const results = await this.prisma.payment.findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' }
      })
      return results.map(mapPayment)
    } catch (error) {
      throw new Error(`Error finding payment list: ${error}`)
    }
  }

  async findOne(filters: PaymentFilters): Promise<Payment | null> {
    try {
      const where = this.buildWhereClause(filters)
      const result = await this.prisma.payment.findFirst({
        where,
        include: this.getIncludeRelations()
      })
      return result ? mapPayment(result) : null
    } catch (error) {
      throw new Error(`Error finding payment: ${error}`)
    }
  }

  async findManyPaginated(
    filters?: PaymentFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    data: Payment[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const where = this.buildWhereClause(filters)
      const skip = (page - 1) * limit

      const [rawData, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          include: this.getIncludeRelations(),
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.payment.count({ where })
      ])

      const data = rawData.map(mapPayment)

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      throw new Error(`Error finding payment paginated: ${error}`)
    }
  }

  protected getIncludeRelations() {
    return {
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerId: true, // customerId var, customer yok
          status: true,
          totalAmount: true,
          taxAmount: true,
          discount: true,
          notes: true,
          orderDate: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        }
      }
    }
  }


  protected buildWhereClause(filters?: PaymentFilters) {
    const where: any = {}
    if (filters?.orderId) where.orderId = filters.orderId
    if (filters?.method) where.method = filters.method
    if (filters?.status) where.status = filters.status
    if (filters?.dateFrom) where.paymentDate = { gte: filters.dateFrom }
    if (filters?.dateTo) where.paymentDate = { ...where.paymentDate, lte: filters.dateTo }
    if (filters?.minAmount !== undefined) where.amount = { ...where.amount, gte: filters.minAmount }
    if (filters?.maxAmount !== undefined) where.amount = { ...where.amount, lte: filters.maxAmount }
    return where
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({ 
      where: { orderId }, 
      include: this.getIncludeRelations() 
    })
    return results.map(mapPayment)
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({ 
      where: { status }, 
      include: this.getIncludeRelations() 
    })
    return results.map(mapPayment)
  }

  async findByMethod(method: PaymentMethod): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({ 
      where: { method }, 
      include: this.getIncludeRelations() 
    })
    return results.map(mapPayment)
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const result = await this.prisma.payment.update({ 
      where: { id }, 
      data: { status }, 
      include: this.getIncludeRelations() 
    })
    return mapPayment(result)
  }

  async getPaymentStats() {
    const [total, pending, completed, failed, refunded, totalAmount, avgAmount] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'REFUNDED' } }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }).then((res: any) => res._sum.amount || 0),
      this.prisma.payment.aggregate({ _avg: { amount: true } }).then((res: any) => res._avg.amount || 0)
    ])
    return {
      total,
      pending,
      completed,
      failed,
      refunded,
      totalAmount,
      averageAmount: avgAmount
    }
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    const results = await this.prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: this.getIncludeRelations()
    })
    return results.map(mapPayment)
  }
} 