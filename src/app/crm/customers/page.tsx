import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CustomerList } from '@/components/crm'

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm müşterilerinizi görüntüleyin ve yönetin</p>
        </div>
        <CustomerList />
      </div>
    </DashboardLayout>
  )
}
