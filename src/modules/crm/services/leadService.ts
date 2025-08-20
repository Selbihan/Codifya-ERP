import { PrismaClient, Prisma } from '@prisma/client'
import { validateEmail, validatePhone } from '@/utils/validation'
import { Lead, LeadStatus, LeadSource, CreateLeadInput, ConvertLeadResult } from '@/types'

/**
 * LeadService
 * Basit lead oluşturma, listeleme ve contact/account'a dönüştürme işlemleri.
 */
export class LeadService {
  constructor(private prisma: PrismaClient) {}

  static create(prisma: PrismaClient) {
    return new LeadService(prisma)
  }

  private normalizeInput(input: CreateLeadInput): { name: string; email?: string; phone?: string; source: LeadSource } {
    const allowed: LeadSource[] = ['WEB', 'EVENT', 'REFERRAL', 'OTHER']
    const rawSource = (input.source || 'OTHER').toString().trim().toUpperCase()
    const source = (allowed.includes(rawSource as LeadSource) ? rawSource : 'OTHER') as LeadSource

    const normalized: { name: string; email?: string; phone?: string; source: LeadSource } = {
      name: input.name.trim(),
      source
    }
    if (input.email) normalized.email = input.email.trim()
    if (input.phone) normalized.phone = input.phone.trim()
    return normalized
  }

  private validate(input: { name: string; email?: string; phone?: string }) {
    if (!input.name) throw new Error('İsim zorunlu')
    if (input.email && !validateEmail(input.email)) throw new Error('Geçersiz email')
    if (input.phone && !validatePhone(input.phone)) throw new Error('Geçersiz telefon')
  }

  async createLead(data: CreateLeadInput, ownerUserId: number): Promise<Lead> {
    const normalized = this.normalizeInput(data)
    this.validate(normalized)

    // Duplicate basic check (email or phone)
    if (normalized.email) {
      const exists = await this.prisma.lead.findFirst({ where: { email: normalized.email } })
      if (exists) throw new Error('Bu email ile bir lead zaten var')
    }

    const created = await this.prisma.lead.create({
      data: {
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone,
        source: normalized.source as LeadSource,
        status: 'NEW',
        ownerUserId
      }
    })

    return created as unknown as Lead
  }

  async listLeads(params: { status?: LeadStatus; ownerUserId?: number; search?: string; page?: number; pageSize?: number }) {
    const { status, ownerUserId, search, page = 1, pageSize = 10 } = params

    const where: any = {}
    if (status) where.status = status
    if (ownerUserId) where.ownerUserId = ownerUserId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [total, data] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize })
    ])

    return {
      data: data as Lead[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  async getLead(id: string): Promise<Lead | null> {
    return (await this.prisma.lead.findUnique({ where: { id } })) as any
  }

  async convertLeadToContact(leadId: string, userId: number, options?: { createAccountIfMissing?: boolean }): Promise<ConvertLeadResult> {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new Error('Lead bulunamadı')
    if (lead.convertedContactId) throw new Error('Lead zaten dönüştürülmüş')

  return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let accountId: string | undefined

      if (options?.createAccountIfMissing) {
        // Basit heuristik: lead name tek kelime değilse bir Account oluştur
        if (lead.name.split(' ').length > 1) {
          const account = await tx.account.create({
            data: {
              name: lead.name,
              ownerUserId: lead.ownerUserId
            }
          })
          accountId = account.id
        }
      }

      const contact = await tx.contact.create({
        data: {
          firstName: lead.name.split(' ')[0] || lead.name,
          lastName: lead.name.split(' ').slice(1).join(' ') || '—',
          email: lead.email ?? `no-email-${lead.id}@local`,
          phone: lead.phone,
          ownerUserId: lead.ownerUserId,
          accountId: accountId || undefined
        }
      })

      await tx.lead.update({
        where: { id: lead.id },
        data: { convertedContactId: contact.id, convertedAt: new Date(), status: 'QUALIFIED' }
      })

      return {
        leadId: lead.id,
        contactId: contact.id,
        accountId: accountId,
        convertedAt: new Date()
      }
    })
  }
}
