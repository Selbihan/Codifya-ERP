'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { OrderList } from '@/modules/orders/components/OrderList'
import { Order, OrderStatus } from '@/modules/orders/types'
import { Button } from '@/components/ui/button'

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders?status=PENDING')
      const json = await res.json()
      if (res.ok && json.success) {
        setOrders(json.data.orders || json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchOrders() }, [])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Bekleyen Siparişler</h1>
        <Button onClick={fetchOrders} disabled={loading} size="sm">Yenile</Button>
      </div>
      {loading ? <div>Yükleniyor...</div> : (
        <OrderList
          orders={orders}
          onEdit={() => {}}
          onDelete={() => {}}
          onViewHistory={() => {}}
          onUpdateStatus={() => { fetchOrders() }}
        />
      )}
    </DashboardLayout>
  )
}
