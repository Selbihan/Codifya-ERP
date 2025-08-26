
'use client';
'use client';
import { ConvertLeadForm } from './ConvertLeadForm';

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'

interface Lead {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  source: string
  status: string
  createdAt: string
  ownerUserId: number
}

interface LeadListData {
  leads: Lead[]
  total: number
}

export function LeadList() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [data, setData] = useState<LeadListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'WEB' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [search])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/crm/leads?${params}`)
      if (!response.ok) throw new Error('Lead listesi yüklenemedi')
      
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="info">Yeni</Badge>
      case 'QUALIFIED':
        return <Badge variant="success">Nitelikli</Badge>
      case 'DISQUALIFIED':
        return <Badge variant="error">Elendi</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'WEB':
        return <Badge variant="info">Web</Badge>
      case 'EVENT':
        return <Badge variant="warning">Etkinlik</Badge>
      case 'REFERRAL':
        return <Badge variant="success">Referans</Badge>
      case 'OTHER':
        return <Badge variant="default">Diğer</Badge>
      default:
        return <Badge variant="default">{source}</Badge>
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Hata: {error}</div>
        <Button onClick={fetchLeads} className="mt-4">Tekrar Dene</Button>
      </Card>
    )
  }

  const leadColumns: DataTableColumn<Lead>[] = [
  { key: 'name', header: 'İsim', sortable: true, align: 'left' },
  { key: 'email', header: 'Email', accessor: l => l.email || '-', align: 'left' },
  { key: 'phone', header: 'Telefon', accessor: l => l.phone || '-', align: 'left' },
  { key: 'source', header: 'Kaynak', accessor: l => getSourceBadge(l.source), align: 'left' },
  { key: 'status', header: 'Durum', accessor: l => getStatusBadge(l.status), align: 'left' },
  { key: 'createdAt', header: 'Kayıt Tarihi', sortable: true, accessor: l => new Date(l.createdAt).toLocaleDateString('tr-TR'), align: 'left' },
  { key: 'actions', header: 'İşlemler', accessor: l => (
      <div className="flex gap-1 items-center">
        <Button size="sm" variant="ghost" onClick={() => { setSelectedLead(l); setShowDetailModal(true); }}>Görüntüle</Button>
        <Button size="sm" variant="ghost" onClick={() => { setSelectedLead(l); setShowConvertModal(true); }}>Dönüştür</Button>
      </div>
    ) }
  ]

  return (
    <div className="space-y-6">
      {/* Lead Detay Modalı */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-2 right-2 text-xl text-gray-400 hover:text-red-500">×</button>
            <h3 className="text-lg font-bold mb-4">Lead Detayı</h3>
            <div className="space-y-2">
              <div><b>İsim:</b> {selectedLead.name}</div>
              <div><b>Email:</b> {selectedLead.email || '-'}</div>
              <div><b>Telefon:</b> {selectedLead.phone || '-'}</div>
              <div><b>Kaynak:</b> {getSourceBadge(selectedLead.source)}</div>
              <div><b>Durum:</b> {getStatusBadge(selectedLead.status)}</div>
              <div><b>Kayıt Tarihi:</b> {new Date(selectedLead.createdAt).toLocaleString('tr-TR')}</div>
              <div><b>Sahip Kullanıcı ID:</b> {selectedLead.ownerUserId}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Dönüştür Modalı */}
      {showConvertModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setShowConvertModal(false)} className="absolute top-2 right-2 text-xl text-gray-400 hover:text-red-500">×</button>
            <h3 className="text-lg font-bold mb-4">Lead Dönüştür</h3>
            <div className="mb-4">Lütfen dönüştürmek istediğiniz tipi seçin:</div>
            <ConvertLeadForm leadId={selectedLead.id} onClose={() => setShowConvertModal(false)} />
          </div>
        </div>
      )}
      {/* Başlık ve Arama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Potansiyel Müşteriler (Leads)</h2>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Lead ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit">Ara</Button>
          </form>
          <Button type="button" onClick={() => setShowNewForm(s => !s)}>
            {showNewForm ? 'Kapat' : '+ Yeni Lead'}
          </Button>
        </div>
      </div>

      {showNewForm && (
        <Card className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setCreating(true)
              try {
                const res = await fetch('/api/crm/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newLead)
                })
                const json = await res.json()
                if (!res.ok || !json.success) throw new Error(json.message || 'Kayıt hatası')
                setNewLead({ name: '', email: '', phone: '', source: 'WEB' })
                setShowNewForm(false)
                fetchLeads()
              } catch (err) {
                alert(err instanceof Error ? err.message : 'Hata')
              } finally {
                setCreating(false)
              }
            }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[120px]"
            style={{ minHeight: 120 }}
          >
            <div>
              <label className="block text-xs font-medium mb-1">İsim *</label>
              <Input required value={newLead.name} onChange={e => setNewLead(l => ({ ...l, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Email *</label>
              <Input required type="email" value={newLead.email} onChange={e => setNewLead(l => ({ ...l, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Telefon</label>
              <Input value={newLead.phone} onChange={e => setNewLead(l => ({ ...l, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Kaynak</label>
              <div className="min-w-full">
                <Select
                  value={newLead.source}
                  onChange={(val) => setNewLead(l => ({ ...l, source: val }))}
                >
                  <SelectTrigger className="min-w-full block">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB">WEB</SelectItem>
                    <SelectItem value="EVENT">EVENT</SelectItem>
                    <SelectItem value="REFERRAL">REFERRAL</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="md:col-span-4 flex gap-2 pt-2">
              <Button type="submit" disabled={creating}>{creating ? 'Kaydediliyor...' : 'Kaydet'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowNewForm(false)}>İptal</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lead Tablosu */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : !data || data.leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Lead bulunamadı</p>
            {search && (
              <Button 
                variant="ghost" 
                onClick={() => setSearch('')}
                className="mt-2"
              >
                Filtreyi Temizle
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            data={data.leads}
            columns={leadColumns}
            striped
            compact
            initialSort={{ key: 'createdAt', direction: 'desc' }}
          />
        )}
      </Card>

      {/* İstatistikler */}
      {data && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Toplam {data.total} lead görüntüleniyor
          </span>
        </div>
  )}
    </div>
  )
}
