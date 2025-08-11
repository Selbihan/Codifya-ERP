import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/utils/api'
import { requireManager, AuthenticatedRequest } from '@/lib/auth'
import { ServiceProvider } from '@/utils/serviceProvider'

// GET - CRM Dashboard istatistikleri
async function handleGet(request: AuthenticatedRequest) {
  try {
    const customerService = ServiceProvider.getCustomerService()
    const stats = await customerService.stats()
    return successResponse(stats, 'CRM dashboard verileri getirildi')
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message)
    }
    return errorResponse('Internal server error', 500)
  }
}

export const GET = requireManager(handleGet) 