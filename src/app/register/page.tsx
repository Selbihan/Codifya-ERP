// Register Page - Kullanıcı kayıt sayfası
// RegisterForm component'ini kullanarak kayıt işlemi

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { RegisterForm } from '@/components/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Eğer kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Başarılı kayıt
  const handleSuccess = (successMessage: string) => {
    setMessage({ type: 'success', text: successMessage })
    // Başarılı kayıt sonrası otomatik dashboard'a yönlendirme AuthContext tarafından yapılacak
  }

  // Hata durumu
  const handleError = (errorMessage: string) => {
    setMessage({ type: 'error', text: errorMessage })
  }

  // Login sayfasına git
  const handleLoginClick = () => {
    router.push('/login')
  }

  // Auth loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Zaten giriş yapılmışsa içeriği gösterme
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ERP Sistemi - Kayıt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Yeni hesap oluşturun
          </p>
        </div>

        {/* Global Message */}
        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Register Form */}
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm
            onSuccess={handleSuccess}
            onError={handleError}
            showLoginLink={true}
            onLoginClick={handleLoginClick}
          />
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Kayıt olarak{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Kullanım Şartları
            </a>
            {' '}ve{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Gizlilik Politikası
            </a>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
