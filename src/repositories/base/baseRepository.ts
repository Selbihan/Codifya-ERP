import { PrismaClient } from '@prisma/client'
import { IBaseRepository } from '../interfaces/baseRepository'

export abstract class BaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>, Filters = any> 
  implements IBaseRepository<T, CreateDTO, UpdateDTO, Filters> {
  
  protected prisma: PrismaClient
  protected modelName: string

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma
    this.modelName = modelName
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({
        data,
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error creating ${this.modelName}: ${error}`)
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error finding ${this.modelName} by id: ${error}`)
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error updating ${this.modelName}: ${error}`)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await (this.prisma as any)[this.modelName].delete({
        where: { id }
      })
    } catch (error) {
      throw new Error(`Error deleting ${this.modelName}: ${error}`)
    }
  }

  async findMany(filters?: Filters): Promise<T[]> {
    try {
      const where = this.buildWhereClause(filters)
      const result = await (this.prisma as any)[this.modelName].findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' }
      })
      return result
    } catch (error) {
      throw new Error(`Error finding ${this.modelName} list: ${error}`)
    }
  }

  async findOne(filters: Filters): Promise<T | null> {
    try {
      const where = this.buildWhereClause(filters)
      const result = await (this.prisma as any)[this.modelName].findFirst({
        where,
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error finding ${this.modelName}: ${error}`)
    }
  }

  async findManyPaginated(
    filters?: Filters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const where = this.buildWhereClause(filters)
      const skip = (page - 1) * limit

      const [data, total] = await Promise.all([
        (this.prisma as any)[this.modelName].findMany({
          where,
          include: this.getIncludeRelations(),
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        (this.prisma as any)[this.modelName].count({ where })
      ])

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      throw new Error(`Error finding ${this.modelName} paginated: ${error}`)
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({
        where: { id }
      })
      return count > 0
    } catch (error) {
      throw new Error(`Error checking ${this.modelName} existence: ${error}`)
    }
  }

  async count(filters?: Filters): Promise<number> {
    try {
      const where = this.buildWhereClause(filters)
      return await (this.prisma as any)[this.modelName].count({ where })
    } catch (error) {
      throw new Error(`Error counting ${this.modelName}: ${error}`)
    }
  }

  async softDelete(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: { isActive: false },
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error soft deleting ${this.modelName}: ${error}`)
    }
  }

  async restore(id: string): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: { isActive: true },
        include: this.getIncludeRelations()
      })
      return result
    } catch (error) {
      throw new Error(`Error restoring ${this.modelName}: ${error}`)
    }
  }

  // Abstract methods that should be implemented by child classes
  protected abstract getIncludeRelations(): any
  protected abstract buildWhereClause(filters?: Filters): any
} 