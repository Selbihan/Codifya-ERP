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
  createdBy: string
  createdByUser?: any
}

export interface CreateTransactionRequest {
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  reference?: string
  date?: Date
  invoiceId?: string
  orderId?: string
  paymentId?: string
}

export interface UpdateTransactionRequest {
  type?: TransactionType
  category?: TransactionCategory
  amount?: number
  description?: string
  reference?: string
  date?: Date
}

export interface TransactionFilters {
  type?: TransactionType
  category?: TransactionCategory
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
}

export interface TransactionListResponse {
  transactions: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  netProfit: number
  incomeByCategory: Record<TransactionCategory, number>
  expenseByCategory: Record<TransactionCategory, number>
  monthlyData: {
    month: string
    income: number
    expense: number
    profit: number
  }[]
} 