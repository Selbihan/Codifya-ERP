// Accounting Types - Merkezi export dosyası
export * from './invoice'
export * from './transaction'
export * from './payment'

// Ek accounting tipleri
export interface AccountingStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingInvoices: number
  overdueInvoices: number
  totalPayments: number
  pendingPayments: number
  monthlyRevenue: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  topCustomers: Array<{
    customer: any
    totalInvoiced: number
    totalPaid: number
    outstanding: number
  }>
  paymentMethods: Array<{
    method: string
    count: number
    total: number
  }>
}

export interface InvoiceStats {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  overdueAmount: number
}

export interface TransactionStats {
  totalTransactions: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
  incomeByCategory: Record<string, number>
  expenseByCategory: Record<string, number>
  monthlyTransactions: Array<{
    month: string
    income: number
    expenses: number
    profit: number
  }>
}

export interface PaymentStats {
  totalPayments: number
  completedPayments: number
  pendingPayments: number
  failedPayments: number
  totalAmount: number
  completedAmount: number
  pendingAmount: number
  paymentMethods: Array<{
    method: string
    count: number
    total: number
  }>
} 