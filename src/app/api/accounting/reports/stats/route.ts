import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fatura istatistikleri
    const totalInvoices = await prisma.invoice.count()
    const paidInvoices = await prisma.invoice.count({
      where: { status: 'PAID' }
    })
    const pendingInvoices = await prisma.invoice.count({
      where: { status: { in: ['DRAFT', 'SENT'] } }
    })
    
    // Toplam fatura tutarı
    const totalInvoiceAmount = await prisma.invoice.aggregate({
      _sum: { totalAmount: true }
    })
    
    // Ödenen fatura tutarı
    const paidInvoiceAmount = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'PAID' }
    })

    // Sipariş istatistikleri
    const totalOrders = await prisma.order.count()
    const completedOrders = await prisma.order.count({
      where: { status: 'DELIVERED' }
    })
    const pendingOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'PROCESSING'] } }
    })

    // Toplam sipariş tutarı
    const totalOrderAmount = await prisma.order.aggregate({
      _sum: { totalAmount: true }
    })

    // Müşteri sayısı
    const totalCustomers = await prisma.customer.count()

    // Ödeme istatistikleri
    const totalPayments = await prisma.payment.count()
    const totalPaymentAmount = await prisma.payment.aggregate({
      _sum: { amount: true }
    })

    const stats = {
      // Fatura verileri
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalInvoiceAmount: totalInvoiceAmount._sum.totalAmount || 0,
      paidInvoiceAmount: paidInvoiceAmount._sum.totalAmount || 0,
      
      // Sipariş verileri
      totalOrders,
      completedOrders,
      pendingOrders,
      totalOrderAmount: totalOrderAmount._sum.totalAmount || 0,
      
      // Müşteri verileri
      totalCustomers,
      
      // Ödeme verileri
      totalPayments,
      totalIncoming: totalPaymentAmount._sum.amount || 0,
      totalOutgoing: 0, // Şimdilik giden ödeme yok
      pendingPayments: 0, // Şimdilik bekleyen ödeme yok
      
      // Hesaplanan değerler
      totalRevenue: (paidInvoiceAmount._sum.totalAmount || 0),
      pendingRevenue: (totalInvoiceAmount._sum.totalAmount || 0) - (paidInvoiceAmount._sum.totalAmount || 0)
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Reports stats error:', error)
    return NextResponse.json(
      { success: false, error: 'İstatistikler alınamadı' },
      { status: 500 }
    )
  }
}
