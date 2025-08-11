import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/modules/crm/services/customerService'

// GET - Müşteri listesi
export async function GET(request: NextRequest) {
  try {
    const customerService = CustomerService.create()
    
    // Query parametrelerini al
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    
    const result = await customerService.list({
      page,
      limit,
      search
    })
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri listesi getirildi',
      data: result
    })
  } catch (error) {
    console.error('Customer list error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sunucu hatası',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// POST - Müşteri oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const customerService = CustomerService.create()
    
    // Basit validasyon
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'İsim zorunludur' },
        { status: 400 }
      )
    }
    
    // Şimdilik demo userId
    const userId = '1'
    
    const customer = await customerService.create(body, userId)
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla oluşturuldu',
      data: customer
    }, { status: 201 })
  } catch (error) {
    console.error('Customer creation error:', error)
    
    if (error instanceof Error && error.message.includes('Email zaten kullanımda')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sunucu hatası',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
