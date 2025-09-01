'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

export default function NotificationSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'orders',
      title: 'Sipariş Bildirimleri',
      description: 'Yeni siparişler, sipariş durumu değişiklikleri',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'payments',
      title: 'Ödeme Bildirimleri',
      description: 'Ödeme alındı, ödeme hatası, ödeme beklemede',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'inventory',
      title: 'Stok Bildirimleri',
      description: 'Düşük stok uyarısı, stok bitimi, stok girişi',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'customers',
      title: 'Müşteri Bildirimleri',
      description: 'Yeni müşteri kaydı, müşteri aktiviteleri',
      email: false,
      push: true,
      sms: false
    },
    {
      id: 'reports',
      title: 'Rapor Bildirimleri',
      description: 'Günlük/haftalık raporlar, özel rapor hazır',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'system',
      title: 'Sistem Bildirimleri',
      description: 'Sistem bakımı, güvenlik uyarıları, güncellemeler',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'marketing',
      title: 'Pazarlama Bildirimleri',
      description: 'Kampanyalar, duyurular, özel teklifler',
      email: false,
      push: false,
      sms: false
    }
  ])

  const handleToggle = (id: string, type: 'email' | 'push' | 'sms') => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, [type]: !setting[type] }
        : setting
    ))
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess('')

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Bildirim tercihleriniz başarıyla kaydedildi')
      }
    } catch (err) {
      console.error('Settings save error:', err)
    } finally {
      setLoading(false)
    }
  }

  const enableAll = () => {
    setSettings(prev => prev.map(setting => ({
      ...setting,
      email: true,
      push: true,
      sms: false // SMS'i varsayılan olarak kapalı bırak
    })))
  }

  const disableAll = () => {
    setSettings(prev => prev.map(setting => ({
      ...setting,
      email: false,
      push: false,
      sms: false
    })))
  }

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Bildirim Tercihleri</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Hangi bildirimleri almak istediğinizi ve nasıl almak istediğinizi belirleyin
        </p>
      </div>

      {/* Hızlı Eylemler */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-[var(--color-text)]">Hızlı Ayarlar</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Tüm bildirimleri hızlıca yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={enableAll}>
              Tümünü Aç
            </Button>
            <Button variant="secondary" size="sm" onClick={disableAll}>
              Tümünü Kapat
            </Button>
          </div>
        </div>
      </Card>

      {/* Bildirim Ayarları */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-[var(--color-border)]">
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Bildirim Türü</h3>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-[var(--color-text)] mb-1">📧 E-posta</h4>
              <p className="text-xs text-[var(--color-text-muted)]">E-posta adresinize</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-[var(--color-text)] mb-1">🔔 Push</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Tarayıcı bildirimi</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-[var(--color-text)] mb-1">📱 SMS</h4>
              <p className="text-xs text-[var(--color-text-muted)]">Telefon numaranıza</p>
            </div>
          </div>

          {settings.map((setting) => (
            <div key={setting.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-4 border-b border-[var(--color-border)] last:border-0">
              <div>
                <h4 className="font-medium text-[var(--color-text)]">{setting.title}</h4>
                <p className="text-sm text-[var(--color-text-muted)]">{setting.description}</p>
              </div>
              
              <div className="flex justify-center">
                <ToggleSwitch 
                  enabled={setting.email} 
                  onChange={() => handleToggle(setting.id, 'email')} 
                />
              </div>
              
              <div className="flex justify-center">
                <ToggleSwitch 
                  enabled={setting.push} 
                  onChange={() => handleToggle(setting.id, 'push')} 
                />
              </div>
              
              <div className="flex justify-center">
                <ToggleSwitch 
                  enabled={setting.sms} 
                  onChange={() => handleToggle(setting.id, 'sms')} 
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bildirim Zamanlaması */}
      <Card className="p-6">
        <h3 className="font-medium text-[var(--color-text)] mb-4">Bildirim Zamanlaması</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Sessiz Saatler
            </label>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Bu saatlerde push bildirimi almayacaksınız
            </p>
            <div className="flex gap-2 items-center">
              <select className="px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text)]">
                <option value="22">22:00</option>
                <option value="23">23:00</option>
                <option value="00">00:00</option>
              </select>
              <span className="text-[var(--color-text-muted)]">-</span>
              <select className="px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text)]">
                <option value="07">07:00</option>
                <option value="08">08:00</option>
                <option value="09">09:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Günlük Özet E-postası
            </label>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Günlük aktivite özetini ne zaman almak istiyorsunuz?
            </p>
            <select className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)] text-[var(--color-text)]">
              <option value="disabled">Gönderme</option>
              <option value="09">09:00</option>
              <option value="18">18:00</option>
              <option value="20">20:00</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Kaydet */}
      <div className="flex gap-3">
        {success && (
          <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </div>
  )
}
