'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      router.push('/login');
    } else {
      alert('Kayıt başarısız.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Kayıt Ol</h2>

        <label className="block mb-4">
          <span className="text-gray-900">Ad</span>
          <input 
            {...register('firstName', {
              minLength: {
                value: 2,
                message: 'Ad en az 2 karakter olmalıdır'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            } text-gray-700`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{String(errors.firstName.message)}</p>
          )}
        </label>

        <label className="block mb-4">
          <span className="text-gray-900">Soyad</span>
          <input 
            {...register('lastName', {
              minLength: {
                value: 2,
                message: 'Soyad en az 2 karakter olmalıdır'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            } text-gray-700`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{String(errors.lastName.message)}</p>
          )}
        </label>

        <label className="block mb-4">
          <span className="text-gray-900">
            E-Posta <span className="text-red-500">*</span>
          </span>
          <input 
            type="email" 
            {...register('email', {
              required: 'Email alanı zorunludur',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Geçersiz email formatı'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } text-gray-700`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{String(errors.email.message)}</p>
          )}
        </label>

        <label className="block mb-4">
          <span className="text-gray-900">
            Kullanıcı Adı <span className="text-red-500">*</span>
          </span>
          <input 
            {...register('username', {
              required: 'Kullanıcı adı alanı zorunludur',
              minLength: {
                value: 3,
                message: 'Kullanıcı adı en az 3 karakter olmalıdır'
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Kullanıcı adı sadece harf, rakam ve _ içerebilir'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            } text-gray-700`}
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
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
                message: 'Şifre en az 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir'
              }
            })}
            className={`mt-1 block w-full p-2 border rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } text-gray-700`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{String(errors.password.message)}</p>
          )}
        </label>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
          Kayıt Ol
        </button>

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="w-full mt-3 bg-gray-300 text-black py-2 rounded hover:bg-gray-400  transition"
        >
          Giriş Yap
        </button>

        <div className="text-center mt-4">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
             Ana Sayfaya Dön
          </Link>
        </div>
      </form>
    </div>
  );
}
