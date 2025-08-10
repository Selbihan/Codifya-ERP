// Base model utilities ve helper functions

import { BaseEntity, AuditableEntity, SoftDeleteEntity } from '../types/baseModels'

// Base Repository Interface
export interface IBaseRepository<T extends BaseEntity> {
  findAll(): Promise<T[]>
  findById(id: string | number): Promise<T | null>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string | number, data: Partial<T>): Promise<T>
  delete(id: string | number): Promise<void>
}

// Soft Delete Repository Interface
export interface ISoftDeleteRepository<T extends SoftDeleteEntity> extends IBaseRepository<T> {
  softDelete(id: string | number, deletedBy: number): Promise<void>
  restore(id: string | number): Promise<void>
  findAllIncludingDeleted(): Promise<T[]>
  findOnlyDeleted(): Promise<T[]>
}

// Base Service Interface
export interface IBaseService<T extends BaseEntity> {
  getAll(): Promise<T[]>
  getById(id: string | number): Promise<T | null>
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>
  update(id: string | number, data: Partial<T>): Promise<T>
  delete(id: string | number): Promise<void>
}

// Utility functions
export class BaseModelUtils {
  // Ortak validation kuralları
  static validateRequired(value: any, fieldName: string): void {
    if (!value) {
      throw new Error(`${fieldName} is required`)
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone)
  }

  // Soft delete helper
  static applySoftDelete<T extends SoftDeleteEntity>(
    entity: T, 
    deletedBy: number
  ): Partial<T> {
    return {
      ...entity,
      deletedAt: new Date(),
      deletedBy,
      isActive: false
    }
  }

  // Audit helper
  static applyAuditFields<T extends AuditableEntity>(
    entity: Partial<T>,
    userId: number,
    isUpdate: boolean = false
  ): Partial<T> {
    const now = new Date()
    
    if (isUpdate) {
      return {
        ...entity,
        updatedBy: userId,
        updatedAt: now
      }
    } else {
      return {
        ...entity,
        createdBy: userId,
        createdAt: now,
        updatedAt: now
      }
    }
  }

  // Generate unique code
  static generateCode(prefix: string, length: number = 6): string {
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.random().toString(36).substring(2, length - 2)
    return `${prefix}${timestamp}${random}`.toUpperCase()
  }
}
