import { ProductService } from '@/modules/product/services/productService'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager } from '@/lib/auth'

const productService = ProductService.create()

async function handleGet() {
  try {
    const products = await productService.getLowStockProducts()
    return successResponse(products)
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet)


