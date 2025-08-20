"use client";
import { useState } from "react";

export default function NewInvoicePage() {
  const [form, setForm] = useState({
    customer: "",
    invoiceNumber: "",
    date: "",
    amount: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // TODO: API entegrasyonu
    setTimeout(() => {
      setLoading(false);
      setSuccess("Fatura başarıyla oluşturuldu.");
    }, 1000);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Yeni Fatura</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span className="text-gray-900">Müşteri</span>
          <input type="text" name="customer" value={form.customer} onChange={handleChange} className="block w-full p-2 border rounded" required />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Fatura No</span>
          <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} className="block w-full p-2 border rounded" required />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Tarih</span>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="block w-full p-2 border rounded" required />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Tutar</span>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="block w-full p-2 border rounded" required min="0" step="0.01" />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Açıklama</span>
          <textarea name="description" value={form.description} onChange={handleChange} className="block w-full p-2 border rounded" rows={2} />
        </label>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
        <button type="submit" className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition" disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Fatura Oluştur"}
        </button>
      </form>
    </div>
  );
}
