import { Customer } from '@/types'
import { IBaseRepository } from './baseRepository'

export interface CreateCustomerDTO {
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  taxNumber?: string
  createdBy: string
}

export interface UpdateCustomerDTO {
  name?: string
  email?: string
  phone?: string
  address?: string
  company?: string
  taxNumber?: string
  isActive?: boolean
}

export interface CustomerFilters {
  search?: string
  company?: string
  isActive?: boolean
  email?: string
  createdBy?: string
}

export interface ICustomerRepository extends IBaseRepository<Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters> {
  findByEmail(email: string): Promise<Customer | null>
  findByCompany(company: string): Promise<Customer[]>
  findByTaxNumber(taxNumber: string): Promise<Customer | null>
  getCustomerStats(): Promise<{
    total: number
    active: number
    inactive: number
  }>
  getCustomerHistory(customerId: string): Promise<{
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
  }>
} 