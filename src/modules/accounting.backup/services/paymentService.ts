import { prisma } from '@/lib/prisma'
import { CreatePaymentRequest, UpdatePaymentRequest, PaymentFilters, PaymentListResponse, PaymentMethod, PaymentStatus } from '../types/payment'
import { PaymentStats } from '../types'
import { logger } from '@/utils/logger'

export class PaymentService {
  // Ödeme oluşturma
  async createPayment(data: CreatePaymentRequest) {
    // Sipariş kontrolü
    const order = await prisma.order.findUnique({ 
      where: { id: data.orderId },
      include: { payments: true }
    })
    if (!order) throw new Error('Sipariş bulunamadı')

    // Toplam ödeme kontrolü
    const totalPaid = order.payments.reduce((sum: number, payment: any) => {
      return payment.status === 'COMPLETED' ? sum + payment.amount : sum
    }, 0)
    
    const remainingAmount = order.totalAmount - totalPaid
    if (data.amount > remainingAmount) {
      throw new Error(`Ödeme tutarı kalan tutardan fazla olamaz. Kalan: ${remainingAmount}`)
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        method: data.method,
        status: 'PENDING',
        reference: data.reference,
        paymentDate: new Date()
      },
      include: {
        order: {
          include: {
            customer: true,
            items: true
          }
        }
      }
    })

    logger.info('Ödeme oluşturuldu', { 
      paymentId: payment.id, 
      orderId: payment.orderId, 
      amount: payment.amount,
      method: payment.method 
    })
    return payment
  }

  // Ödeme güncelleme
  async updatePayment(id: string, data: UpdatePaymentRequest) {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) throw new Error('Ödeme bulunamadı')

    // Eğer ödeme tamamlandıysa ve tutar değiştirilmeye çalışılıyorsa kontrol et
    if (payment.status === 'COMPLETED' && data.amount && data.amount !== payment.amount) {
      const order = await prisma.order.findUnique({ 
        where: { id: payment.orderId },
        include: { payments: true }
      })
      
      if (order) {
        const totalPaid = order.payments.reduce((sum: number, p: any) => {
          return p.status === 'COMPLETED' && p.id !== id ? sum + p.amount : sum
        }, 0)
        
        const remainingAmount = order.totalAmount - totalPaid
        if (data.amount > remainingAmount) {
          throw new Error(`Ödeme tutarı kalan tutardan fazla olamaz. Kalan: ${remainingAmount}`)
        }
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        amount: data.amount,
        method: data.method,
        status: data.status,
        reference: data.reference
      },
      include: {
        order: {
          include: {
            customer: true,
            items: true
          }
        }
      }
    })

    logger.info('Ödeme güncellendi', { paymentId: id })
    return updated
  }

  // Ödeme silme
  async deletePayment(id: string) {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) throw new Error('Ödeme bulunamadı')
    
    if (payment.status === 'COMPLETED') {
      throw new Error('Tamamlanmış ödeme silinemez')
    }

    await prisma.payment.delete({ where: { id } })
    logger.info('Ödeme silindi', { paymentId: id })
    return { message: 'Ödeme silindi' }
  }

  // Ödeme listeleme/filtreleme
  async getPayments(filters: PaymentFilters): Promise<PaymentListResponse> {
    const {
      orderId,
      status,
      method,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10
    } = filters
    
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (orderId) where.orderId = orderId
    if (status) where.status = status
    if (method) where.method = method
    if (dateFrom || dateTo) {
      where.paymentDate = {}
      if (dateFrom) where.paymentDate.gte = new Date(dateFrom)
      if (dateTo) where.paymentDate.lte = new Date(dateTo)
    }

    const total = await prisma.payment.count({ where })
    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
            items: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Ödeme detayı
  async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: true
          }
        }
      }
    })
    if (!payment) throw new Error('Ödeme bulunamadı')
    return payment
  }

  // Siparişe ait ödemeleri getir
  async getPaymentsByOrder(orderId: string) {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    })
    return payments
  }

  // Ödeme durumunu güncelle
  async updatePaymentStatus(id: string, status: PaymentStatus) {
    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) throw new Error('Ödeme bulunamadı')

    const updated = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        order: {
          include: {
            customer: true,
            items: true
          }
        }
      }
    })

    logger.info('Ödeme durumu güncellendi', { paymentId: id, status })
    return updated
  }

  // Sipariş ödeme özeti
  async getOrderPaymentSummary(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    })
    
    if (!order) throw new Error('Sipariş bulunamadı')

    const totalPaid = order.payments.reduce((sum: number, payment: any) => {
      return payment.status === 'COMPLETED' ? sum + payment.amount : sum
    }, 0)

    const pendingPayments = order.payments.filter((p: any) => p.status === 'PENDING')
    const completedPayments = order.payments.filter((p: any) => p.status === 'COMPLETED')

    return {
      orderTotal: order.totalAmount,
      totalPaid,
      remainingAmount: order.totalAmount - totalPaid,
      pendingPayments,
      completedPayments,
      isFullyPaid: totalPaid >= order.totalAmount
    }
  }

  // Ödeme istatistikleri
  async getPaymentStats(): Promise<PaymentStats> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Temel istatistikler
    const totalPayments = await prisma.payment.count()
    const completedPayments = await prisma.payment.count({ where: { status: 'COMPLETED' } })
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } })
    const failedPayments = await prisma.payment.count({ where: { status: 'FAILED' } })

    // Tutar istatistikleri
    const totalAmount = await prisma.payment.aggregate({
      _sum: { amount: true }
    })

    const completedAmount = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })

    const pendingAmount = await prisma.payment.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    })

    // Ödeme yöntemi istatistikleri
    const paymentMethods = await prisma.payment.groupBy({
      by: ['method'],
      _count: { method: true },
      _sum: { amount: true }
    })

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount: totalAmount._sum.amount || 0,
      completedAmount: completedAmount._sum.amount || 0,
      pendingAmount: pendingAmount._sum.amount || 0,
      paymentMethods: paymentMethods.map((pm: any) => ({
        method: pm.method,
        count: pm._count.method,
        total: Number(pm._sum.amount) || 0
      }))
    }
  }
} 