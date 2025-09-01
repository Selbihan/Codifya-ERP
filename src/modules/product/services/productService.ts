import { prisma } from '@/lib/prisma'
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters, 
  ProductListResponse 
} from '../../inventory/types'
import { User, Product } from '@/types'

// Prisma'dan dönen veriyi User tipine uygun şekilde map'le
function mapUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '', // dummy
    role: 'USER', // dummy
    isActive: true, // dummy
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Service response tipi: temel Product + ilişkiler
export type ProductExtended = Product & {
  category?: {
    id: string
    name: string
    description?: string
    parentId?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  } | null
  createdByUser?: Pick<User, 'id' | 'name' | 'email'>
}

// Prisma dönen veriyi genişletilmiş tipe map'le
function mapProduct(prismaProduct: any): ProductExtended {
  return {
    id: prismaProduct.id,
    name: prismaProduct.name,
    description: prismaProduct.description ?? undefined,
    sku: prismaProduct.sku,
    price: prismaProduct.price,
    cost: prismaProduct.cost,
    stock: prismaProduct.stock,
    minStock: prismaProduct.minStock,
    categoryId: prismaProduct.categoryId ?? undefined,
    isActive: prismaProduct.isActive,
    createdAt: prismaProduct.createdAt,
    updatedAt: prismaProduct.updatedAt,
    createdBy: prismaProduct.createdBy,
    // extra relations
    category: prismaProduct.category
      ? {
          id: prismaProduct.category.id,
          name: prismaProduct.category.name,
          description: prismaProduct.category.description ?? undefined,
          parentId: prismaProduct.category.parentId ?? undefined,
          isActive: prismaProduct.category.isActive,
          createdAt: prismaProduct.category.createdAt,
          updatedAt: prismaProduct.category.updatedAt
        }
      : null,
    createdByUser: prismaProduct.createdByUser
      ? mapUser(prismaProduct.createdByUser)
      : undefined
  }
}

export interface IProductService {
  createProduct(data: CreateProductRequest, createdBy: number): Promise<ProductExtended>
  getProductById(id: string): Promise<ProductExtended>
  updateProduct(id: string, data: UpdateProductRequest): Promise<ProductExtended>
  deleteProduct(id: string): Promise<{ message: string }>
  getProducts(filters: ProductFilters): Promise<{
    products: ProductExtended[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>
  getLowStockProducts(): Promise<ProductExtended[]>
  updateStock(productId: string, newStock: number): Promise<ProductExtended>
  getProductStats(): Promise<{
    total: number
    active: number
    inactive: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }>
}

export class ProductService implements IProductService {
  static create(): ProductService {
    return new ProductService()
  }
  async createProduct(data: CreateProductRequest, createdBy: number) {
    // SKU benzersizlik kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku }
    })

    if (existingProduct) {
      throw new Error('Bu SKU zaten kullanılıyor')
    }

    // Kategori kontrolü
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      })

      if (!category) {
        throw new Error('Kategori bulunamadı')
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        categoryId: data.categoryId,
        createdBy
      },
      include: {
        category: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return mapProduct(product)
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Ürün bulunamadı')
    }

    return mapProduct(product)
  }

  async updateProduct(id: string, data: UpdateProductRequest) {
    // Ürün varlık kontrolü
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      throw new Error('Ürün bulunamadı')
    }

    // SKU benzersizlik kontrolü (eğer SKU değiştiriliyorsa)
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku }
      })

      if (skuExists) {
        throw new Error('Bu SKU zaten kullanılıyor')
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return mapProduct(product)
  }

  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    })

    if (!product) {
      throw new Error('Ürün bulunamadı')
    }

    // Siparişlerde kullanılıyorsa silme
    if (product.orderItems.length > 0) {
      throw new Error('Bu ürün siparişlerde kullanıldığı için silinemez')
    }

    await prisma.product.delete({
      where: { id }
    })

    return { message: 'Ürün başarıyla silindi' }
  }

  async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      lowStock,
      isActive,
      page = 1,
      limit = 10
    } = filters

    const skip = (page - 1) * limit

    // Filtreleme koşulları
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (minPrice !== undefined) {
      where.price = { gte: minPrice }
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice }
    }

    if (inStock !== undefined) {
      where.stock = inStock ? { gt: 0 } : { lte: 0 }
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    // lowStock filtrelemesini in-memory uygulamak için iki yol:
    // 1) lowStock true ise tüm listeyi çek → filtrele → sayfala
    // 2) değilse normal sayfalı sorgu
    if (lowStock) {
      const all = await prisma.product.findMany({
        where,
        include: {
          category: true,
          createdByUser: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      const low = all.filter((p: any) => (p.stock || 0) <= (p.minStock || 0))
      const total = low.length
      const paged = low.slice(skip, skip + limit)
      const products = paged.map(mapProduct)
      return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
    } else {
      // Toplam sayı
      const total = await prisma.product.count({ where })
      // Ürünler
      const rawProducts = await prisma.product.findMany({
        where,
        include: {
          category: true,
          createdByUser: {
            select: { id: true, name: true, email: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
      const products = rawProducts.map(mapProduct)
      return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
    }
  }

  async getLowStockProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { stock: 'asc' }
    })
    const low = products.filter((p: any) => (p.stock || 0) <= (p.minStock || 0))
    return low.map(mapProduct)
  }

  async updateStock(productId: string, newStock: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      throw new Error('Ürün bulunamadı')
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
      include: {
        category: true
      }
    })

    return mapProduct(updatedProduct)
  }

  async getProductStats() {
    const [total, active, outOfStock, all] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.product.findMany({ select: { price: true, stock: true, minStock: true } })
    ])

    const lowStock = all.filter((p: any) => (p.stock || 0) <= (p.minStock || 0)).length
    const totalValue = all.reduce((sum: number, p: any) => sum + (p.price || 0) * (p.stock || 0), 0)

    return {
      total,
      active,
      inactive: total - active,
      lowStock,
      outOfStock,
      totalValue
    }
  }
} 