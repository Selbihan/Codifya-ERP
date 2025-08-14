import { ProductService } from '@/modules/product/services/productService'
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'

const productService = ProductService.create()

async function handlePut(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').slice(-2, -1)[0]
    if (!id) {
      return errorResponse('Ürün ID gerekli')
    }
    const body = await request.json()
    const stock = Number(body?.stock)
    if (!Number.isFinite(stock) || stock < 0) {
      return errorResponse('Geçerli bir stok değeri giriniz')
    }
    const product = await productService.updateStock(id, stock)
    return successResponse(product, 'Stok güncellendi')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Ürün bulunamadı') {
        return notFoundResponse()
      }
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const PUT = requireManager(handlePut)


