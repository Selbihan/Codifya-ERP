import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ActivitiesView } from '@/components/crm'

export default function ActivitiesPage() {
  return (
    <DashboardLayout>
      <ActivitiesView />
    </DashboardLayout>
  )
}
