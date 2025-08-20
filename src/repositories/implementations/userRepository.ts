import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '../base/baseRepository'
import { 
  IUserRepository, 
  CreateUserDTO, 
  UpdateUserDTO, 
  UserFilters,
  UserRole 
} from '../interfaces/userRepository'
import { User } from '@/types'

export class UserRepository extends BaseRepository<User, CreateUserDTO, UpdateUserDTO, UserFilters> 
  implements IUserRepository {
  
  constructor(prisma: PrismaClient) {
    super(prisma, 'user')
  }

  protected getIncludeRelations() {
    return {
      orders: true,
      customers: true,
      products: true,
      stockMovements: true,
      invoices: true,
      transactions: true
    }
  }

  protected buildWhereClause(filters?: UserFilters) {
    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters?.role) {
      where.role = filters.role
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.email) {
      where.email = filters.email
    }

    return where
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: this.getIncludeRelations()
      })
      return user
    } catch (error) {
      throw new Error(`Error finding user by email: ${error}`)
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { role },
        include: this.getIncludeRelations()
      })
      return users
    } catch (error) {
      throw new Error(`Error finding users by role: ${error}`)
    }
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
        include: this.getIncludeRelations()
      })
      return user
    } catch (error) {
      throw new Error(`Error updating user password: ${error}`)
    }
  }

  async deactivateUser(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        include: this.getIncludeRelations()
      })
      return user
    } catch (error) {
      throw new Error(`Error deactivating user: ${error}`)
    }
  }

  async activateUser(id: number): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
        include: this.getIncludeRelations()
      })
      return user
    } catch (error) {
      throw new Error(`Error activating user: ${error}`)
    }
  }
} 