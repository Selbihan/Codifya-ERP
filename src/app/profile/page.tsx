'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    department: '',
    language: 'tr'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        department: user.department || '',
        language: user.language || 'tr'
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Profil bilgileriniz başarıyla güncellendi')
      } else {
        setError(result.message || 'Güncelleme sırasında hata oluştu')
      }
    } catch (err) {
      setError('Sunucu hatası oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Profil Ayarları</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin
        </p>
      </div>

      {/* Profil Kartı */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">{user?.name}</h2>
            <p className="text-[var(--color-text-muted)]">{user?.role}</p>
            <p className="text-[var(--color-text-soft)] text-sm">Kullanıcı ID: {user?.id}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Ad Soyad
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ad ve soyadınızı girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Kullanıcı Adı
              </label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Kullanıcı adınız"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                E-posta
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-posta adresiniz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Departman
              </label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Çalıştığınız departman"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Dil Tercihi
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text)]"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              İptal
            </Button>
          </div>
        </form>
      </Card>

      {/* Hesap Bilgileri */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Hesap Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--color-text-muted)]">Kullanıcı ID:</span>
            <span className="ml-2 text-[var(--color-text)]">{user?.id}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Kullanıcı Kodu:</span>
            <span className="ml-2 text-[var(--color-text)]">{user?.code}</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Hesap Durumu:</span>
            <span className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-700">
              Aktif
            </span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Dil Tercihi:</span>
            <span className="ml-2 text-[var(--color-text)]">
              {user?.language === 'en' ? 'English' : 'Türkçe'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
