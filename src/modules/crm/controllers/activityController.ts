import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ActivityService } from '../services/activityService'

const activityService = ActivityService.create(prisma)

// POST /api/crm/activities
export async function createActivityHandler(req: NextRequest) {
  try {
    const body = await req.json()
    const userId = 1 // TODO: auth
    const activity = await activityService.createActivity(body, userId)
    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}

// GET /api/crm/activities?entityType=LEAD&entityId=xxx
export async function listActivitiesHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType') as any
    const entityId = searchParams.get('entityId') as string
    if (!entityType || !entityId) throw new Error('entityType ve entityId zorunlu')
    const activities = await activityService.listActivities({ entityType, entityId })
    return NextResponse.json({ success: true, data: activities })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
