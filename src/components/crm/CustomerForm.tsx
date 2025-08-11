'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CustomerFormData {
  name: string
  email: string
  phone: string
  address: string
  company: string
  taxNumber: string
}

interface CustomerFormProps {
  customer?: CustomerFormData & { id: string }
  onSave?: (customer: CustomerFormData) => void
  onCancel?: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    company: customer?.company || '',
    taxNumber: customer?.taxNumber || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const url = customer 
        ? `/api/crm/customers/${customer.id}`
        : '/api/crm/customers'
      
      const method = customer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Kayıt işlemi başarısız')
      
      const result = await response.json()
      if (result.success) {
        setSuccess(customer ? 'Müşteri güncellendi!' : 'Müşteri oluşturuldu!')
        if (onSave) {
          onSave(formData)
        }
        if (!customer) {
          // Yeni müşteri ekleme durumunda formu temizle
          setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            company: '',
            taxNumber: ''
          })
        }
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Hata mesajını temizle
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">
          {customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
        </h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İsim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            İsim *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Müşteri adı"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="ornek@email.com"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+90 555 123 4567"
          />
        </div>

        {/* Şirket */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Şirket
          </label>
          <Input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Şirket adı"
          />
        </div>

        {/* Vergi Numarası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vergi Numarası
          </label>
          <Input
            type="text"
            value={formData.taxNumber}
            onChange={(e) => handleChange('taxNumber', e.target.value)}
            placeholder="1234567890"
          />
        </div>

        {/* Adres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Müşteri adresi"
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Kaydediliyor...' : (customer ? 'Güncelle' : 'Kaydet')}
          </Button>
          
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              İptal
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
