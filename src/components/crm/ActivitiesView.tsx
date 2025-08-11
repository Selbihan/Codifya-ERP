'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table } from '@/components/ui/table'

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
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const fetchActivities = async () => {
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
  }

  useEffect(() => { fetchActivities() }, [typeFilter])

  // URL'den leadId geldiyse formu otomatik aç ve doldur
  useEffect(() => {
    const leadId = searchParams?.get('leadId')
    if (leadId) {
      setShowForm(true)
      setForm(f => ({ ...f, entityType: 'LEAD', entityId: leadId }))
    }
  }, [searchParams])

  useEffect(() => {
    // Sadece form açıldığında leadleri çek
    if (!showForm) return
    ;(async () => {
      try {
        const res = await fetch('/api/crm/leads')
        if (!res.ok) return
        const json = await res.json()
        if (json.success) {
          const mapped = (json.data.leads as any[]).map(l => ({ id: l.id, name: l.name }))
          setLeads(mapped)
        }
      } catch {}
    })()
  }, [showForm])

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
        <div>
          <h1 className="text-2xl font-bold">Aktiviteler</h1>
          <p className="text-gray-600 text-sm">Görüşmeler, notlar ve görevler</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tür filtre (CALL, EMAIL, MEETING, TASK, NOTE)"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value.toUpperCase())}
            className="w-56"
          />
          <Button onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Kapat' : '+ Aktivite'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Tür *</label>
                <select
                  className="form-field w-full select"
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
                  className="form-field w-full select"
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
                <label className="block text-xs font-medium mb-1">Hedef ID *</label>
                {form.entityType === 'LEAD' && leads.length > 0 && (
                  <select
                    className="form-field w-full mb-1"
                    value={form.entityId}
                    onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}
                  >
                    <option value="">Lead seç...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                )}
                <Input className="form-field" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))} placeholder="ID (liste yoksa manuel)" />
                <p className="mt-1 text-[10px] text-gray-500">Listeden seç ya da ilgili kaydın id değerini gir</p>
                {formError && <p className="text-[10px] text-red-600 mt-1">{formError}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Konu *</label>
                <Input className="form-field" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Açıklama</label>
                <textarea
                  className="form-field w-full text-sm"
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
          <Table>
            <thead>
              <tr>
                <th>Tür</th>
                <th>Konu</th>
                <th>Açıklama</th>
                <th>Hedef</th>
                <th>Oluşturma</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map(a => (
                <tr key={a.id}>
                  <td className="font-medium text-xs">{a.type}</td>
                  <td className="text-sm">{a.subject}</td>
                  <td className="text-xs text-gray-600 max-w-xs truncate">{a.description || '-'}</td>
                  <td className="text-xs">{a.targetEntityType}#{a.targetEntityId}</td>
                  <td className="text-xs">{new Date(a.createdAt).toLocaleString('tr-TR')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
