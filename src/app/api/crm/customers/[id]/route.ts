import { NextRequest } from 'next/server'
import { CustomerService } from '@/modules/crm/services/customerService'
import { successResponse, errorResponse, notFoundResponse, conflictResponse } from '@/utils/api'
import { logger } from '@/utils/logger'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const service = CustomerService.create()
    const customer = await service.get(id)
    return successResponse(customer, 'Müşteri detayı getirildi')
  } catch (e: any) {
    if (e?.message === 'Müşteri bulunamadı') return notFoundResponse()
    logger.error('Customer get error', { id, error: e?.message })
    return errorResponse('Sunucu hatası', 500)
  }
}

// PUT /api/crm/customers/[id] - Müşteri güncelle
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json()
    const service = CustomerService.create()
    const hasUpdate = Object.keys(body).some(k => ['name','email','phone','address','company','taxNumber','isActive'].includes(k))
    if (!hasUpdate) return errorResponse('En az bir alan güncellenmelidir', 400)
    const updated = await service.update(id, body)
    return successResponse(updated, 'Müşteri başarıyla güncellendi')
  } catch (e: any) {
    if (e?.message === 'Müşteri bulunamadı') return notFoundResponse()
    if (e?.message?.includes('Email zaten kullanımda')) return conflictResponse(e.message)
    if (e?.name === 'ValidationError') return errorResponse(e.message, 400)
    logger.error('Customer update error', { error: e?.message })
    return errorResponse('Sunucu hatası', 500)
  }
}

// DELETE /api/crm/customers/[id] - Müşteri sil
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = CustomerService.create()
    await service.remove(id)
    return successResponse(true, 'Müşteri başarıyla silindi')
  } catch (e: any) {
    if (e?.message === 'Müşteri bulunamadı') return notFoundResponse()
    logger.error('Customer delete error', { error: e?.message })
    return errorResponse('Sunucu hatası', 500)
  }
}