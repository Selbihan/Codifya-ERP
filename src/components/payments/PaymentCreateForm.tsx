"use client";
import { useState, useEffect } from "react";

export default function PaymentCreateForm() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/orders/report")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!orderId) {
      setMessage("Sipariş seçmelisiniz.");
      return;
    }
    const res = await fetch(`/api/orders/${orderId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, method, paymentDate }),
    });
    if (res.ok) setMessage("Ödeme başarıyla eklendi!");
    else setMessage("Hata oluştu.");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Yeni Ödeme</h2>
      <select value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full border p-2 rounded" required>
        <option value="">Sipariş Seçin</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>
            {o.orderNumber} - {o.customer}
          </option>
        ))}
      </select>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Tutar" className="w-full border p-2 rounded" required />
      <input type="text" value={method} onChange={e => setMethod(e.target.value)} placeholder="Ödeme Yöntemi" className="w-full border p-2 rounded" required />
      <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full border p-2 rounded" required />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Kaydet</button>
      {message && <div className="text-green-600">{message}</div>}
    </form>
  );
}
