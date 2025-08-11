import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { CreateCustomerRequest } from '@/modules/crm/types'
import { ServiceProvider } from '@/utils/serviceProvider'

// GET - Müşteri listesi
async function handleGet(request: AuthenticatedRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const company = searchParams.get('company') || undefined
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined

    const customerService = ServiceProvider.getCustomerService()
    const result = await customerService.list({
      page,
      limit,
      search,
      company,
      isActive
    })

    return successResponse(result, 'Müşteriler başarıyla getirildi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// POST - Yeni müşteri oluşturma
async function handlePost(request: AuthenticatedRequest) {
  try {
    const body: CreateCustomerRequest = await request.json()
    
    // Validation
    if (!body.name) {
      return errorResponse('Müşteri adı zorunludur')
    }

    const createdBy = request.user?.userId
    if (!createdBy) {
      return errorResponse('Kullanıcı doğrulanamadı', 401)
    }
    
    const customerService = ServiceProvider.getCustomerService()
    const customer = await customerService.create(body, createdBy)
    return successResponse(customer, 'Müşteri başarıyla oluşturuldu')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)
export const POST = requireManager(handlePost) 