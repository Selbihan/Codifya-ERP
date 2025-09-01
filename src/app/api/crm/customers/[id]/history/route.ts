import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/modules/crm/services/customerService'

// GET /api/crm/customers/[id]/history - Müşteri geçmişi
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerService = CustomerService.create()
    const history = await customerService.history(id)
    
    return NextResponse.json({
      success: true,
      message: 'Müşteri geçmişi getirildi',
      data: history
    })
  } catch (error) {
    console.error('Customer history error:', error)
    
    if (error instanceof Error && error.message === 'Müşteri bulunamadı') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
} 