'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table } from '@/components/ui/table'
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

  useEffect(() => {
    fetchCustomers()
  }, [search, currentPage])

  const fetchCustomers = async () => {
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
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCustomers()
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
            <Table>
              <thead>
                <tr>
                  <th>İsim</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Şirket</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="font-medium">{customer.name}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.company || '-'}</td>
                    <td>
                      <Badge variant={customer.isActive ? 'success' : 'error'}>
                        {customer.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td>
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">Görüntüle</Button>
                        <Button size="sm" variant="ghost">Düzenle</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={data.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>

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
