// POST: Yeni fatura oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, invoiceNumber, date, amount, description } = body;
    if (!customerId || !invoiceNumber || !date || !amount) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 });
    }
    const issueDate = new Date(date);
    const invoice = await prisma.invoice.create({
      data: {
        customerId,
        invoiceNumber,
        issueDate,
        dueDate: issueDate, // Formda dueDate yok, issueDate ile aynı atanıyor
        subtotal: Number(amount),
        taxAmount: 0,
        discount: 0,
        totalAmount: Number(amount),
        notes: description || null,
        status: 'DRAFT',
        type: 'SALES',
        createdBy: 1, // TODO: Auth ile gerçek kullanıcıyı al
      },
    });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return NextResponse.json({ error: 'Fatura kaydedilemedi.', detail: String(error) }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: {
        issueDate: 'desc'
      },
      take: 50
    });
    
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Faturalar alınamadı.' }, { status: 500 });
  }
}
