import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from '@/modules/crm/services/customerService'
import { prisma } from '@/lib/prisma'

// GET /api/crm/dashboard - CRM dashboard istatistikleri
export async function GET(request: NextRequest) {
  try {
    const customerService = CustomerService.create()
    
    // Müşteri istatistikleri
    const customerStats = await customerService.stats()
    
    // Lead istatistikleri
    const totalLeads = await prisma.lead.count()
    const newLeads = await prisma.lead.count({
      where: { status: 'NEW' }
    })
    const qualifiedLeads = await prisma.lead.count({
      where: { status: 'QUALIFIED' }
    })
    
    // Activity istatistikleri
    const totalActivities = await prisma.activity.count()
    const todayActivities = await prisma.activity.count({
      where: {
        dueAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    })
    
    // Son aktiviteler
    const recentActivities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        subject: true,
        createdAt: true,
        entityType: true,
        entityId: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard verileri getirildi',
      data: {
        customers: customerStats,
        leads: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads
        },
        activities: {
          total: totalActivities,
          today: todayActivities,
          recent: recentActivities
        }
      }
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Sunucu hatası'
      },
      { status: 500 }
    )
  }
}