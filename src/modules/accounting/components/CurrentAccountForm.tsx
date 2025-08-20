"use client";
import React, { useState } from "react";

const accountTypes = [
  { value: "CUSTOMER", label: "Müşteri" },
  { value: "SUPPLIER", label: "Tedarikçi" },
  { value: "OTHER", label: "Diğer" },
];


interface CurrentAccountFormProps {
  mode: 'add' | 'edit' | null;
  initialData?: any;
  onClose: (refresh?: boolean) => void;
}

const CurrentAccountForm: React.FC<CurrentAccountFormProps> = ({ mode, initialData, onClose }) => {
  const [form, setForm] = useState({ name: initialData?.name || "", type: initialData?.type || "CUSTOMER", taxNumber: initialData?.taxNumber || "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let res;
      if (mode === 'add') {
        res = await fetch('/api/accounting/current-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            taxNumber: form.taxNumber || undefined,
            isActive: true
          }),
        });
      } else if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/accounting/current-account/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            taxNumber: form.taxNumber || undefined,
            isActive: true
          }),
        });
      }
      if (!res || !res.ok) throw new Error('Kayıt işlemi başarısız!');
      setForm({ name: '', type: 'CUSTOMER', taxNumber: '' });
      if (onClose) onClose(true);
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 w-full max-w-md mx-auto mt-6 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{mode === 'edit' ? 'Cari Hesabı Düzenle' : 'Yeni Cari Hesap Ekle'}</h3>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-medium">Ad</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Örn: ABC Müşteri"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-medium">Tip</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        >
          {accountTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-medium">Vergi No</label>
        <input
          name="taxNumber"
          value={form.taxNumber}
          onChange={handleChange}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Opsiyonel"
        />
      </div>
      <button
        type="submit"
        className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition"
      >
        {mode === 'edit' ? 'Kaydet' : 'Cari Hesap Ekle'}
      </button>
    </form>
  );
};

export default CurrentAccountForm;
