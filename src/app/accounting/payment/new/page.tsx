"use client";
import { useState, useEffect } from "react";

export default function NewPaymentPage() {
  const [form, setForm] = useState({
    orderId: "",
    amount: "",
    method: "",
    description: ""
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Sipariş listesini çek
    fetch("/api/orders/report")
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!form.orderId) {
      setError("Lütfen bir sipariş seçin.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/orders/${form.orderId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.amount,
          method: form.method,
          reference: form.description
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Ödeme kaydedilemedi.");
      } else {
        setSuccess("Ödeme başarıyla kaydedildi.");
        setForm({ orderId: "", amount: "", method: "", description: "" });
      }
    } catch (err) {
      setError("Sunucu hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Yeni Ödeme</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-4">
          <span className="text-gray-900">Sipariş</span>
          <select name="orderId" value={form.orderId} onChange={handleChange} className="block w-full p-2 border rounded" required>
            <option value="">Sipariş seçin</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} - {order.customer} - {order.amount}₺
              </option>
            ))}
          </select>
        </label>
        {/*
        <label className="block mb-4">
          <span className="text-gray-900">Tarih</span>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="block w-full p-2 border rounded" required />
        </label>
        */}
        <label className="block mb-4">
          <span className="text-gray-900">Tutar</span>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="block w-full p-2 border rounded" required min="0" step="0.01" />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Ödeme Yöntemi</span>
          <input type="text" name="method" value={form.method} onChange={handleChange} className="block w-full p-2 border rounded" required />
        </label>
        <label className="block mb-4">
          <span className="text-gray-900">Açıklama</span>
          <textarea name="description" value={form.description} onChange={handleChange} className="block w-full p-2 border rounded" rows={2} />
        </label>
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        {success && <div className="text-green-600 mb-2 text-sm">{success}</div>}
        <button type="submit" className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
        </button>
      </form>
    </div>
  );
}
