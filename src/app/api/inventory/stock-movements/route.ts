import { NextRequest } from 'next/server'
import { StockService } from '@/modules/inventory/services/stockService'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { CreateStockMovementRequest } from '@/modules/inventory/types'

const stockService = new StockService()

// GET - Stok hareketleri listesi
async function handleGet(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const productId = searchParams.get('productId') || undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    const result = await stockService.getStockMovements(productId, page, limit)
    return successResponse(result)
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

// POST - Yeni stok hareketi
async function handlePost(request: AuthenticatedRequest) {
  try {
    const body: CreateStockMovementRequest = await request.json()
    
    // Validation
    if (!body.productId || !body.type || body.quantity === undefined || !body.reason) {
      return errorResponse('ProductId, type, quantity ve reason alanları zorunludur')
    }

    if (body.quantity <= 0) {
      return errorResponse('Miktar pozitif olmalıdır')
    }

    // JWT'den userId al
    const createdBy = request.user?.userId
    if (!createdBy) {
      return errorResponse('Kullanıcı doğrulanamadı', 401)
    }
    
    const movement = await stockService.addStockMovement(body, parseInt(createdBy.toString()))
    return successResponse(movement, 'Stok hareketi başarıyla kaydedildi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)
export const POST = requireManager(handlePost) 