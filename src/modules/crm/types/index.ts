// CRM Types
export interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  company?: string | null
  taxNumber?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  createdByUser: {
    id: string
    name: string
    email: string
  }
  orders: Order[]
  invoices: Invoice[]
}

export interface CreateCustomerRequest {
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  taxNumber?: string
}

export interface UpdateCustomerRequest {
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
  page?: number
  limit?: number
}

export interface CustomerListResponse {
  customers: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  topCustomers: Array<{
    customer: Customer
    totalOrders: number
    totalSpent: number
  }>
  customerGrowth: Array<{
    month: string
    count: number
  }>
}

export interface CustomerHistory {
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
}

// Order ve Invoice tipleri (basit versiyonları)
interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  orderDate: Date
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  amount: number
  dueDate: Date
} 