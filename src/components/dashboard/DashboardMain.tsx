// Dashboard Ana Bileşeni
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardMain() {
  return (
    <div className="space-y-6">
      {/* Genel Bakış Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">1,234</p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="success" className="text-green-600 bg-green-100">
              +12% bu ay
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Aktif Leads</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">89</p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-white">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="warning" className="text-yellow-600 bg-yellow-100">
              +5 yeni
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Bu Ay Satış</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">₺45,230</p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="success" className="text-green-600 bg-green-100">
              +18% artış
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Bekleyen Siparişler</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">23</p>
            </div>
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 text-white">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="warning" className="text-orange-600 bg-orange-100">
              İşlem bekliyor
            </Badge>
          </div>
        </Card>
      </div>

      {/* Son Aktiviteler ve Hızlı Aksiyonlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Aktiviteler */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium shadow-inner">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Yeni müşteri eklendi: Ahmet Yılmaz
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">2 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-medium">
                🎯
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Lead müşteriye dönüştürüldü
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">4 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-500 text-white text-sm font-medium">
                📞
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Müşteri görüşmesi planlandı
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">6 saat önce</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Hızlı Aksiyonlar */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Hızlı Aksiyonlar</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="group p-4 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-surface-alt)] transition-colors text-left relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent transition" />
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                👤
              </div>
              <p className="font-medium text-[var(--color-text)]">Yeni Müşteri</p>
              <p className="text-xs text-[var(--color-text-muted)]">Müşteri ekle</p>
            </button>

            <button className="group p-4 border border-[var(--color-border)] rounded-xl hover:border-emerald-500/60 hover:bg-[var(--color-surface-alt)] transition-colors text-left relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-emerald-500/10 to-transparent transition" />
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                🎯
              </div>
              <p className="font-medium text-[var(--color-text)]">Yeni Lead</p>
              <p className="text-xs text-[var(--color-text-muted)]">Lead oluştur</p>
            </button>

            <button className="group p-4 border border-[var(--color-border)] rounded-xl hover:border-purple-500/60 hover:bg-[var(--color-surface-alt)] transition-colors text-left relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-purple-500/10 to-transparent transition" />
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                📦
              </div>
              <p className="font-medium text-[var(--color-text)]">Yeni Sipariş</p>
              <p className="text-xs text-[var(--color-text-muted)]">Sipariş oluştur</p>
            </button>

            <button className="group p-4 border border-[var(--color-border)] rounded-xl hover:border-orange-500/60 hover:bg-[var(--color-surface-alt)] transition-colors text-left relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-orange-500/10 to-transparent transition" />
              <div className="h-8 w-8 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                📊
              </div>
              <p className="font-medium text-[var(--color-text)]">Raporlar</p>
              <p className="text-xs text-[var(--color-text-muted)]">Analitik görünüm</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Sistem Durumu */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">Sistem Durumu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[var(--color-text-muted)]">Database: Çalışıyor</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[var(--color-text-muted)]">API: Çalışıyor</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-[var(--color-text-muted)]">Email: Yavaş</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
