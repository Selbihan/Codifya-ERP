import { User, Product, Payment } from '@/types'


// Customer interface'ini burada tanımlayalım
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
  createdByUser?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  total: number
}

export interface CreateOrderItemRequest {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customer?: Customer
  status: OrderStatus
  totalAmount: number
  taxAmount: number
  discount: number
  notes: string | null
  orderDate: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  createdByUser?: User
  items: OrderItem[]
  payments: Payment[]
}

export interface CreateOrderRequest {
  customerId: string
  items: CreateOrderItemRequest[]
  notes?: string
  discount?: number
}

export interface UpdateOrderRequest {
  customerId?: string
  status?: OrderStatus
  notes?: string
  discount?: number
}

export interface OrderFilters {
  search?: string
  customerId?: string
  status?: OrderStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface OrderListResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
  topProducts: Array<{
    product?: Product
    totalQuantity: number
    totalRevenue: number
  }>
  orderGrowth: Array<{
    month: string
    count: number
    revenue: number
  }>
}

export interface OrderHistory {
  order: Order
  statusHistory: Array<{
    status: OrderStatus
    changedAt: Date
    changedBy?: User
  }>
  paymentHistory: Payment[]
} 

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED' // İade Edildi
}

