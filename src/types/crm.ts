// CRM Domain Types - extracted from index.ts for modularity
// NOTE: Para (money) alanları ileride Decimal desteğine geçebilir. Şimdilik number.

export type LeadSource = 'WEB' | 'EVENT' | 'REFERRAL' | 'OTHER'
export type LeadStatus = 'NEW' | 'QUALIFIED' | 'DISQUALIFIED'
export type AccountSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK'
export type EntityType = 'LEAD' | 'CONTACT' | 'ACCOUNT' | 'ORDER' | 'OPPORTUNITY'

export interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  source: LeadSource
  status: LeadStatus
  ownerUserId: number
  convertedContactId?: string | null
  convertedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  accountId?: string | null
  ownerUserId: number
  createdAt: Date
  updatedAt: Date
  convertedFromLeadId?: string | null // (DB'de yok; ihtiyaç olursa şemaya eklenir)
}

export interface Account { // CRM Account (FinancialAccount ile karışmasın)
  id: string
  name: string
  vatNumber?: string | null
  industry?: string | null
  size?: AccountSize | null
  website?: string | null
  ownerUserId: number
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  type: ActivityType
  subject: string
  description?: string | null
  dueAt?: Date | null
  completedAt?: Date | null
  entityType: EntityType
  entityId: string
  ownerUserId: number
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceLine { // Fatura satırı
  id: string
  invoiceId: string
  productId?: string | null
  description: string
  quantity: number
  unitPrice: number
  discount?: number | null
  taxRate?: number | null
  taxAmount: number
  lineTotal: number
  createdAt: Date
  updatedAt: Date
}

export interface PaymentAllocation { // Ödeme - fatura tahsisi
  id: string
  paymentId: string
  invoiceId: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export type CRMActivityTarget =
  | { entityType: 'LEAD'; entityId: string }
  | { entityType: 'CONTACT'; entityId: string }
  | { entityType: 'ACCOUNT'; entityId: string }
  | { entityType: 'ORDER'; entityId: string }
  | { entityType: 'OPPORTUNITY'; entityId: string }

export interface CreateLeadInput {
  name: string
  email?: string
  phone?: string
  source?: LeadSource
}

export interface LeadListFilter {
  status?: LeadStatus
  ownerUserId?: number
  search?: string
  page?: number
  pageSize?: number
}

export interface ConvertLeadResult {
  leadId: string
  contactId: string
  accountId?: string | null
  convertedAt: Date
}
