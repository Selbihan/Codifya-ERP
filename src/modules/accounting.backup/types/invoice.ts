export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'
export type InvoiceType = 'SALES' | 'PURCHASE' | 'EXPENSE'

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId?: string | null
  customerId?: string | null
  customer?: any
  type: InvoiceType
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  dueDate: Date
  issueDate: Date
  paidDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  createdByUser?: any
}

export interface CreateInvoiceRequest {
  orderId?: string
  customerId?: string
  type: InvoiceType
  subtotal: number
  taxAmount?: number
  discount?: number
  dueDate?: Date
  notes?: string
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus
  subtotal?: number
  taxAmount?: number
  discount?: number
  dueDate?: Date
  notes?: string
}

export interface InvoiceFilters {
  customerId?: string
  status?: InvoiceStatus
  type?: InvoiceType
  dateFrom?: string
  dateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  page?: number
  limit?: number
  search?: string
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  total: number
  page: number
  limit: number
  totalPages: number
} 