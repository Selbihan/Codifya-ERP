import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Siparişe ait ödemeleri getir
export async function GET(request: NextRequest) {
  // /api/orders/[id]/payments gibi bir route'ta id'yi URL'den al
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  const orderId = paths[paths.indexOf('orders') + 1]
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { paymentDate: 'desc' },
    })
    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Ödemeler alınamadı', error }, { status: 500 })
  }
}

// POST: Yeni ödeme oluştur
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  const orderId = paths[paths.indexOf('orders') + 1]
  try {
    const body = await request.json()
    const { amount, method, reference } = body
    if (!amount || !method) {
      return NextResponse.json({ success: false, message: 'Tutar ve ödeme yöntemi zorunludur.' }, { status: 400 })
    }
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: Number(amount),
        method,
        reference: reference || null,
        status: 'COMPLETED',
        paymentDate: new Date(),
      },
    })
    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Ödeme API Hatası:', error)
    return NextResponse.json({ success: false, message: 'Ödeme kaydedilemedi', error: String(error) }, { status: 500 })
  }
}