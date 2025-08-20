import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '../base/baseRepository'
import { 
  ICustomerRepository, 
  CreateCustomerDTO, 
  UpdateCustomerDTO, 
  CustomerFilters 
} from '../interfaces/ICustomerRepository'
import { Customer, User } from '@/types'

function mapUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '', // dummy
    role: 'USER', // dummy
    isActive: true, // dummy
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

function mapCustomer(prismaCustomer: any): Customer {
  return {
    ...prismaCustomer,
    createdByUser: prismaCustomer.createdByUser ? mapUser(prismaCustomer.createdByUser) : undefined,
    orders: prismaCustomer.orders || [],
    invoices: prismaCustomer.invoices || []
  }
}

export class CustomerRepository extends BaseRepository<Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters> 
  implements ICustomerRepository {

  async findManyPaginated(filters: CustomerFilters = {}, page = 1, limit = 10) {
    const where = this.buildWhereClause(filters);
    const [total, data] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        include: this.getIncludeRelations(),
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);
    return {
      data: data.map(mapCustomer),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  constructor(prisma: PrismaClient) {
    super(prisma, 'customer')
  }

  protected getIncludeRelations() {
    return {
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        } 
      },
      orders: true,
      invoices: true
    }
  }

  protected buildWhereClause(filters?: CustomerFilters) {
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters?.company) {
      where.company = { contains: filters.company, mode: 'insensitive' }
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.email) {
      where.email = filters.email
    }

    if (filters?.createdBy) {
      where.createdBy = filters.createdBy
    }

    return where
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      const customer = await this.prisma.customer.findFirst({
        where: { email },
        include: this.getIncludeRelations()
      })
      return customer ? mapCustomer(customer) : null
    } catch (error) {
      throw new Error(`Error finding customer by email: ${error}`)
    }
  }

  async findByCompany(company: string): Promise<Customer[]> {
    try {
      console.log('Finding customers by company:', company)
      const customers = await this.prisma.customer.findMany({
        where: { 
          company: { contains: company } 
        },
        include: this.getIncludeRelations()
      })
      return customers.map(mapCustomer)
    } catch (error) {
      throw new Error(`Error finding customers by company: ${error}`)
    }
  }

  async findByTaxNumber(taxNumber: string): Promise<Customer | null> {
    try {
      const customer = await this.prisma.customer.findFirst({
        where: { taxNumber },
        include: this.getIncludeRelations()
      })
      return customer ? mapCustomer(customer) : null
    } catch (error) {
      throw new Error(`Error finding customer by tax number: ${error}`)
    }
  }

  async getCustomerStats(): Promise<{
    total: number
    active: number
    inactive: number
  }> {
    try {
      const [total, active] = await Promise.all([
        this.prisma.customer.count(),
        this.prisma.customer.count({ where: { isActive: true } })
      ])

      return {
        total,
        active,
        inactive: total - active
      }
    } catch (error) {
      throw new Error(`Error getting customer stats: ${error}`)
    }
  }

  async getCustomerHistory(customerId: string): Promise<{
    orders: Array<{
      id: string
      orderNumber: string
      status: string
      totalAmount: number
      orderDate: Date
    }>
    invoices: Array<{
      id: string
      invoiceNumber: string
      status: string
      amount: number
      dueDate: Date
    }>
    payments: Array<{
      id: string
      amount: number
      method: string
      status: string
      paymentDate: Date
    }>
  }> {
    try {
      const [orders, invoices, payments] = await Promise.all([
        this.prisma.order.findMany({
          where: { customerId },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            orderDate: true
          },
          orderBy: { orderDate: 'desc' }
        }),
        this.prisma.invoice.findMany({
          where: { customerId },
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            totalAmount: true,
            dueDate: true
          },
          orderBy: { issueDate: 'desc' }
        }),
        this.prisma.payment.findMany({
          where: {
            order: { customerId }
          },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            paymentDate: true
          },
          orderBy: { paymentDate: 'desc' }
        })
      ])

      return {
        orders: orders.map((order: any) => ({
          ...order,
          amount: order.totalAmount
        })),
        invoices: invoices.map((invoice: any) => ({
          ...invoice,
          amount: invoice.totalAmount
        })),
        payments
      }
    } catch (error) {
      throw new Error(`Error getting customer history: ${error}`)
    }
  }
} 