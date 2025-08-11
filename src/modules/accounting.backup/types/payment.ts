export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Payment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string | null
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentRequest {
  orderId: string
  amount: number
  method: PaymentMethod
  reference?: string
}

export interface UpdatePaymentRequest {
  amount?: number
  method?: PaymentMethod
  status?: PaymentStatus
  reference?: string
}

export interface PaymentFilters {
  orderId?: string
  status?: PaymentStatus
  method?: PaymentMethod
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface PaymentListResponse {
  payments: Payment[]
  total: number
  page: number
  limit: number
  totalPages: number
} 