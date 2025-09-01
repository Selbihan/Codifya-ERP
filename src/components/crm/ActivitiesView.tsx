'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'

interface Activity {
  id: number
  type: string
  subject: string
  description?: string | null
  createdAt: string
  dueAt?: string | null
  targetEntityType: string
  targetEntityId: string
}

interface ActivityListData {
  activities: Activity[]
  total: number
}

export default function ActivitiesView() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<ActivityListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'CALL',
    subject: '',
    description: '',
    entityType: 'LEAD',
    entityId: ''
  })
  const [entityOptions, setEntityOptions] = useState<{ id: string; name: string }[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      const res = await fetch(`/api/crm/activities?${params}`)
      if (!res.ok) throw new Error('Aktiviteler yüklenemedi')
      const json = await res.json()
      if (json.success) setData(json.data)
      else throw new Error(json.message)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  // URL'den leadId geldiyse formu otomatik aç ve doldur
  useEffect(() => {
    const leadId = searchParams?.get('leadId')
    if (leadId) {
      setShowForm(true)
      setForm(f => ({ ...f, entityType: 'LEAD', entityId: leadId }))
    }
  }, [searchParams])

  useEffect(() => {
    if (!showForm) return;
    let url = '';
    if (form.entityType === 'LEAD') url = '/api/crm/leads';
    else if (form.entityType === 'CONTACT') url = '/api/crm/contacts';
    else if (form.entityType === 'ACCOUNT') url = '/api/crm/accounts';
    else if (form.entityType === 'ORDER') url = '/api/crm/orders';
    else if (form.entityType === 'OPPORTUNITY') url = '/api/crm/opportunities';
    else return;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) {
          // Her entity için id ve name alanı normalize ediliyor
          let mapped: { id: string; name: string }[] = [];
          if (form.entityType === 'LEAD') mapped = (json.data.leads as any[]).map(l => ({ id: l.id, name: l.name }));
          else if (form.entityType === 'CONTACT') mapped = (json.data.contacts as any[]).map(c => ({ id: c.id, name: c.firstName + ' ' + c.lastName }));
          else if (form.entityType === 'ACCOUNT') mapped = (json.data.accounts as any[]).map(a => ({ id: a.id, name: a.name }));
          else if (form.entityType === 'ORDER') mapped = (json.data.orders as any[]).map(o => ({ id: o.id, name: o.orderNumber }));
          else if (form.entityType === 'OPPORTUNITY') mapped = (json.data.opportunities as any[]).map(o => ({ id: o.id, name: o.name }));
          setEntityOptions(mapped);
        }
      } catch {}
    })();
  }, [showForm, form.entityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.entityId.trim()) {
      setFormError('Hedef ID boş olamaz (listeden seç veya manuel gir)')
      return
    }
    try {
      const res = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          subject: form.subject,
          description: form.description || undefined,
          entityType: form.entityType,
            entityId: form.entityId
        })
      })
      if (!res.ok) throw new Error('Kayıt başarısız')
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setForm({ type: 'CALL', subject: '', description: '', entityType: 'CUSTOMER', entityId: '' })
      setShowForm(false)
      fetchActivities()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Hata')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Aktiviteler</h1>
        <div className="flex items-center gap-2">
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="ml-2">
              {'+Aktiviteler'}
            </Button>
          )}
          <Input
            placeholder="Tür filtre (CALL, EMAIL, MEETING, TASK, NOTE)"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value.toUpperCase())}
            className="w-56"
          />
        </div>
      </div>

      {showForm && (
  <Card className="relative p-4">
          {/* Sağ üst köşede küçük ve şık çarpı */}
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors duration-150 focus:outline-none z-10"
            aria-label="Kapat"
            title="Kapat"
            style={{ lineHeight: 1, padding: 0 }}
          >
            <span className="text-base font-bold">×</span>
          </button>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Tür *</label>
                <select
                  className="w-40 min-h-8 py-1.5 px-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  required
                >
                  <option value="CALL">CALL</option>
                  <option value="EMAIL">EMAIL</option>
                  <option value="MEETING">MEETING</option>
                  <option value="TASK">TASK</option>
                  <option value="NOTE">NOTE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hedef Tipi *</label>
                <select
                  className="w-40 min-h-8 py-1.5 px-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  value={form.entityType}
                  onChange={e => setForm(f => ({ ...f, entityType: e.target.value as any, entityId: '' }))}
                  required
                >
                  <option value="LEAD">LEAD</option>
                  <option value="CONTACT">CONTACT</option>
                  <option value="ACCOUNT">ACCOUNT</option>
                  <option value="ORDER">ORDER</option>
                  <option value="OPPORTUNITY">OPPORTUNITY</option>
                </select>
                <p className="mt-1 text-[10px] text-gray-500">Lead / Contact / Account / Order / Opportunity</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hedef *</label>
                <select
                  className="w-40 min-h-8 py-1.5 px-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition mb-1"
                  value={form.entityId}
                  onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}
                  required
                  disabled={entityOptions.length === 0}
                >
                  <option value="">{form.entityType.charAt(0) + form.entityType.slice(1).toLowerCase()} seç...</option>
                  {entityOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {formError && <p className="text-[10px] text-red-600 mt-1">{formError}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Konu *</label>
                <Input className="w-full min-h-10 py-2 px-3 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Açıklama</label>
                <textarea
                  className="w-full min-h-[80px] py-2 px-3 text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-y"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Detay"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit">Kaydet</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>İptal</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-600">Yükleniyor...</div>
        ) : error ? (
          <div className="p-6 text-red-600">Hata: {error}</div>
        ) : !data || data.activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aktivite yok</div>
        ) : (
          <DataTable
            data={data.activities}
            columns={activityColumns}
            compact
            striped
            initialSort={{ key: 'createdAt', direction: 'desc' }}
          />
        )}
      </Card>
    </div>
  )
}

const activityColumns: DataTableColumn<Activity>[] = [
  { key: 'type', header: 'Tür', accessor: a => <span className="font-medium">{a.type}</span>, sortable: true, align: 'left' },
  { key: 'subject', header: 'Konu', accessor: a => <span>{a.subject}</span>, sortable: true, align: 'left' },
  { key: 'description', header: 'Açıklama', accessor: a => <span className="text-gray-600 max-w-[200px] truncate">{a.description || '-'}</span>, align: 'left' },
  { key: 'target', header: 'Hedef', accessor: a => <span>{a.targetEntityType}#{a.targetEntityId}</span>, align: 'left' },
  { key: 'createdAt', header: 'Oluşturma', accessor: a => <span>{new Date(a.createdAt).toLocaleString('tr-TR')}</span>, sortable: true, align: 'left' },
]
