'use client'
import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CRMStats {
  customers: { total: number; active: number; inactive: number; newThisMonth: number }
  leads: { total: number; new: number; qualified: number }
  activities: { total: number; today: number; recent: any[] }
}
interface OrderStats {
  totalOrders: number
  pending: number
  completed: number
  canceled: number
  revenueThisMonth: number
}

export default function LiveDashboard() {
  const [crm, setCrm] = useState<CRMStats | null>(null)
  const [orders, setOrders] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [crmRes, orderRes] = await Promise.all([
          fetch('/api/crm/dashboard'),
          fetch('/api/orders/dashboard')
        ])
        if (crmRes.ok) {
          const data = await crmRes.json(); if (data.success) setCrm(data.data)
        }
        if (orderRes.ok) {
          const data = await orderRes.json(); if (data.success) setOrders(data.data)
        }
      } catch (e: any) {
        setError(e.message || 'Veri alınamadı')
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000) // 30sn'de bir tazele
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className='grid gap-6'><div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>{[1,2,3,4].map(i=> <Card key={i} className='p-6 animate-pulse h-32'><div className='w-full h-full'/></Card> )}</div></div>
  }
  if (error) return <Card className='p-6 text-red-600'>Hata: {error}</Card>

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='p-6'>
          <p className='text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide'>Müşteri</p>
          <p className='mt-1 text-3xl font-bold text-[var(--color-text)]'>{crm?.customers.total ?? '-'}</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            <Badge variant='success'>{crm?.customers.active} aktif</Badge>
            <Badge variant='info'>{crm?.customers.newThisMonth} yeni</Badge>
          </div>
        </Card>
        <Card className='p-6'>
          <p className='text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide'>Leads</p>
          <p className='mt-1 text-3xl font-bold'>{crm?.leads.total ?? '-'}</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            <Badge variant='warning'>{crm?.leads.new} yeni</Badge>
            <Badge variant='success'>{crm?.leads.qualified} nitelikli</Badge>
          </div>
        </Card>
        <Card className='p-6'>
          <p className='text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide'>Aktiviteler</p>
            <p className='mt-1 text-3xl font-bold'>{crm?.activities.total ?? '-'}</p>
            <div className='mt-3 flex gap-2'>
              <Badge variant='info'>{crm?.activities.today} bugün</Badge>
            </div>
        </Card>
        <Card className='p-6'>
          <p className='text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide'>Sipariş</p>
          <p className='mt-1 text-3xl font-bold'>{orders?.totalOrders ?? '-'}</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            <Badge variant='success'>₺{orders?.revenueThisMonth?.toLocaleString('tr-TR') || '0'} gelir</Badge>
            <Badge variant='warning'>{orders?.pending} bekleyen</Badge>
          </div>
        </Card>
      </div>

      <Card className='p-6'>
        <h3 className='text-sm font-semibold mb-4 tracking-wide text-[var(--color-text-muted)] uppercase'>Son 5 Aktivite</h3>
        <div className='space-y-3'>
          {crm?.activities.recent?.length ? crm.activities.recent.map(a => (
            <div key={a.id} className='flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-2 bg-[var(--color-surface-alt)]/50'>
              <div className='flex items-center gap-3 min-w-0'>
                <Badge variant='default' className='text-[10px]'>{a.type}</Badge>
                <div className='min-w-0'>
                  <p className='text-sm font-medium truncate max-w-xs'>{a.subject}</p>
                  <p className='text-xs text-[var(--color-text-soft)]'>{new Date(a.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
              <span className='text-[10px] uppercase tracking-wide text-[var(--color-text-soft)]'>{a.entityType}</span>
            </div>
          )) : <p className='text-[var(--color-text-soft)] text-sm'>Aktivite yok</p>}
        </div>
      </Card>
    </div>
  )
}
