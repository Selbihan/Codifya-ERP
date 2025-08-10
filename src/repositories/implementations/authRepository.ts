import { PrismaClient } from '@prisma/client'
import { RegisterRequest } from '@/types/auth'
import { nanoid } from 'nanoid'

export interface IAuthRepository {
  findByEmail(email: string): Promise<any | null>
  findByUsername(username: string): Promise<any | null>
  createUser(data: RegisterRequest & { password: string }): Promise<any>
}

export class AuthRepository implements IAuthRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }


  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } })
    } catch (error) {
      throw new Error('E-posta ile kullanıcı aranırken hata oluştu.')
    }
  }


  async findByUsername(username: string) {
    try {
      return await this.prisma.user.findUnique({ where: { username } })
    } catch (error) {
      throw new Error('Kullanıcı adı ile kullanıcı aranırken hata oluştu.')
    }
  }

  async createUser(data: RegisterRequest & { password: string }) {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          username: data.username,
          role: data.role || 'USER',
          code: nanoid(8) // 8 karakterlik benzersiz bir kod
        }
      })
    } catch (error) {
      throw new Error('Kullanıcı oluşturulurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.')
    }
  }
}
