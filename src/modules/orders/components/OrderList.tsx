'use client'

import { useState } from 'react'
import { Order, OrderStatus } from '../types'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'

interface OrderListProps {
  orders: Order[]
  onEdit: (order: Order) => void
  onDelete: (orderId: string) => void
  onViewHistory: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'PROCESSING':
      return 'bg-purple-100 text-purple-800'
    case 'SHIPPED':
      return 'bg-indigo-100 text-indigo-800'
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'Beklemede'
    case 'CONFIRMED':
      return 'Onaylandı'
    case 'PROCESSING':
      return 'İşleniyor'
    case 'SHIPPED':
      return 'Kargoda'
    case 'DELIVERED':
      return 'Teslim Edildi'
    case 'CANCELLED':
      return 'İptal Edildi'
    default:
      return status
  }
}

export function OrderList({ orders, onEdit, onDelete, onViewHistory, onUpdateStatus }: OrderListProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Sipariş',
      sortable: true,
      accessor: (o) => (
        <div className="flex flex-col">
          <span className="font-medium">{o.orderNumber}</span>
          <span className="text-xs text-gray-500">{o.items.length} ürün</span>
        </div>
      )
    },
    {
      key: 'customer',
      header: 'Müşteri',
      accessor: (o) => (
        <div className="flex flex-col">
          <span className="font-medium">{o.customer?.name || 'Bilinmeyen'}</span>
          <span className="text-xs text-gray-500">{o.customer?.email || '-'}</span>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Tutar',
      sortable: true,
      align: 'right',
      accessor: (o) => (
        <div className="flex flex-col items-end">
          <span className="font-medium">
            {o.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </span>
          {o.discount > 0 && (
            <span className="text-xs text-green-600">
              -{o.discount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} indirim
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      sortable: true,
      accessor: (o) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(o.status)}`}>
          {getStatusText(o.status)}
        </span>
      )
    },
    {
      key: 'orderDate',
      header: 'Tarih',
      sortable: true,
      accessor: (o) => new Date(o.orderDate).toLocaleDateString('tr-TR')
    },
    {
      key: 'actions',
      header: 'İşlemler',
      accessor: (o) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onViewHistory(o.id)} className="text-blue-600 hover:text-blue-900 text-xs">Geçmiş</button>
          <button onClick={() => onEdit(o)} className="text-indigo-600 hover:text-indigo-900 text-xs">Düzenle</button>
          <div className="relative">
            <button
              onClick={() => setSelectedOrder(selectedOrder === o.id ? null : o.id)}
              className="text-green-600 hover:text-green-900 text-xs"
            >Durum</button>
            {selectedOrder === o.id && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg z-20 border">
                <div className="py-1 max-h-60 overflow-auto text-xs">
                  {(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => { onUpdateStatus(o.id, status); setSelectedOrder(null) }}
                      className={`block w-full text-left px-3 py-1.5 hover:bg-gray-50 ${o.status === status ? 'bg-gray-50 font-medium' : ''}`}
                    >{getStatusText(status)}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => onDelete(o.id)} className="text-red-600 hover:text-red-900 text-xs">Sil</button>
        </div>
      )
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={orders}
      striped
      compact
      initialSort={{ key: 'orderDate', direction: 'desc' }}
    />
  )
} 