import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CRMDashboard } from '@/components/crm'

export default function CRMPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600 mt-1">Müşteri ilişkileri yönetimi ve satış takibi</p>
        </div>
        <CRMDashboard />
      </div>
    </DashboardLayout>
  )
}
