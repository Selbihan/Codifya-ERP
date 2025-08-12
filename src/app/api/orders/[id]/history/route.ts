import { NextRequest } from 'next/server'
import { OrderService } from '@/modules/orders/services/orderService'
import { OrdersRepository } from '@/repositories/implementations/orderRepository'
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'

const orderService = new OrderService(new OrdersRepository())

// GET - Sipariş geçmişi
async function handleGet(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').slice(-2)[0] // /orders/[id]/history
    if (!id) {
      return notFoundResponse()
    }

    const history = await orderService.getOrderHistory(id)
    return successResponse(history, 'Sipariş geçmişi getirildi')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Sipariş bulunamadı') {
        return notFoundResponse()
      }
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet) 