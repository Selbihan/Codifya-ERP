'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { OrderList } from '@/modules/orders/components/OrderList'
import { CreateOrderForm } from '@/modules/orders/components/CreateOrderForm'
import { Order, OrderStatus } from '@/modules/orders/types'
import { Button } from '@/components/ui/button'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || 'Siparişler yüklenemedi')
      setOrders(json.data.orders || json.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleEdit = (order: Order) => {
    // TODO: edit modal
    alert('Düzenle: ' + order.orderNumber)
  }
  const handleDelete = async (orderId: string) => {
    if (!confirm('Silinsin mi?')) return
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    const j = await res.json()
    if (!res.ok || !j.success) return alert(j.message || 'Silme hatası')
    fetchOrders()
  }
  const handleViewHistory = (orderId: string) => {
    alert('Geçmiş: ' + orderId)
  }
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    const j = await res.json()
    if (!res.ok || !j.success) return alert(j.message || 'Durum güncellenemedi')
    fetchOrders()
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">Tüm Siparişler</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreate(s => !s)} variant={showCreate ? 'ghost' : 'primary'} size="sm">
            {showCreate ? 'Kapat' : 'Yeni Sipariş'}
          </Button>
          <Button onClick={fetchOrders} disabled={loading} size="sm" variant="outline">Yenile</Button>
        </div>
      </div>
      {showCreate && (
        <div className="mb-6">
          <CreateOrderForm
            onSuccess={() => { setShowCreate(false); fetchOrders() }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}
      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      {loading ? <div>Yükleniyor...</div> : (
        <OrderList
          orders={orders}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewHistory={handleViewHistory}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </DashboardLayout>
  )
}
