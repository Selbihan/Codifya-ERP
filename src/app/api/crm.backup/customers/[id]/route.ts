import { NextRequest } from 'next/server'
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { UpdateCustomerRequest } from '@/modules/crm/types'
import { ServiceProvider } from '@/utils/serviceProvider'

// GET - Müşteri detayı
async function handleGet(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return notFoundResponse()
    }

    const customerService = ServiceProvider.getCustomerService()
    const customer = await customerService.get(id)
    return successResponse(customer, 'Müşteri detayı getirildi')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Müşteri bulunamadı') {
        return notFoundResponse()
      }
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// PUT - Müşteri güncelleme
async function handlePut(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return notFoundResponse()
    }

    const body: UpdateCustomerRequest = await request.json()
    
    // Validation
    if (!body.name && !body.email && !body.phone && !body.address && 
        !body.company && !body.taxNumber && body.isActive === undefined) {
      return errorResponse('En az bir alan güncellenmelidir')
    }

    const customerService = ServiceProvider.getCustomerService()
    const customer = await customerService.update(id, body)
    return successResponse(customer, 'Müşteri başarıyla güncellendi')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Müşteri bulunamadı') {
        return notFoundResponse()
      }
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// DELETE - Müşteri silme
async function handleDelete(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return notFoundResponse()
    }

    const customerService = ServiceProvider.getCustomerService()
    await customerService.remove(id)
    return successResponse({}, 'Müşteri başarıyla silindi')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Müşteri bulunamadı') {
        return notFoundResponse()
      }
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)
export const PUT = requireManager(handlePut)
export const DELETE = requireManager(handleDelete) 