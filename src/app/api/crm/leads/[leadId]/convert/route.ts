import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// /api/crm/leads/[leadId]/convert/route.ts
export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const { type } = await req.json(); // type: CONTACT | ACCOUNT | ORDER | OPPORTUNITY

  // Lead'i bul
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ success: false, message: 'Lead bulunamadı.' }, { status: 404 });
  }

  // Örnek: Lead'i ilgili tipe dönüştür (sadece temel örnek, gerçek mantık ihtiyaca göre genişletilmeli)
  let created;
  if (type === 'CONTACT') {
    // Contact için zorunlu alanlar: firstName, lastName, email, ownerUserId
    const [firstName, ...rest] = lead.name.split(' ');
    const lastName = rest.join(' ') || '-';
    created = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email: lead.email || '',
        phone: lead.phone || undefined,
        ownerUserId: lead.ownerUserId,
        convertedFromLead: { connect: { id: lead.id } },
      },
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'QUALIFIED', convertedContactId: created.id, convertedAt: new Date() } });
  } else if (type === 'ACCOUNT') {
    created = await prisma.account.create({
      data: {
        name: lead.name,
        ownerUserId: lead.ownerUserId,
      },
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'QUALIFIED', convertedAt: new Date() } });
  } else if (type === 'ORDER') {
    // Sipariş için örnek kod, müşteri ile ilişkilendirme gerektirir
    // created = await prisma.order.create({
    //   data: {
    //     orderNumber: 'AUTO-' + Date.now(),
    //     customerId: '...',
    //     status: 'PENDING',
    //     totalAmount: 0,
    //     createdBy: lead.ownerUserId,
    //   },
    // });
    return NextResponse.json({ success: false, message: 'Order dönüştürme örnek olarak kapalı.' }, { status: 400 });
  } else if (type === 'OPPORTUNITY') {
    // created = await prisma.opportunity.create({
    //   data: {
    //     name: lead.name,
    //     ownerUserId: lead.ownerUserId,
    //   },
    // });
    return NextResponse.json({ success: false, message: 'Opportunity dönüştürme örnek olarak kapalı.' }, { status: 400 });
  } else {
    return NextResponse.json({ success: false, message: 'Geçersiz tip.' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: created });
}
