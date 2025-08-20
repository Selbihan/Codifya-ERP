import { Request, Response } from 'express'
import { ProductService } from '../services/productService'

export class ProductController {
  private service: ProductService

  constructor(service: ProductService) {
    this.service = service
  }

  async list(req: Request, res: Response) {
    try {
      const { search, categoryId, minPrice, maxPrice, inStock, lowStock, isActive, page, limit } = req.query
      const result = await this.service.getProducts({
        search: search as string | undefined,
        categoryId: categoryId as string | undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        inStock: inStock !== undefined ? String(inStock) === 'true' : undefined,
        lowStock: lowStock !== undefined ? String(lowStock) === 'true' : undefined,
        isActive: isActive !== undefined ? String(isActive) === 'true' : undefined,
        page: page !== undefined ? Number(page) : 1,
        limit: limit !== undefined ? Number(limit) : 10
      })
      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Internal server error' })
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const product = await this.service.getProductById(id)
      res.json(product)
    } catch (error: any) {
      const isNotFound = error?.message === 'Ürün bulunamadı'
      res.status(isNotFound ? 404 : 400).json({ error: error?.message || 'Hata' })
    }
  }

  async create(req: Request, res: Response) {
    try {
      const createdBy = String((req as any).user?.userId)
      const product = await this.service.createProduct(req.body, createdBy)
      res.status(201).json(product)
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Oluşturma hatası' })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const product = await this.service.updateProduct(id, req.body)
      res.json(product)
    } catch (error: any) {
      const isNotFound = error?.message === 'Ürün bulunamadı'
      res.status(isNotFound ? 404 : 400).json({ error: error?.message || 'Güncelleme hatası' })
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await this.service.deleteProduct(id)
      res.json(result)
    } catch (error: any) {
      const isNotFound = error?.message === 'Ürün bulunamadı'
      res.status(isNotFound ? 404 : 400).json({ error: error?.message || 'Silme hatası' })
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { stock } = req.body as { stock: number }
      const product = await this.service.updateStock(id, Number(stock))
      res.json(product)
    } catch (error: any) {
      const isNotFound = error?.message === 'Ürün bulunamadı'
      res.status(isNotFound ? 404 : 400).json({ error: error?.message || 'Stok güncelleme hatası' })
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const products = await this.service.getLowStockProducts()
      res.json(products)
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Internal server error' })
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await (this.service as any).getProductStats?.()
      res.json(stats)
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Internal server error' })
    }
  }
}


