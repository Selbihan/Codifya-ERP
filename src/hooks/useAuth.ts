// Auth Hook - Authentication işlemleri için custom hook
// AuthContext'i kullanarak auth işlemlerini kolaylaştırır

'use client'

import { useAuthContext } from '@/context/AuthContext'
import { UserInfo, AuthContextType } from '@/types/auth'

// Ana auth hook
export function useAuth(): AuthContextType {
  return useAuthContext()
}

// Sadece kullanıcı bilgilerini döndüren hook
export function useUser(): UserInfo | null {
  const { user } = useAuthContext()
  return user
}

// Sadece auth durumunu döndüren hook
export function useAuthStatus(): {
  isAuthenticated: boolean
  isLoading: boolean
} {
  const { isAuthenticated, isLoading } = useAuthContext()
  return { isAuthenticated, isLoading }
}

// Login işlemi için hook
export function useLogin() {
  const { login, isLoading } = useAuthContext()
  
  return {
    login,
    isLoading
  }
}

// Register işlemi için hook
export function useRegister() {
  const { register, isLoading } = useAuthContext()
  
  return {
    register,
    isLoading
  }
}

// Logout işlemi için hook
export function useLogout() {
  const { logout, isLoading } = useAuthContext()
  
  return {
    logout,
    isLoading
  }
}

// Şifre değiştirme için hook
export function useChangePassword() {
  const { changePassword, isLoading } = useAuthContext()
  
  return {
    changePassword,
    isLoading
  }
}

// Kullanıcı rolü kontrolü için hook
export function useUserRole(): string | null {
  const { user } = useAuthContext()
  return user?.role || null
}

// Admin kontrolü için hook
export function useIsAdmin(): boolean {
  const { user } = useAuthContext()
  return user?.role === 'ADMIN'
}

// Manager veya Admin kontrolü için hook
export function useIsManagerOrAdmin(): boolean {
  const { user } = useAuthContext()
  return user?.role === 'ADMIN' || user?.role === 'MANAGER'
}

// Protected route kontrolü için hook
export function useAuthGuard(): {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
} {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  
  return {
    isAuthenticated,
    isLoading,
    user
  }
}

// Default export - en çok kullanılan hook
export default useAuth
