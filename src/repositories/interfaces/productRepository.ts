import { Product } from '@/types'
import { IBaseRepository } from './baseRepository'

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  isActive?: boolean;
  createdBy: number;
}
export interface UpdateProductDTO {
  name?: string
  description?: string
  sku?: string
  price?: number
  cost?: number
  stock?: number
  minStock?: number
  categoryId?: string
  isActive?: boolean
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  lowStock?: boolean
  isActive?: boolean
  createdBy?: string
}

export interface IProductRepository extends IBaseRepository<Product, CreateProductDTO, UpdateProductDTO, ProductFilters> {
  findBySKU(sku: string): Promise<Product | null>
  findByCategory(categoryId: string): Promise<Product[]>
  getLowStockProducts(): Promise<Product[]>
  updateStock(productId: string, newStock: number): Promise<Product>
  getProductStats(): Promise<{
    total: number
    active: number
    inactive: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }>
  searchProducts(query: string): Promise<Product[]>
} 