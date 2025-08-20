"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess(true);
      } else {
        setError(json.message || "Bir hata oluştu");
      }
    } catch (err) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Şifremi Unuttum</h2>
        {success ? (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
            )}
            <label className="block mb-4">
              <span className="text-gray-900">E-posta Adresi</span>
              <input
                type="email"
                className="border px-3 py-2 rounded w-full mt-1"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
