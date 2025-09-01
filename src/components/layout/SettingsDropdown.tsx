'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { useRouter } from 'next/navigation'

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const menuItems = [
    {
      icon: '👤',
      label: 'Profil Ayarları',
      href: '/profile',
      description: 'Kişisel bilgilerinizi düzenleyin'
    },
    {
      icon: '🔐',
      label: 'Güvenlik',
      href: '/security',
      description: 'Şifre ve güvenlik ayarları'
    },
    {
      icon: '🔔',
      label: 'Bildirim Tercihleri',
      href: '/notifications-settings',
      description: 'Hangi bildirimleri almak istediğinizi seçin'
    },
    {
      icon: '🎨',
      label: 'Görünüm',
      href: '/appearance',
      description: 'Tema ve arayüz özelleştirmeleri'
    },
    {
      icon: '🌐',
      label: 'Dil & Bölge',
      href: '/language',
      description: 'Dil ve zaman dilimi ayarları'
    },
    {
      icon: '💾',
      label: 'Yedekleme',
      href: '/backup',
      description: 'Veri yedekleme ve geri yükleme'
    },
    {
      icon: '📊',
      label: 'Raporlama',
      href: '/report-settings',
      description: 'Rapor formatları ve ayarları'
    },
    {
      icon: '🔧',
      label: 'Sistem Ayarları',
      href: '/system-settings',
      description: 'Genel sistem konfigürasyonu',
      adminOnly: true
    }
  ]

  const handleItemClick = (href: string) => {
    setIsOpen(false)
    
    // Gerçek sayfalara yönlendirme
    if (href === '/profile') {
      router.push('/profile')
    } else if (href === '/security') {
      router.push('/security')
    } else if (href === '/notifications-settings') {
      router.push('/notifications-settings')
    } else if (href === '/appearance') {
      router.push('/appearance')
    } else if (href === '/language') {
      console.log('Dil ve bölge ayarları sayfasına yönlendiriliyor...')
      alert(`${href} sayfası henüz geliştirilmemiş. Yakında eklenecek!`)
    } else if (href === '/backup') {
      console.log('Yedekleme sayfasına yönlendiriliyor...')
      alert(`${href} sayfası henüz geliştirilmemiş. Yakında eklenecek!`)
    } else if (href === '/report-settings') {
      console.log('Raporlama ayarları sayfasına yönlendiriliyor...')
      alert(`${href} sayfası henüz geliştirilmemiş. Yakında eklenecek!`)
    } else if (href === '/system-settings') {
      console.log('Sistem ayarları sayfasına yönlendiriliyor...')
      alert(`${href} sayfası henüz geliştirilmemiş. Yakında eklenecek!`)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] transition"
      >
        <span className="text-lg">⚙️</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)]">Ayarlar</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Sistem tercihlerinizi yönetin
            </p>
          </div>

          {/* Settings Menu */}
          <div className="max-h-80 overflow-y-auto">
            {menuItems.map((item, index) => {
              // Admin özelliklerini sadece admin kullanıcılara göster
              if (item.adminOnly && user?.role !== UserRole.ADMIN) {
                return null
              }

              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item.href)}
                  className="w-full p-4 text-left hover:bg-[var(--color-surface-alt)] transition border-b border-[var(--color-border)] last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-[var(--color-surface-alt)] rounded-lg flex items-center justify-center text-sm">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-[var(--color-text)]">
                        {item.label}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[var(--color-text-soft)] text-xs mt-1">
                      →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">
                Versiyon 1.0.0
              </span>
              <button className="text-xs text-[var(--color-primary)] hover:underline">
                Hakkında
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
