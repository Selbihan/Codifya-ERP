import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { LeadList } from '@/components/crm'

export default function LeadsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Potansiyel Müşteriler</h1>
          <p className="text-gray-600 mt-1">Lead'lerinizi takip edin ve müşteriye dönüştürün</p>
        </div>
        <LeadList />
      </div>
    </DashboardLayout>
  )
}
