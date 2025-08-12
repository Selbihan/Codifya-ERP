import { NextRequest } from 'next/server'
import { OrderService } from '@/modules/orders/services/orderService'
import { OrdersRepository } from '@/repositories/implementations/orderRepository'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { OrderStatus } from '@/modules/orders/types'

const orderService = new OrderService(new OrdersRepository())

// PATCH - Sipariş durumu güncelleme
async function handlePatch(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').slice(-2)[0] // orders/[id]/status
    if (!id) {
      return errorResponse('Sipariş ID gerekli')
    }
    
    const body = await request.json()
    const { status } = body
    
    if (!status || !['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return errorResponse('Geçerli bir durum gerekli')
    }

    const order = await orderService.updateOrderStatus(id, status as OrderStatus)
    return successResponse(order, 'Sipariş durumu başarıyla güncellendi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const PATCH = requireManager(handlePatch) 