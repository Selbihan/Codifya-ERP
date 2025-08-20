import { PrismaClient } from '@prisma/client'
import { Activity, ActivityType, EntityType, CRMActivityTarget } from '@/types'

interface CreateActivityInput {
  type: ActivityType
  subject: string
  description?: string
  dueAt?: Date
  target: CRMActivityTarget
}

export class ActivityService {
  constructor(private prisma: PrismaClient) {}

  static create(prisma: PrismaClient) {
    return new ActivityService(prisma)
  }

  private validate(input: CreateActivityInput) {
    if (!input.subject?.trim()) throw new Error('Konu (subject) zorunlu')
  const validTypes: ActivityType[] = ['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']
    if (!validTypes.includes(input.type)) throw new Error('Geçersiz aktivite tipi')
  }

  private async ensureTargetExists(target: CRMActivityTarget) {
    switch (target.entityType) {
      case 'LEAD':
        if (!(await this.prisma.lead.findUnique({ where: { id: target.entityId } }))) throw new Error('Lead bulunamadı')
        break
      case 'CONTACT':
        if (!(await this.prisma.contact.findUnique({ where: { id: target.entityId } }))) throw new Error('Contact bulunamadı')
        break
      case 'ACCOUNT':
        if (!(await this.prisma.account.findUnique({ where: { id: target.entityId } }))) throw new Error('Account bulunamadı')
        break
      case 'ORDER':
        if (!(await this.prisma.order.findUnique({ where: { id: target.entityId } }))) throw new Error('Order bulunamadı')
        break
      case 'OPPORTUNITY':
        // Opportunity henüz yok, kontrol geçici
        break
      default:
        throw new Error('Desteklenmeyen hedef tipi')
    }
  }

  async createActivity(input: CreateActivityInput, ownerUserId: number): Promise<Activity> {
    this.validate(input)
    await this.ensureTargetExists(input.target)

    const created = await this.prisma.activity.create({
      data: {
        type: input.type as ActivityType,
        subject: input.subject.trim(),
        description: input.description?.trim(),
        dueAt: input.dueAt,
        entityType: input.target.entityType as EntityType,
        entityId: input.target.entityId,
        ownerUserId
      }
    })

    return created as unknown as Activity
  }

  async listActivities(target: CRMActivityTarget, limit = 50): Promise<Activity[]> {
    const activities = await this.prisma.activity.findMany({
      where: { entityType: target.entityType, entityId: target.entityId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return activities as any
  }
}
