'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function SecurityPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginHistory] = useState([
    { date: '2025-09-01 14:30', ip: '192.168.1.100', device: 'Windows Chrome', location: 'İstanbul, TR' },
    { date: '2025-08-31 09:15', ip: '192.168.1.100', device: 'Windows Chrome', location: 'İstanbul, TR' },
    { date: '2025-08-30 18:45', ip: '10.0.0.50', device: 'Mobile Safari', location: 'İstanbul, TR' },
  ])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor')
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookie'leri dahil et
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Şifreniz başarıyla değiştirildi')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setError(result.error || 'Şifre değiştirme sırasında hata oluştu')
      }
    } catch (err) {
      console.error('Password change error:', err)
      setError('Sunucu hatası oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    // Burada 2FA toggle API çağrısı yapılabilir
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Güvenlik Ayarları</h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Hesap güvenliğinizi yönetin ve şifrenizi değiştirin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Şifre Değiştirme */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Şifre Değiştir
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Mevcut Şifre
              </label>
              <Input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Mevcut şifrenizi girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Yeni Şifre
              </label>
              <Input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Yeni şifrenizi girin (min. 6 karakter)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Yeni Şifre (Tekrar)
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Yeni şifrenizi tekrar girin"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </Button>
          </form>
        </Card>

        {/* İki Faktörlü Doğrulama */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            İki Faktörlü Doğrulama
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--color-surface-alt)] rounded-lg">
              <div>
                <h3 className="font-medium text-[var(--color-text)]">2FA Durumu</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {twoFactorEnabled ? 'Aktif - Hesabınız korunuyor' : 'Pasif - Ek güvenlik için aktifleştirin'}
                </p>
              </div>
              <button
                onClick={toggleTwoFactor}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {twoFactorEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">QR Kod ile Kurulum</h4>
                <p className="text-sm text-green-700 mb-3">
                  Authenticator uygulamanız ile aşağıdaki QR kodu tarayın:
                </p>
                <div className="w-32 h-32 bg-white border rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Kod</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Oturum Geçmişi */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Son Oturum Açma İşlemleri
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 text-[var(--color-text-muted)]">Tarih</th>
                <th className="text-left py-2 text-[var(--color-text-muted)]">IP Adresi</th>
                <th className="text-left py-2 text-[var(--color-text-muted)]">Cihaz</th>
                <th className="text-left py-2 text-[var(--color-text-muted)]">Konum</th>
                <th className="text-left py-2 text-[var(--color-text-muted)]">Durum</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((login, index) => (
                <tr key={index} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-3 text-[var(--color-text)]">{login.date}</td>
                  <td className="py-3 text-[var(--color-text)] font-mono">{login.ip}</td>
                  <td className="py-3 text-[var(--color-text)]">{login.device}</td>
                  <td className="py-3 text-[var(--color-text)]">{login.location}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Başarılı
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Güvenlik Önerileri */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Güvenlik Önerileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-1">✅</span>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Güçlü Şifre Kullanın</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                En az 8 karakter, büyük/küçük harf, sayı ve özel karakter içeren şifreler tercih edin.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-green-500 mt-1">✅</span>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">2FA Aktifleştirin</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                İki faktörlü doğrulama ile hesabınızı ekstra güvenlik katmanı ile koruyun.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-yellow-500 mt-1">⚠️</span>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Düzenli Şifre Değişimi</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Güvenliğiniz için şifrenizi 3-6 ayda bir değiştirmenizi öneririz.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-blue-500 mt-1">ℹ️</span>
            <div>
              <h3 className="font-medium text-[var(--color-text)]">Oturum Takibi</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Tanımadığınız oturum açma işlemlerini düzenli kontrol edin.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
