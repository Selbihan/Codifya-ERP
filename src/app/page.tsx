'use client'

// Ana sayfa sadece hoş geldin mesajı veya yönlendirme içerebilir
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContext } from '@/context/AuthContext'

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            ERP Sistemine Hoş Geldiniz
          </h2>
          {user && (
            <p className="mt-2 text-gray-600">
              Merhaba, {user.name || user.username}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
