// Product-related types

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreatedByUserRef {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: ProductCategory | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByUser?: ProductCreatedByUserRef;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  isActive?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


