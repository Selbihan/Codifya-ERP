import { AuthService } from '@/modules/auth/services/authService'

export async function loginController({ identifier, password }: { identifier: string; password: string }) {
  const authService = new AuthService()
  // Giriş işlemini gerçekleştir
  const user = await authService.login({ identifier, password })
  return user
}
