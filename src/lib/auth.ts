import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/utils/auth'
import { unauthorizedResponse, forbiddenResponse } from '@/utils/api'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export const authenticateRequest = async (request: NextRequest): Promise<AuthenticatedRequest> => {
  const authHeader = request.headers.get('authorization')
  // Önce Authorization header'dan dene, yoksa cookie'ye fallback
  let token = extractTokenFromHeader(authHeader || undefined)
  if (!token) {
    token = request.cookies.get('token')?.value || request.cookies.get('auth-token')?.value || null
  }

  if (!token) {
    throw new Error('No token provided')
  }

  const payloadRaw = verifyToken(token)
  if (!payloadRaw) {
    throw new Error('Invalid token')
  }

  // login/register farkından dolayı id alanını userId'a map et
  const payload: JWTPayload = {
    ...payloadRaw,
    userId: (payloadRaw as any).userId || (payloadRaw as any).id,
  }

  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = payload
  return authenticatedRequest
}

export const requireAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    try {
      const authenticatedRequest = await authenticateRequest(request)
      return handler(authenticatedRequest)
    } catch {
      return unauthorizedResponse()
    }
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      try {
        const authenticatedRequest = await authenticateRequest(request)
        
        if (!authenticatedRequest.user) {
          return unauthorizedResponse()
        }
        
        if (!allowedRoles.includes(authenticatedRequest.user.role)) {
          return forbiddenResponse()
        }
        
        return handler(authenticatedRequest)
      } catch {
        return unauthorizedResponse()
      }
    }
  }
}

export const requireAdmin = requireRole(['ADMIN'])
export const requireManager = requireRole(['ADMIN', 'MANAGER']) 