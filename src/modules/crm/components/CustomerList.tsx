'use client'

import { Customer } from '../types'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'

interface CustomerListProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
  onViewHistory: (customerId: string) => void
}

export function CustomerList({ customers, onEdit, onDelete, onViewHistory }: CustomerListProps) {
  const columns: DataTableColumn<Customer & { orders: any[] }>[] = [
    {
      key: 'name',
      header: 'Müşteri',
      sortable: true,
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
            {c.name.charAt(0).toUpperCase()}
          </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{c.name}</span>
              <span className="text-xs text-gray-500">{c.createdAt.toLocaleDateString('tr-TR')}</span>
            </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'İletişim',
      accessor: (c) => (
        <div className="flex flex-col text-xs">
          <span className="text-gray-700">{c.email || '-'}</span>
          <span className="text-gray-500">{c.phone || '-'}</span>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Şirket',
      accessor: (c) => (
        <div className="flex flex-col text-xs">
          <span className="text-gray-700">{c.company || '-'}</span>
          <span className="text-gray-500">{c.taxNumber || '-'}</span>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Durum',
      accessor: (c) => (
        <span className={`inline-flex px-2 py-1 text-[10px] font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {c.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'orders',
      header: 'Siparişler',
      accessor: (c) => <span className="text-xs font-medium">{c.orders.length} adet</span>
    },
    {
      key: 'actions',
      header: 'İşlemler',
      accessor: (c) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onViewHistory(c.id)} className="text-blue-600 hover:text-blue-900 text-xs">Geçmiş</button>
          <button onClick={() => onEdit(c)} className="text-indigo-600 hover:text-indigo-900 text-xs">Düzenle</button>
          <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-900 text-xs">Sil</button>
        </div>
      )
    }
  ]

  return <DataTable columns={columns} data={customers as any} striped compact initialSort={{ key: 'name', direction: 'asc' }} />
}