import { NextRequest, NextResponse } from 'next/server'
import { ActivityService } from '@/modules/crm/services/activityService'
import { prisma } from '@/lib/prisma'

// GET /api/crm/activities - Activity listesi
export async function GET(request: NextRequest) {
  try {
    // Basit listeleme (ActivityService'de getEntityActivities yok)
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || undefined
    
    const activities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      where: type ? { type: type as any } : undefined
    })
    
    return NextResponse.json({
      success: true,
      message: 'Activity listesi getirildi',
      data: { activities, total: activities.length }
    })
  } catch (error) {
    console.error('Activity list error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Sunucu hatası'
      },
      { status: 500 }
    )
  }
}

// POST /api/crm/activities - Yeni activity oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activityService = ActivityService.create(prisma)
    
    // Basit validasyon
    if (!body.type || !body.subject || !body.entityType || !body.entityId) {
      return NextResponse.json(
        { success: false, message: 'Type, subject, entityType ve entityId zorunludur' },
        { status: 400 }
      )
    }
    
    // TODO: JWT'den userId al
    const userId = 1
    
    const activity = await activityService.createActivity({
      type: body.type,
      subject: body.subject,
      description: body.description,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      target: {
        entityType: body.entityType,
        entityId: body.entityId
      }
    }, userId)
    
    return NextResponse.json({
      success: true,
      message: 'Activity başarıyla oluşturuldu',
      data: activity
    }, { status: 201 })
    
  } catch (error) {
    console.error('Activity creation error:', error)
    
    if (error instanceof Error && error.message.includes('bulunamadı')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
