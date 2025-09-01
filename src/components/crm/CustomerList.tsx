'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { CustomerForm } from './CustomerForm'
import { Pagination } from '@/components/ui/pagination'

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  isActive: boolean
  createdAt: string
}

interface CustomerListData {
  customers: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function CustomerList() {
  const [data, setData] = useState<CustomerListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      if (search) {
        params.append('search', search)
      }
      const response = await fetch(`/api/crm/customers?${params}`)
      if (!response.ok) throw new Error('Müşteri listesi yüklenemedi')
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
  }, [search, currentPage])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCustomers()
  }

  function getCustomerColumns(setSelectedCustomer: any, setModalMode: any): DataTableColumn<Customer>[] {
    return [
      { key: 'name', header: 'İsim', sortable: true, align: 'left' },
      { key: 'email', header: 'Email', accessor: c => c.email || '-', align: 'left' },
      { key: 'phone', header: 'Telefon', accessor: c => c.phone || '-', align: 'left' },
      { key: 'company', header: 'Şirket', accessor: c => c.company || '-', align: 'left' },
      { key: 'isActive', header: 'Durum', accessor: c => (
          <Badge variant={c.isActive ? 'success' : 'error'}>{c.isActive ? 'Aktif' : 'Pasif'}</Badge>
        ), align: 'left' },
      { key: 'createdAt', header: 'Kayıt Tarihi', sortable: true, accessor: c => new Date(c.createdAt).toLocaleDateString('tr-TR'), align: 'left' },
      { key: 'actions', header: 'İşlemler', accessor: c => (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => { setSelectedCustomer(c); setModalMode('view'); }}>Görüntüle</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelectedCustomer(c); setModalMode('edit'); }}>Düzenle</Button>
          </div>
        ), align: 'left' }
    ]
  }

  // Customer'ı CustomerFormData'ya dönüştür
  function toCustomerFormData(customer: Customer) {
    return {
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: '', // Eksikse boş bırak
      company: customer.company || '',
      taxNumber: '', // Eksikse boş bırak
      id: customer.id
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">Hata: {error}</div>
        <Button onClick={fetchCustomers} className="mt-4">Tekrar Dene</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Arama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Müşteriler</h2>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Müşteri ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit">Ara</Button>
          </form>
          <Button type="button" onClick={() => setShowNewForm(s => !s)}>
            {showNewForm ? 'Kapat' : '+ Yeni Müşteri'}
          </Button>
        </div>
      </div>

      {showNewForm && (
        <Card className="p-4">
          <CustomerForm onSave={() => { setShowNewForm(false); fetchCustomers(); }} onCancel={() => setShowNewForm(false)} />
        </Card>
      )}

      {/* Müşteri Tablosu */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yükleniyor...</p>
          </div>
        ) : !data || data.customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Müşteri bulunamadı</p>
            {search && (
              <Button 
                variant="ghost" 
                onClick={() => { setSearch(''); setCurrentPage(1) }}
                className="mt-2"
              >
                Filtreyi Temizle
              </Button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              data={data.customers}
              columns={getCustomerColumns(setSelectedCustomer, setModalMode)}
              striped
              compact
              initialSort={{ key: 'createdAt', direction: 'desc' }}
              pagination={{
                page: currentPage,
                pageSize: 10,
                total: data.total,
                onPageChange: (p) => setCurrentPage(p)
              }}
            />
          </>
        )}
      </Card>

      {/* Modal */}
      {selectedCustomer && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => { setSelectedCustomer(null); setModalMode(null); }}
            >×</button>
            {modalMode === 'view' ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Müşteri Bilgileri</h2>
                <div className="space-y-2">
                  <div><b>İsim:</b> {selectedCustomer.name}</div>
                  <div><b>Email:</b> {selectedCustomer.email || '-'}</div>
                  <div><b>Telefon:</b> {selectedCustomer.phone || '-'}</div>
                  <div><b>Şirket:</b> {selectedCustomer.company || '-'}</div>
                  <div><b>Durum:</b> {selectedCustomer.isActive ? 'Aktif' : 'Pasif'}</div>
                  <div><b>Kayıt Tarihi:</b> {new Date(selectedCustomer.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            ) : (
              <CustomerForm customer={toCustomerFormData(selectedCustomer)} onSave={() => { setSelectedCustomer(null); setModalMode(null); fetchCustomers(); }} onCancel={() => { setSelectedCustomer(null); setModalMode(null); }} />
            )}
          </div>
        </div>
      )}

      {/* İstatistikler */}
      {data && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Toplam {data.total} müşteriden {data.customers.length} tanesi görüntüleniyor
          </span>
          <span>
            Sayfa {data.page} / {data.totalPages}
          </span>
        </div>
      )}
    </div>
  )
}
