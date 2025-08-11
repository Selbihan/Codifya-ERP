'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggle: () => void
  setTheme: (t: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(
    (typeof window !== 'undefined' && (localStorage.getItem('erp_theme') as 'light' | 'dark')) || 'light'
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('erp_theme', theme)
  }, [theme])

  const setTheme = (t: 'light' | 'dark') => setThemeState(t)
  const toggle = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
