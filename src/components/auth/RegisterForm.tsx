// RegisterForm Component - Kayıt formu component'i
// AuthContext kullanarak kayıt işlemi yapar

'use client'

import React, { useState } from 'react'
import { useRegister } from '@/hooks/useAuth'

interface RegisterFormProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
  className?: string
  showLoginLink?: boolean
  onLoginClick?: () => void
  allowRoleSelection?: boolean // Admin panelinde kullanım için
}

export default function RegisterForm({ 
  onSuccess, 
  onError, 
  className = '',
  showLoginLink = false,
  onLoginClick,
  allowRoleSelection = false
}: RegisterFormProps) {
  const { register, isLoading } = useRegister()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    role: 'USER'
  })
  const [localError, setLocalError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form input değişiklikleri
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Hata mesajını temizle
    setLocalError(null)
  }

  // Email format kontrolü
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Şifre güvenlik kontrolü
  const isValidPassword = (password: string): boolean => {
    // En az 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Username format kontrolü
  const isValidUsername = (username: string): boolean => {
    // En az 5 karakter, sadece harf, rakam ve _
    const usernameRegex = /^[a-zA-Z0-9_]{5,}$/
    return usernameRegex.test(username)
  }

  // Form validasyonu
  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) {
      return 'Ad zorunludur'
    }
    if (formData.firstName.length < 2) {
      return 'Ad en az 2 karakter olmalıdır'
    }
    if (!formData.lastName.trim()) {
      return 'Soyad zorunludur'
    }
    if (formData.lastName.length < 2) {
      return 'Soyad en az 2 karakter olmalıdır'
    }
    if (!formData.email.trim()) {
      return 'E-posta zorunludur'
    }
    if (!isValidEmail(formData.email)) {
      return 'Geçerli bir e-posta adresi giriniz'
    }
    if (!formData.username.trim()) {
      return 'Kullanıcı adı zorunludur'
    }
    if (!isValidUsername(formData.username)) {
      return 'Kullanıcı adı en az 5 karakter olmalı, sadece harf, rakam ve _ içerebilir'
    }
    if (!formData.password) {
      return 'Şifre zorunludur'
    }
    if (!isValidPassword(formData.password)) {
      return 'Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Şifreler eşleşmiyor'
    }
    return null
  }

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    // Validasyon
    const validationError = validateForm()
    if (validationError) {
      setLocalError(validationError)
      onError?.(validationError)
      return
    }

    try {
      const result = await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        role: allowRoleSelection ? formData.role : 'USER'
      })
      
      if (result.success) {
        onSuccess?.(result.message)
        // Form'u temizle
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          username: '',
          role: 'USER'
        })
      } else {
        setLocalError(result.message)
        onError?.(result.message)
      }
    } catch (error) {
      const errorMessage = 'Beklenmeyen bir hata oluştu'
      setLocalError(errorMessage)
      onError?.(errorMessage)
    }
  }

  return (
    <form className={`space-y-6 ${className}`} onSubmit={handleSubmit}>
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Ad *
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Adınız"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Soyad *
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Soyadınız"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email *
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Kullanıcı Adı *
        </label>
        <div className="mt-1">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="kullaniciadi"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Şifre *
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Şifre"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L18 18M4.5 4.5l15 15" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            En az 8 karakter, büyük/küçük harf ve rakam
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Şifre Tekrarı *
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Şifre tekrarı"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L18 18M4.5 4.5l15 15" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Role Selection - sadece izin verilirse */}
      {allowRoleSelection && (
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Kullanıcı Rolü
          </label>
          <div className="mt-1">
            <select
              id="role"
              name="role"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-black focus:text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.role}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="USER">USER - Normal Kullanıcı</option>
              <option value="MANAGER">MANAGER - Müdür</option>
              <option value="ADMIN">ADMIN - Yönetici</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {localError}
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kayıt yapılıyor...
            </div>
          ) : (
            'Kayıt Ol'
          )}
        </button>
      </div>

      {/* Login Link */}
      {showLoginLink && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              disabled={isLoading}
            >
              Giriş yapın
            </button>
          </p>
        </div>
      )}
    </form>
  )
}
