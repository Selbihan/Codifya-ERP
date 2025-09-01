import React, { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { ActivitiesView } from '@/components/crm'

export default function ActivitiesPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading activities...</div>}>
        <ActivitiesView />
      </Suspense>
    </DashboardLayout>
  )
}
