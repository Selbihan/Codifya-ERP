import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Faturalardan gelir hareketleri
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        totalAmount: true,
        issueDate: true,
        status: true,
        customer: { select: { name: true } }
      }
    });
    const invoiceMovements = invoices.map((inv: any) => ({
      id: 'inv-' + inv.id,
      type: 'Gelir',
      amount: inv.totalAmount,
      date: inv.issueDate,
      description: `Fatura (${inv.status}) - ${inv.customer?.name || ''}`
    }));

    // Ödemelerden gelir/gider hareketleri
    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        paymentDate: true,
        method: true,
        status: true,
        order: { select: { orderNumber: true } }
      }
    });
    const paymentMovements = payments.map((pay: any) => ({
      id: 'pay-' + pay.id,
      type: pay.amount >= 0 ? 'Gelir' : 'Gider',
      amount: Math.abs(pay.amount),
      date: pay.paymentDate,
      description: `Ödeme (${pay.status}) - Sipariş: ${pay.order?.orderNumber || ''}`
    }));

    // Birleştir
    const finance = [...invoiceMovements, ...paymentMovements];
    return NextResponse.json({ finance });
  } catch (error) {
    return NextResponse.json({ error: 'Finansal hareketler türetilemedi.' }, { status: 500 });
  }
}