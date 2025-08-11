'use client'
import React from 'react'
import { useTheme } from './ThemeProvider'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Tema Değiştir"
      className={`relative inline-flex items-center h-9 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-medium shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <span className="mr-2 text-[13px] tracking-wide text-[var(--color-text-muted)]">{theme === 'light' ? 'Açık' : 'Koyu'} Tema</span>
      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-xs">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
