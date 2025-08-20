import { validateEmail, validatePhone, validateTaxNumber, ValidationError } from '@/utils/validation'
import { CustomerRepository } from '@/repositories/implementations/customerRepository'
import { ICustomerRepository } from '@/repositories/interfaces/ICustomerRepository'
import { Logger } from '@/utils/logger'
import { PrismaClient } from '@prisma/client' 
import { Customer } from '@/types'
import { prisma } from '@/lib/prisma'


// Basit error sınıfları
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

// INPUT / DTO TYPES
export interface CreateCustomerInput {
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  taxNumber?: string
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  isActive?: boolean
}

export interface CustomerFilters {
  search?: string
  company?: string
  isActive?: boolean
  email?: string
  createdBy?: string
  page?: number
  limit?: number
}

export interface PaginatedCustomers {
  customers: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ICustomerService {
  create(data: CreateCustomerInput, userId: string): Promise<Customer>
  get(id: string): Promise<Customer>
  update(id: string, data: UpdateCustomerInput): Promise<Customer>
  remove(id: string): Promise<void>
  list(filters: CustomerFilters): Promise<PaginatedCustomers>
  stats(): Promise<{ total: number; active: number; inactive: number; newThisMonth: number }>
  history(id: string): Promise<any>
}

export class CustomerService implements ICustomerService {
  constructor(
    private repo: ICustomerRepository,
    private logger: Logger
  ) {}

  static create(): CustomerService {
    return new CustomerService(new CustomerRepository(prisma), new Logger())
  }

  // INPUT NORMALIZATION
  private normalize(input: CreateCustomerInput | UpdateCustomerInput) {
    const cleaned: any = { ...input }
    if (cleaned.name) cleaned.name = cleaned.name.trim()
    if (cleaned.email) cleaned.email = cleaned.email.trim()
    if (cleaned.phone) cleaned.phone = cleaned.phone.replace(/\s/g, '')
    if (cleaned.taxNumber) cleaned.taxNumber = cleaned.taxNumber.trim()
    if (cleaned.address) cleaned.address = cleaned.address.trim()
    if (cleaned.company) cleaned.company = cleaned.company.trim()
    return cleaned as typeof input
  }

  // VALIDATION
  private validate(input: CreateCustomerInput | UpdateCustomerInput, { isUpdate = false } = {}) {
    if (!isUpdate && !input.name) throw new ValidationError('İsim zorunlu')
    if (input.email && !validateEmail(input.email)) throw new ValidationError('Geçersiz email')
    if (input.phone && !validatePhone(input.phone)) throw new ValidationError('Geçersiz telefon')
    if (input.taxNumber && !validateTaxNumber(input.taxNumber)) throw new ValidationError('Geçersiz vergi no')
  }

  private async ensureEmailUnique(email?: string, excludeId?: string) {
    if (!email) return
    const existing = await this.repo.findByEmail(email)
    if (existing && existing.id !== excludeId) throw new ValidationError('Email zaten kullanımda')
  }

  async create(data: CreateCustomerInput, userId: string): Promise<Customer> {
    const normalized = this.normalize(data)
    this.validate(normalized)
    await this.ensureEmailUnique(normalized.email)
    console.log('normalized:', normalized, userId)
    const createdByInt = parseInt(userId as any)

    const created = await this.repo.create({
      name: normalized.name!,
      email: normalized.email ?? undefined,
      phone: normalized.phone ?? undefined,
      address: normalized.address ?? undefined,
      company: normalized.company ?? undefined,
      taxNumber: normalized.taxNumber ?? undefined,
      isActive: true, // Yeni müşteri varsayılan olarak aktif
      createdBy: createdByInt,
    })
console.log('created:', created)
    this.logger.info('Customer created', { id: created.id, userId })
    return this.mapToDomain(created)
  }

  async get(id: string): Promise<Customer> {
    const found = await this.repo.findById(id)
    if (!found) throw new NotFoundError('Müşteri bulunamadı')
    return this.mapToDomain(found)
  }

  async update(id: string, data: UpdateCustomerInput): Promise<Customer> {
    const normalized = this.normalize(data)
    this.validate(normalized, { isUpdate: true })
    if (normalized.email) await this.ensureEmailUnique(normalized.email, id)

    const updateData: UpdateCustomerInput = {
      name: normalized.name ?? undefined,
      email: normalized.email ?? undefined,
      phone: normalized.phone ?? undefined,
      address: normalized.address ?? undefined,
      company: normalized.company ?? undefined,
      taxNumber: normalized.taxNumber ?? undefined,
      ...(typeof (normalized as UpdateCustomerInput).isActive !== 'undefined' && { isActive: (normalized as UpdateCustomerInput).isActive }),
    }

    const updated = await this.repo.update(id, updateData)
    this.logger.info('Customer updated', { id })
    return this.mapToDomain(updated)
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id)
    this.logger.info('Customer deleted', { id })
  }

  async list(filters: CustomerFilters): Promise<PaginatedCustomers> {
    const { page = 1, limit = 10, ...rest } = filters
    const result = await this.repo.findManyPaginated(rest, page, limit)
    return {
      customers: result.data.map(this.mapToDomain),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }

  async stats() {
    const basic = await this.repo.getCustomerStats()
    const monthStart = new Date()
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
    const newThisMonth = await prisma.customer.count({
      where: { createdAt: { gte: monthStart } }
    })
    return {
      total: basic.total,
      active: basic.active,
      inactive: basic.inactive,
      newThisMonth
    }
  }

  async history(id: string) {
    return this.repo.getCustomerHistory(id)
  }

  // MAP PRISMA ENTITY -> DOMAIN Customer
  private mapToDomain = (c: any): Customer => ({
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    address: c.address ?? null,
    company: c.company ?? null,
    taxNumber: c.taxNumber ?? null,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    createdBy: parseInt(c.createdBy) || 0
  })
}
