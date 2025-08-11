'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// ThemeToggle kaldırıldı

interface NavItem {
  name: string
  href: string
  icon?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊'
  },
  {
    name: 'Müşteri', // Sadece görünen ad değişti, rota yapısı crm olarak kaldı
    href: '/crm',
    icon: '👥',
    children: [
      { name: 'Müşteriler', href: '/crm/customers' },
      { name: 'Leads', href: '/crm/leads' },
      { name: 'Aktiviteler', href: '/crm/activities' }
    ]
  },
  {
    name: 'Envanter',
    href: '/inventory',
    icon: '📦',
    children: [
      { name: 'Ürünler', href: '/inventory/products' },
      { name: 'Kategoriler', href: '/inventory/categories' },
      { name: 'Stok Hareketleri', href: '/inventory/movements' }
    ]
  },
  {
    name: 'Siparişler',
    href: '/orders',
    icon: '🛒',
    children: [
      { name: 'Tüm Siparişler', href: '/orders' },
      { name: 'Bekleyen', href: '/orders/pending' },
      { name: 'Tamamlanan', href: '/orders/completed' }
    ]
  },
  {
    name: 'Muhasebe',
    href: '/accounting',
    icon: '💰',
    children: [
      { name: 'Faturalar', href: '/accounting/invoices' },
      { name: 'Ödemeler', href: '/accounting/payments' },
      { name: 'Raporlar', href: '/accounting/reports' }
    ]
  }
]

export default function Navigation() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState(false)
  // Tema düğmesi kaldırıldığı için useTheme kullanımını da kaldırdık

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isExpanded = (itemName: string) => {
    return expandedItems.includes(itemName) || navigationItems.some(item => 
      item.name === itemName && item.children?.some(child => pathname.startsWith(child.href))
    )
  }

  return (
    <nav
      className={`relative group h-full min-h-screen transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } border-r bg-[var(--color-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/90 border-[var(--color-border)]`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(c => !c)}
  className="absolute -right-3 top-6 z-10 w-7 h-7 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex items-center justify-center text-xs transition-none"
        aria-label="Menüyü küçült"
      >
        {collapsed ? '»' : '«'}
      </button>

      <div className="p-4 flex flex-col h-full overflow-y-auto">
        {/* Logo & Brand */}
        <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center font-bold text-white shadow-md">E</div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-[var(--color-text)]">Codifya ERP</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-soft)]">Yönetim Paneli</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Ara..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        )}
        {/* Navigation Items */}
        <div className="flex-1 space-y-2">
          {navigationItems.map(item => {
            const active = isActive(item.href)
            const expanded = isExpanded(item.name)
            return (
              <div key={item.name} className="group/item">
                <div
                  onClick={() => item.children ? toggleExpanded(item.name) : null}
                  className={`relative flex items-center w-full cursor-pointer rounded-none overflow-hidden select-none ${collapsed ? 'justify-center p-3' : 'px-3 py-2'} ${
                    active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'
                  } transition-none`}
                >
                  {/* Accent Bar */}
                  {active && item.name !== 'Müşteri' && (
                    <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]" />
                  )}
                  <Link href={item.href} className={`flex items-center ${collapsed ? '' : 'gap-3'} flex-1 min-w-0`}>
                    <span className="text-lg leading-none select-none">{item.icon}</span>
                    {!collapsed && (
                      <span className={`truncate text-sm ${active ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                  {item.children && !collapsed && (
                    <button
                      aria-label="Alt menü"
                      className={`ml-2 text-[11px] transition-transform ${expanded ? 'rotate-90' : ''}`}
                    >▶</button>
                  )}
                </div>
                {/* Children */}
                {item.children && expanded && (
                  <div className={`mt-2 space-y-0 ${collapsed ? 'hidden' : 'pl-4'}`}>
                    {item.children.map(child => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center text-[12px] px-3 py-2 rounded-none select-none leading-snug ${
                            childActive
                              ? 'text-[var(--color-text)] font-semibold'
                              : 'text-[var(--color-text-muted)] opacity-100'
                          } transition-none`}
                        >
                          <span className="truncate w-full">{child.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* User Card */}
        <div className={`mt-4 pt-4 border-t border-[var(--color-border)] ${collapsed ? 'px-0' : 'px-1'}`}>
          <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'items-center gap-3'} p-3 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)] shadow-inner`}> 
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">U</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--color-surface-alt)]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[var(--color-text)] truncate">Kullanıcı Adı</span>
                <span className="text-[10px] tracking-wide uppercase text-[var(--color-text-soft)]">Yönetici</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
