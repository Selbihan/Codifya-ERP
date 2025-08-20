import { NextRequest } from 'next/server'
import { CustomerService } from '@/modules/crm/services/customerService'
import { successResponse, errorResponse, conflictResponse } from '@/utils/api'
import { logger } from '@/utils/logger'
import { prisma } from '@/lib/prisma' // Tek kaynak burası

// GET /api/crm/customers - Müşteri listesi
export async function GET(request: NextRequest) {
  try {
    const service = CustomerService.create() // prisma'yı geçin
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const filters = {
      page,
      limit,
      search: searchParams.get('search') || undefined,
      company: searchParams.get('company') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined
    }
    const result = await service.list(filters)
    console.log('Customer list result:', result)
    return successResponse(result, 'Müşteri listesi getirildi', {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    })
  } catch (e: any) {
    logger.error('Customer list error', { error: e?.message })
    return errorResponse('Sunucu hatası', 500)
  }
}

// POST /api/crm/customers - Yeni müşteri oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.name) return errorResponse('İsim zorunludur', 400)
    const service = CustomerService.create() // prisma'yı geçin
    const userId = '1' // TODO: auth'dan al
    const customer = await service.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      company: body.company,
      taxNumber: body.taxNumber
    }, userId)
    return successResponse(customer, 'Müşteri başarıyla oluşturuldu')
  } catch (e: any) {
    if (e?.message?.includes('Email zaten kullanımda')) return conflictResponse(e.message)
    if (e?.message?.includes('Geçersiz') || e?.name === 'ValidationError') return errorResponse(e.message, 400)
    return errorResponse(e.message , 500)
  }
}