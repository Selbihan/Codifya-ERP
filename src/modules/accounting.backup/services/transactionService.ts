import { prisma } from '@/lib/prisma'
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionListResponse,
  TransactionType,
  TransactionCategory,
  FinancialSummary
} from '../types/transaction'
import { TransactionStats } from '../types'
import { logger } from '@/utils/logger'

export class TransactionService {
  // Gelir-gider kaydı oluşturma
  async createTransaction(data: CreateTransactionRequest, createdBy: string) {
    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        reference: data.reference,
        date: data.date || new Date(),
        invoiceId: data.invoiceId,
        orderId: data.orderId,
        paymentId: data.paymentId,
        createdBy
      },
      include: {
        invoice: true,
        order: true,
        payment: true,
        createdByUser: true
      }
    })

    logger.info('İşlem kaydı oluşturuldu', { 
      transactionId: transaction.id, 
      type: transaction.type, 
      amount: transaction.amount,
      createdBy 
    })
    return transaction
  }

  // Gelir-gider kaydı güncelleme
  async updateTransaction(id: string, data: UpdateTransactionRequest) {
    const transaction = await prisma.transaction.findUnique({ where: { id } })
    if (!transaction) throw new Error('Kayıt bulunamadı')
    
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        reference: data.reference,
        date: data.date
      },
      include: {
        invoice: true,
        order: true,
        payment: true,
        createdByUser: true
      }
    })

    logger.info('İşlem kaydı güncellendi', { transactionId: id })
    return updated
  }

  // Gelir-gider kaydı silme
  async deleteTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } })
    if (!transaction) throw new Error('Kayıt bulunamadı')
    
    await prisma.transaction.delete({ where: { id } })
    logger.info('İşlem kaydı silindi', { transactionId: id })
    return { message: 'Kayıt silindi' }
  }

  // Gelir-gider kaydı listeleme/filtreleme
  async getTransactions(filters: TransactionFilters): Promise<TransactionListResponse> {
    const {
      type,
      category,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10
    } = filters
    
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (type) where.type = type
    if (category) where.category = category
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = new Date(dateFrom)
      if (dateTo) where.date.lte = new Date(dateTo)
    }
    if (minAmount !== undefined) where.amount = { ...where.amount, gte: minAmount }
    if (maxAmount !== undefined) where.amount = { ...where.amount, lte: maxAmount }
    
    const total = await prisma.transaction.count({ where })
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        invoice: true,
        order: true,
        payment: true,
        createdByUser: true
      },
      skip,
      take: limit,
      orderBy: { date: 'desc' }
    })
    
    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Gelir-gider kaydı detayı
  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        invoice: true,
        order: true,
        payment: true,
        createdByUser: true
      }
    })
    
    if (!transaction) throw new Error('Kayıt bulunamadı')
    return transaction
  }

  // Finansal özet
  async getFinancialSummary(): Promise<FinancialSummary> {
    // Toplam gelir
    const totalIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true }
    })
    
    // Toplam gider
    const totalExpense = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true }
    })
    
    // Kategori bazında gelir
    const incomeByCategoryArr = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'INCOME' },
      _sum: { amount: true }
    })
    
    // Kategori bazında gider
    const expenseByCategoryArr = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'EXPENSE' },
      _sum: { amount: true }
    })
    
    // Aylık gelir/gider/kar
    const monthlyArr = await prisma.$queryRawUnsafe<any[]>(
      `SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as profit
      FROM transactions
      GROUP BY month
      ORDER BY month DESC`
    )
    
    // Sonuçları uygun formata getir
    const incomeByCategory: Record<TransactionCategory, number> = {
      SALES: 0, PURCHASE: 0, SALARY: 0, RENT: 0, UTILITIES: 0, MARKETING: 0, OTHER: 0
    }
    for (const item of incomeByCategoryArr) {
      incomeByCategory[item.category] = Number(item._sum.amount) || 0
    }
    
    const expenseByCategory: Record<TransactionCategory, number> = {
      SALES: 0, PURCHASE: 0, SALARY: 0, RENT: 0, UTILITIES: 0, MARKETING: 0, OTHER: 0
    }
    for (const item of expenseByCategoryArr) {
      expenseByCategory[item.category] = Number(item._sum.amount) || 0
    }
    
    return {
      totalIncome: Number(totalIncome._sum.amount) || 0,
      totalExpense: Number(totalExpense._sum.amount) || 0,
      netProfit: (Number(totalIncome._sum.amount) || 0) - (Number(totalExpense._sum.amount) || 0),
      incomeByCategory,
      expenseByCategory,
      monthlyData: monthlyArr.map(m => ({
        month: m.month,
        income: Number(m.income),
        expense: Number(m.expense),
        profit: Number(m.profit)
      }))
    }
  }

  // İşlem istatistikleri
  async getTransactionStats(): Promise<TransactionStats> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Temel istatistikler
    const totalTransactions = await prisma.transaction.count()
    const totalIncome = await prisma.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true }
    })
    const totalExpenses = await prisma.transaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true }
    })

    // Kategori bazında gelir
    const incomeByCategoryArr = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'INCOME' },
      _sum: { amount: true }
    })

    // Kategori bazında gider
    const expenseByCategoryArr = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'EXPENSE' },
      _sum: { amount: true }
    })

    // Aylık işlemler
    const monthlyTransactions = await prisma.$queryRawUnsafe<any[]>(
      `SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as profit
      FROM transactions
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12`
    )

    // Kategori bazında sonuçları formatla
    const incomeByCategory: Record<string, number> = {}
    for (const item of incomeByCategoryArr) {
      incomeByCategory[item.category] = Number(item._sum.amount) || 0
    }

    const expenseByCategory: Record<string, number> = {}
    for (const item of expenseByCategoryArr) {
      expenseByCategory[item.category] = Number(item._sum.amount) || 0
    }

    return {
      totalTransactions,
      totalIncome: Number(totalIncome._sum.amount) || 0,
      totalExpenses: Number(totalExpenses._sum.amount) || 0,
      netProfit: (Number(totalIncome._sum.amount) || 0) - (Number(totalExpenses._sum.amount) || 0),
      incomeByCategory,
      expenseByCategory,
      monthlyTransactions: monthlyTransactions.map(m => ({
        month: m.month,
        income: Number(m.income),
        expenses: Number(m.expenses),
        profit: Number(m.profit)
      }))
    }
  }
} 