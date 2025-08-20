'use client'
import React from "react";
import Navigation from '@/components/layout/Navigation';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface AccountingLayoutProps {
  children: React.ReactNode;
}

export default function AccountingLayout({ children }: AccountingLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const handleLogout = () => {
    window.location.href = '/login';
  };
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        {/* Sol Navigation Panel */}
        <div className="fixed left-0 top-0 h-full z-20 border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition-all duration-300">
          <Navigation collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        {/* Ana İçerik Alanı */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Header */}
          <header className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold heading-gradient">İşletme Yönetimi</h2>
                <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Sistem aktif
                  </span>
                </p>
              </div>
              {/* Header Sağ Kısım */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button className="relative p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] transition">
                  <span className="text-lg">🔔</span>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center shadow">3</span>
                </button>
                <button className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] transition">
                  <span className="text-lg">⚙️</span>
                </button>
                <button onClick={handleLogout} className="px-4 h-9 inline-flex items-center text-sm rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/15 border border-red-500/20">
                  Çıkış
                </button>
              </div>
            </div>
          </header>
          {/* Ana İçerik */}
          <main className="p-6 flex-1 bg-gradient-to-b from-[var(--color-background)] to-[var(--color-background-alt)]">
            <div className="max-w-7xl mx-auto space-y-6 fade-in">
              {children}
            </div>
          </main>
          {/* Footer */}
          <footer className="px-6 py-4 text-xs text-[var(--color-text-soft)] border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span>© {new Date().getFullYear()} Codifya ERP</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Online
              </span>
            </div>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
