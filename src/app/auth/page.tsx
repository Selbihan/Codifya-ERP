'use client';

import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-blue-400">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-l-lg font-semibold transition-colors duration-200 ${showLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setShowLogin(true)}
          >
            Giriş Yap
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg font-semibold transition-colors duration-200 ${!showLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setShowLogin(false)}
          >
            Kayıt Ol
          </button>
        </div>
        {showLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm />
        )}
      </div>
    </div>
  );
}
