// Sadece register işlemi için sade AuthService
import { prisma } from '@/lib/prisma'
import { AuthRepository, IAuthRepository } from '@/repositories/implementations/authRepository'
import { RegisterRequest, AuthResponse, UserInfo, UserRole } from '@/types/auth'
import bcrypt from 'bcryptjs'

export class AuthService {
  private authRepository: IAuthRepository

  constructor(authRepository?: IAuthRepository) {
    this.authRepository = authRepository || new AuthRepository(prisma)
  }

  // Sadece kullanıcı kaydı
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, firstName, lastName, username, role } = userData

      // Email kontrolü
      const existingEmail = await this.authRepository.findByEmail(email)
      if (existingEmail) {
        throw new Error('Bu email zaten kayıtlı')
      }

      // Username kontrolü
      const existingUsername = await this.authRepository.findByUsername(username)
      if (existingUsername) {
        throw new Error('Bu kullanıcı adı zaten kayıtlı')
      }

      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10)

      // Kullanıcıyı oluştur
      const user = await this.authRepository.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        role: role || UserRole.USER
      })

      // Kullanıcı bilgilerini temizle
      const userInfo: UserInfo = {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        username: (user as any).username || undefined,
        code: (user as any).code || undefined,
        role: user.role as UserRole,
        department: (user as any).department || undefined,
        language: (user as any).language || undefined
      }

      return {
        message: 'Kayıt başarılı',
        token: '', // Token üretimi yok, sadece kayıt mesajı
        user: userInfo
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error('Kayıt işlemi başarısız')
    }
  }
}
