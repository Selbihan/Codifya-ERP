'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CRMStats {
  customers: {
    total: number
    active: number
    inactive: number
    newThisMonth: number
  }
  leads: {
    total: number
    new: number
    qualified: number
  }
  activities: {
    total: number
    today: number
    recent: Array<{
      id: string
      type: string
      subject: string
      createdAt: string
      entityType: string
      entityId: string
    }>
  }
}

export function CRMDashboard() {
  const [stats, setStats] = useState<CRMStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/crm/dashboard')
      if (!response.ok) throw new Error('Veri yüklenemedi')
      
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Hata: {error}</div>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toplam Müşteri */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
              <p className="text-3xl font-bold">{stats.customers.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Badge variant="success">{stats.customers.active} aktif</Badge>
            <Badge variant="info">{stats.customers.newThisMonth} yeni</Badge>
          </div>
        </Card>

        {/* Toplam Lead */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Lead</p>
              <p className="text-3xl font-bold">{stats.leads.total}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Badge variant="error">{stats.leads.new} yeni</Badge>
            <Badge variant="success">{stats.leads.qualified} nitelikli</Badge>
          </div>
        </Card>

        {/* Toplam Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Aktivite</p>
              <p className="text-3xl font-bold">{stats.activities.total}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="info">{stats.activities.today} bugün</Badge>
          </div>
        </Card>

        {/* Genel Durum */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Müşteri</p>
              <p className="text-3xl font-bold">{stats.customers.active}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="warning">{stats.customers.inactive} pasif</Badge>
          </div>
        </Card>
      </div>

      {/* Son Aktiviteler */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
        <div className="space-y-3">
          {stats.activities.recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz aktivite bulunmuyor</p>
          ) : (
            stats.activities.recent.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="default">{activity.type}</Badge>
                  <div>
                    <p className="font-medium">{activity.subject}</p>
                    <p className="text-sm text-gray-600">
                      {activity.entityType}: {activity.entityId}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
