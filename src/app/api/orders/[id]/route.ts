import { NextRequest } from 'next/server'
import { OrderService } from '@/modules/orders/services/orderService'
import { OrdersRepository } from '@/repositories/implementations/orderRepository'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { UpdateOrderRequest, OrderStatus } from '@/modules/orders/types'

const orderService = new OrderService(new OrdersRepository())

// GET - Sipariş detayı
async function handleGet(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return errorResponse('Sipariş ID gerekli')
    }
    
    const order = await orderService.getOrderById(id)
    return successResponse(order, 'Sipariş detayı getirildi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// PUT - Sipariş güncelleme
async function handlePut(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return errorResponse('Sipariş ID gerekli')
    }
    
    const body: UpdateOrderRequest = await request.json()
    
    // Validation
    if (body.discount && body.discount < 0) {
      return errorResponse('İndirim negatif olamaz')
    }

    const order = await orderService.updateOrder(id, body)
    return successResponse(order, 'Sipariş başarıyla güncellendi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// DELETE - Sipariş silme
async function handleDelete(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    if (!id) {
      return errorResponse('Sipariş ID gerekli')
    }
    
    const result = await orderService.deleteOrder(id)
    return successResponse(result, 'Sipariş başarıyla silindi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)
export const PUT = requireManager(handlePut)
export const DELETE = requireManager(handleDelete) 