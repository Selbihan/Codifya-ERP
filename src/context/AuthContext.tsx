// Authentication Context - Kullanıcı kimlik doğrulama durumunu yönetir
// Tüm uygulama boyunca auth state'ini sağlar

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserInfo, AuthContextType } from '@/types/auth'

// Auth Context'i oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Sayfa yüklendiğinde mevcut kullanıcıyı kontrol et
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Auth durumunu kontrol et
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      
      // Profile endpoint'ini çağır (cookie'deki token ile)
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include', // Cookie'leri dahil et
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth status check error:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Login işlemi
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return { success: false, message: data.message || 'Giriş başarısız' }
      }
    } catch (error) {
      console.error('Login error:', error)
      setUser(null)
      setIsAuthenticated(false)
      return { success: false, message: 'Giriş işlemi sırasında bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  // Register işlemi
  const register = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
    role?: string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        return { success: true, message: data.message }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return { 
          success: false, 
          message: data.message || data.details?.join(', ') || 'Kayıt başarısız' 
        }
      }
    } catch (error) {
      console.error('Register error:', error)
      setUser(null)
      setIsAuthenticated(false)
      return { success: false, message: 'Kayıt işlemi sırasında bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout işlemi
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Her durumda kullanıcıyı çıkış yap
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  // Şifre değiştirme işlemi
  const changePassword = async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, message: data.message }
      } else {
        return { 
          success: false, 
          message: data.message || data.details?.join(', ') || 'Şifre değiştirme başarısız' 
        }
      }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: 'Şifre değiştirme işlemi sırasında bir hata oluştu' }
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Auth Context'i kullanmak için hook
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Default export
export default AuthContext
