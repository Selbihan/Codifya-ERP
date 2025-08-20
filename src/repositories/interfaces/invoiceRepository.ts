import { IBaseRepository } from './baseRepository'

export type InvoiceType = 'SALES' | 'PURCHASE' | 'EXPENSE'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED'

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string | null
customerId?: string | null
  createdBy: number; // Prisma'dan gelen sayı tipi ile uyumlu
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  type: InvoiceType;
  totalAmount: number;
  taxAmount?: number;
  discount?: number;
  notes?: string;
  order?: {
    id: string;
    customer: {
      id: string;
      name: string;
      createdBy: number;
      email?: string;
      phone?: string;
      address?: string;
      company?: string;
      taxNumber?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    items: { id: string; productId: string; quantity: number; price: number }[];
  } | null;
  customer?: { id: string; name: string } | null;
  createdByUser?: { id: number; name: string } | null;
}


export interface CreateInvoiceDTO {
  invoiceNumber: string
  orderId?: string | null
  customerId?: string | null
  type: InvoiceType
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  dueDate: Date
  notes?: string | null
  createdBy: string
}

export interface UpdateInvoiceDTO {
  status?: InvoiceStatus
  subtotal?: number
  taxAmount?: number
  discount?: number
  totalAmount?: number
  dueDate?: Date
  notes?: string | null
  paidDate?: Date | null
}

export interface InvoiceFilters {
  customerId?: string
  status?: InvoiceStatus
  type?: InvoiceType
  dateFrom?: Date
  dateTo?: Date
  dueDateFrom?: Date
  dueDateTo?: Date
  createdBy?: string
}

export interface IInvoiceRepository extends IBaseRepository<Invoice, CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceFilters> {
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>
  findByOrder(orderId: string): Promise<Invoice | null>
  findByCustomer(customerId: string): Promise<Invoice[]>
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>
  updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice>
  getInvoiceStats(): Promise<{
    total: number
    draft: number
    sent: number
    paid: number
    cancelled: number
    totalAmount: number
    paidAmount: number
    overdueAmount: number
  }>
  getOverdueInvoices(): Promise<Invoice[]>
  getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]>
} 