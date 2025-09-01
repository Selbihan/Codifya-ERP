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
  createdByUser?: {
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

// Basit order ve invoice tipleri
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

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  newCustomersThisMonth: number
  totalOrders?: number
  totalRevenue?: number
  topCustomers: Array<{
    customer: {
      id: string
      name: string
      company?: string
    }
    totalOrders: number
    totalRevenue: number
    totalSpent: number
  }>
  customerGrowth: Array<{
    month: string
    count: number
  }>
}
