import { NextRequest, NextResponse } from 'next/server'
import { LeadService } from '@/modules/crm/services/leadService'
import { prisma } from '@/lib/prisma'

// GET /api/crm/leads - Lead listesi
export async function GET(request: NextRequest) {
  try {
    const leadService = LeadService.create(prisma)
    
    // Basit listeleme (şimdilik sayfalama olmadan)
    const leads = await prisma.lead.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Lead listesi getirildi',
      data: { leads, total: leads.length, page: 1, limit: 20, totalPages: 1 }
    })
  } catch (error) {
    console.error('Lead list error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Sunucu hatası'
      },
      { status: 500 }
    )
  }
}

// POST /api/crm/leads - Yeni lead oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const leadService = LeadService.create(prisma)
    
    // Basit validasyon
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, message: 'İsim ve email zorunludur' },
        { status: 400 }
      )
    }
    
    // TODO: JWT'den userId al
    const userId = 1
    
    const lead = await leadService.createLead({
      name: body.name,
      email: body.email,
      phone: body.phone,
      source: body.source || 'WEBSITE'
    }, userId)
    
    return NextResponse.json({
      success: true,
      message: 'Lead başarıyla oluşturuldu',
      data: lead
    }, { status: 201 })
    
  } catch (error) {
    console.error('Lead creation error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Bu email ile bir lead zaten var')) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 409 }
        )
      }
      if (error.message.includes('Geçersiz')) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
