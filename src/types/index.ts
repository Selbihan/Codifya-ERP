// Core Types for Codifya ERP System
// Generated at: 2025-08-07

// ===============================
// USER TYPES
// ===============================

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER'

export interface User {
  id: number
  email: string
  password: string
  name: string
  username?: string | null
  role: UserRole
  department?: string | null
  language?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  code?: string | null
  
  // Audit fields
  createdBy?: number | null
  updatedBy?: number | null
  deletedBy?: number | null
}

export interface UserInfo {
  id: number
  email: string
  name: string
  username?: string | null
  role: UserRole
  department?: string | null
  isActive: boolean
}

// ===============================
// CUSTOMER TYPES
// ===============================

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
  createdBy: number
}

// ===============================
// PRODUCT TYPES
// ===============================

export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string | null
  sku: string
  price: number
  cost: number
  stock: number
  minStock: number
  category?: Category | null
  categoryId?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: number
  createdByUser?: {
    id: number;
    name: string;
    email: string;
  }
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface StockMovement {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  reference?: string | null
  createdAt: Date
  createdBy: number
}

// ===============================
// ORDER TYPES
// ===============================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: OrderStatus
  totalAmount: number
  taxAmount: number
  discount: number
  notes?: string | null
  orderDate: Date
  createdAt: Date
  updatedAt: Date
  createdBy: number
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  total: number
}

// ===============================
// PAYMENT TYPES
// ===============================

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

// ===============================
// INVOICE TYPES
// ===============================

export type InvoiceType = 'SALES' | 'PURCHASE' | 'EXPENSE'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId?: string | null
  customerId?: string | null
  type: InvoiceType
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  dueDate: Date
  issueDate: Date
  paidDate?: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: number
}

// ===============================
// TRANSACTION TYPES
// ===============================

export type TransactionType = 'INCOME' | 'EXPENSE'
export type TransactionCategory = 'SALES' | 'PURCHASE' | 'SALARY' | 'RENT' | 'UTILITIES' | 'MARKETING' | 'OTHER'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  reference?: string | null
  date: Date
  invoiceId?: string | null
  orderId?: string | null
  paymentId?: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: number
}

// ===============================
// FINANCIAL TYPES
// ===============================

export interface FinancialAccount {
  id: number
  code: string
  description: string
  address: string
  country: string
  city: string
  district: string
  taxOffice: string
  taxNo?: string | null
  taxPayerType: boolean // true = Şahıs, false = Şirket
  idNo?: string | null
  area: string
  generalTel?: string | null
  generalEmail?: string | null
  generalName: string
  generalLastName?: string | null
  generalWebsite?: string | null
  type: string // RECEIVABLE | PAYABLE | NEUTRAL
  customerId?: number | null
  supplierId?: number | null
  currency?: string | null
  parentAccountId?: number | null
  openingBalance?: number | null
  currentBalance?: number | null
  creditLimit?: number | null
  paymentTerms?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  createdBy: number
  updatedBy?: number | null
  deletedBy?: number | null
}

export interface AccountTransaction {
  id: string
  accountId: number
  transactionDate: Date
  description: string
  debitAmount: number
  creditAmount: number
  balance: number
  currency: string
  referenceType?: string | null
  referenceId?: string | null
  documentNumber?: string | null
  voucherNumber?: string | null
  userId?: number | null
  createdAt: Date
  updatedAt: Date
}

// ===============================
// COMMON TYPES
// ===============================

export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
  error?: string
  meta?: any
  details?: any
}

export interface AuditFields {
  createdBy: number
  updatedBy?: number | null
  deletedBy?: number | null
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

// CRM tipleri ayrı dosyaya taşındı
export * from './crm'
