// Base model interfaces ve types
// Bu dosya ortak model alanlarını tanımlar

// Base Entity Interface - tüm modellerde ortak olan alanlar
// Tüm modellerde ortak olan temel alanlar
export interface BaseEntity {
  id: string | number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// Auditable Entity - audit bilgileri içeren modeller için
// Audit ve soft delete destekli modeller için
export interface AuditableEntity extends BaseEntity {
  createdBy: string | number
  updatedBy?: string | number
  deletedAt?: Date
  deletedBy?: string | number
}

// Soft Delete Entity - soft delete destekleyen modeller için
// Soft delete destekleyen modeller için
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date
  deletedBy?: string | number
}

// Code Entity - kod alanı olan modeller için
// Kod alanı olan modeller için
export interface CodeEntity extends BaseEntity {
  code: string
}

// Timestamped Entity - sadece timestamp alanları olan modeller için
// Sadece timestamp alanları olan modeller için
export interface TimestampedEntity {
  createdAt: Date
  updatedAt: Date
}

// User Trackable - kullanıcı takibi olan modeller için
// Kullanıcı takibi olan modeller için
export interface UserTrackable {
  createdBy: string | number
  updatedBy?: string | number
  deletedBy?: string | number
}
