import { NextRequest } from 'next/server'
import { successResponse, errorResponse, notFoundResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { ServiceProvider } from '@/utils/serviceProvider'

// GET - Müşteri geçmişi
async function handleGet(request: AuthenticatedRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').slice(-2)[0] // /customers/[id]/history
    if (!id) {
      return notFoundResponse()
    }

    const customerService = ServiceProvider.getCustomerService()
    const history = await customerService.history(id)
    return successResponse(history, 'Müşteri geçmişi getirildi')
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