import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadService } from '../services/leadService'
import { CreateLeadInput } from '@/types'

const leadService = LeadService.create(prisma)

// POST /api/crm/leads
export async function createLeadHandler(req: NextRequest) {
  try {
    const body = await req.json() as CreateLeadInput
    // TODO: auth context'ten userId al
    const userId = 1
    const lead = await leadService.createLead(body, userId)
    return NextResponse.json({ success: true, data: lead }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}

// GET /api/crm/leads
export async function listLeadsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as any
    const ownerUserId = searchParams.get('ownerUserId') ? Number(searchParams.get('ownerUserId')) : undefined
    const search = searchParams.get('search') || undefined
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 10

    const result = await leadService.listLeads({ status, ownerUserId, search, page, pageSize })
    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}

// POST /api/crm/leads/:id/convert
export async function convertLeadHandler(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const userId = 1 // TODO: auth
    const result = await leadService.convertLeadToContact(id, userId, { createAccountIfMissing: true })
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
