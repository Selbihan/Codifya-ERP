import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: {
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      },
      take: 50 // Son 50 ödemeyi getir
    })

    // API formatına uygun hale getir
    const formattedPayments = payments.map((payment: any) => ({
      id: payment.id,
      referenceNumber: payment.reference || payment.id,
      description: `${payment.order.customer.name} - Sipariş #${payment.orderId.slice(-8)}`,
      amount: payment.amount,
      type: 'INCOMING', // Şimdilik tümünü gelen olarak işaretle
      status: payment.status,
      paymentDate: payment.paymentDate,
      method: payment.method
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json({ error: 'Ödemeler alınamadı' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: parseFloat(data.amount),
        method: data.method || 'BANK_TRANSFER',
        status: data.status || 'PENDING',
        reference: data.reference,
        paymentDate: new Date(data.paymentDate)
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Ödeme oluşturulamadı' }, { status: 500 })
  }
}
