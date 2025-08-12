import { NextRequest } from 'next/server'
import { OrderService } from '@/modules/orders/services/orderService'
import { OrdersRepository } from '@/repositories/implementations/orderRepository'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { CreateOrderRequest, OrderFilters, OrderStatus } from '@/modules/orders/types'

const orderService = new OrderService(new OrdersRepository())

// GET - Sipariş listesi
async function handleGet(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: OrderFilters = {
      search: searchParams.get('search') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      status: (searchParams.get('status') as OrderStatus) || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    }

    const result = await orderService.getOrders(filters)
    return successResponse(result, 'Siparişler listelendi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// POST - Yeni sipariş oluşturma
async function handlePost(request: AuthenticatedRequest) {
  try {
    const body: CreateOrderRequest = await request.json()
    
    // Validation
    if (!body.customerId || !body.items || body.items.length === 0) {
      return errorResponse('Müşteri ID ve en az bir ürün zorunludur')
    }

    if (body.discount && body.discount < 0) {
      return errorResponse('İndirim negatif olamaz')
    }

    // JWT'den userId al
  const createdByRaw = request.user?.userId
  const createdBy = createdByRaw ? Number(createdByRaw) : undefined
  if (createdBy === undefined || Number.isNaN(createdBy)) {
      return errorResponse('Kullanıcı doğrulanamadı', 401)
    }
    
  const order = await orderService.createOrderFromRequest(body, createdBy)
    return successResponse(order, 'Sipariş başarıyla oluşturuldu')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)
export const POST = requireManager(handlePost) 