import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '../base/baseRepository'
import {
  IProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters
} from '../interfaces/productRepository'
import { Product, User, Category } from '@/types'

// Prisma'dan dönen veriyi User tipine uygun şekilde map'le
function mapUser(user: any): User {
  return {
    id: typeof user.id === 'number' ? user.id : parseInt(user.id),
    name: user.name,
    email: user.email,
    password: "",
    role: "USER",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Prisma'dan dönen veriyi Category tipine uygun şekilde map'le
function mapCategory(prismaCategory: any): Category {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    description: prismaCategory.description,
    parentId: prismaCategory.parentId,
    isActive: prismaCategory.isActive,
    createdAt: prismaCategory.createdAt,
    updatedAt: prismaCategory.updatedAt,
    //products: [],
  };
}

// Prisma'dan dönen veriyi Product tipine uygun şekilde map'le
function mapProduct(prismaProduct: any): Product {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    description: prismaProduct.description || undefined,
    sku: prismaProduct.sku,
    price: prismaProduct.price,
    cost: prismaProduct.cost,
    stock: prismaProduct.stock,
    minStock: prismaProduct.minStock,
    category: prismaProduct.category ? mapCategory(prismaProduct.category) : null,
    isActive: prismaProduct.isActive,
    createdAt: prismaProduct.createdAt,
    updatedAt: prismaProduct.updatedAt,
    createdBy: prismaProduct.createdBy,
    createdByUser: prismaProduct.createdByUser
      ? {
          id: typeof prismaProduct.createdByUser.id === 'number' ? prismaProduct.createdByUser.id : parseInt(prismaProduct.createdByUser.id),
          name: prismaProduct.createdByUser.name,
          email: prismaProduct.createdByUser.email
        }
      : undefined,
  };
}

export class ProductRepository extends BaseRepository<Product, CreateProductDTO, UpdateProductDTO, ProductFilters>
  implements IProductRepository {

  constructor(prisma: PrismaClient) {
    super(prisma, 'product')
  }

  // BaseRepository metodlarını override ederek mapping kullan
  async create(data: CreateProductDTO): Promise<Product> {
    try {
      const result = await this.prisma.product.create({
        data: { ...data, createdBy: Number(data.createdBy) },
        include: this.getIncludeRelations()
      })
      return mapProduct(result)
    } catch (error) {
      throw new Error(`Error creating product: ${error}`)
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const result = await this.prisma.product.findUnique({
        where: { id },
        include: this.getIncludeRelations()
      })
      return result ? mapProduct(result) : null
    } catch (error) {
      throw new Error(`Error finding product by id: ${error}`)
    }
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    try {
      const result = await this.prisma.product.update({
        where: { id },
        data,
        include: this.getIncludeRelations()
      })
      return mapProduct(result)
    } catch (error) {
      throw new Error(`Error updating product: ${error}`)
    }
  }

  async findMany(filters?: ProductFilters): Promise<Product[]> {
    try {
      const where = this.buildWhereClause(filters)
      const results = await this.prisma.product.findMany({
        where,
        include: this.getIncludeRelations(),
        orderBy: { createdAt: 'desc' }
      })
      return results.map(mapProduct)
    } catch (error) {
      throw new Error(`Error finding product list: ${error}`)
    }
  }

  async findOne(filters: ProductFilters): Promise<Product | null> {
    try {
      const where = this.buildWhereClause(filters)
      const result = await this.prisma.product.findFirst({
        where,
        include: this.getIncludeRelations()
      })
      return result ? mapProduct(result) : null
    } catch (error) {
      throw new Error(`Error finding product: ${error}`)
    }
  }

  async findManyPaginated(
    filters?: ProductFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    data: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    try {
      const where = this.buildWhereClause(filters)
      const skip = (page - 1) * limit

      const [rawData, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: this.getIncludeRelations(),
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.product.count({ where })
      ])

      const data = rawData.map(mapProduct)

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    } catch (error) {
      throw new Error(`Error finding product paginated: ${error}`)
    }
  }

  async softDelete(id: string): Promise<Product> {
    try {
      const result = await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
        include: this.getIncludeRelations()
      })
      return mapProduct(result)
    } catch (error) {
      throw new Error(`Error soft deleting product: ${error}`)
    }
  }

  async restore(id: string): Promise<Product> {
    try {
      const result = await this.prisma.product.update({
        where: { id },
        data: { isActive: true },
        include: this.getIncludeRelations()
      })
      return mapProduct(result)
    } catch (error) {
      throw new Error(`Error restoring product: ${error}`)
    }
  }

  protected getIncludeRelations() {
    return {
      category: true,
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }

  protected buildWhereClause(filters?: ProductFilters) {
    const where: any = {}
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { sku: { contains: filters.search } }
      ]
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }
    if (filters?.minPrice !== undefined) {
      where.price = { gte: filters.minPrice }
    }
    if (filters?.maxPrice !== undefined) {
      where.price = { ...where.price, lte: filters.maxPrice }
    }
    if (filters?.inStock !== undefined) {
      where.stock = filters.inStock ? { gt: 0 } : { lte: 0 }
    }
    if (filters?.lowStock !== undefined) {
      where.stock = { lte: 5 }
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    if (filters?.createdBy) {
      where.createdBy = filters.createdBy
    }
    return where
  }

  async findBySKU(sku: string): Promise<Product | null> {
    const result = await this.prisma.product.findUnique({ 
      where: { sku }, 
      include: this.getIncludeRelations() 
    })
    return result ? mapProduct(result) : null
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const results = await this.prisma.product.findMany({ 
      where: { categoryId }, 
      include: this.getIncludeRelations() 
    })
    return results.map(mapProduct)
  }

  async getLowStockProducts(): Promise<Product[]> {
    const results = await this.prisma.product.findMany({ 
      where: { stock: { lte: 5 } }, 
      include: this.getIncludeRelations() 
    })
    return results.map(mapProduct)
  }

  async updateStock(productId: string, newStock: number): Promise<Product> {
    const result = await this.prisma.product.update({ 
      where: { id: productId }, 
      data: { stock: newStock }, 
      include: this.getIncludeRelations() 
    })
    return mapProduct(result)
  }

  async getProductStats() {
    const [total, active, inactive, lowStock, outOfStock, totalValue] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: false } }),
      this.prisma.product.count({ where: { stock: { lte: 5 } } }),
      this.prisma.product.count({ where: { stock: { lte: 0 } } }),
      this.prisma.product.aggregate({ _sum: { price: true } }).then((res: any) => res._sum.price || 0)
    ])
    return { total, active, inactive, lowStock, outOfStock, totalValue }
  }

  async searchProducts(query: string): Promise<Product[]> {
    const results = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } }
        ]
      },
      include: this.getIncludeRelations()
    })
    return results.map(mapProduct)
  }
} 