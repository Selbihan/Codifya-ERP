'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setLoginError('');
      // username -> identifier olarak gönder
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.username, password: data.password }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Giriş başarılı:', result);
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || errorData.error || 'Giriş başarısız!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Giriş Yap</h2>

        {/* Genel Hata Mesajı */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {loginError}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-gray-900">
            Kullanıcı Adı <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            {...register('username', {
              required: 'Kullanıcı adı alanı zorunludur',
              minLength: {
                value: 3,
                message: 'En az 3 karakter olmalıdır'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            } text-black placeholder-gray-400 focus:text-black`}    
            placeholder="Kullanıcı adınızı girin"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{String(errors.username.message)}</p>
          )}
        </label>
  {/* Şifremi Unuttum linki, kayıt ol satırının hemen üstüne taşındı */}

        <label className="block mb-4">
          <span className="text-gray-900">
            Şifre <span className="text-red-500">*</span>
          </span>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Şifre alanı zorunludur',
                minLength: {
                  value: 8,
                  message: 'Şifre en az 8 karakter olmalıdır'
                }
              })}
              className={`block w-full p-2 pr-10 border rounded ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } text-black placeholder-gray-400 focus:text-black`}
              placeholder="Şifrenizi girin"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L18 18M4.5 4.5l15 15" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{String(errors.password.message)}</p>
          )}
        </label>

        <label className="inline-flex items-center mb-4">
          <input type="checkbox" {...register('rememberMe')} className="form-checkbox" />
          <span className="ml-2 text-gray-900">Beni Hatırla</span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 rounded transition ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <div className="text-center mt-4">
          <div className="mb-2">
            <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Şifremi Unuttum?
            </Link>
          </div>
          <span className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:underline ml-1"
              disabled={isLoading}
            >
              Kayıt olun
            </button>
          </span>
        </div>
       
      </form>
    </div>
  );
}
