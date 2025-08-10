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
        setLoginError(errorData.error || 'Giriş başarısız!');
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

        <label className="block mb-4">
          <span className="text-gray-900">
            Şifre <span className="text-red-500">*</span>
          </span>
          <input
            type="password"
            {...register('password', {
              required: 'Şifre alanı zorunludur',
              minLength: {
                value: 8,
                message: 'Şifre en az 8 karakter olmalıdır'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } text-black placeholder-gray-400 focus:text-black`}
            placeholder="Şifrenizi girin"
          />
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
