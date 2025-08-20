"use client";
import React, { useState } from "react";

const accountTypes = [
  { value: "ASSET", label: "Varlık" },
  { value: "LIABILITY", label: "Yükümlülük" },
  { value: "EQUITY", label: "Öz Kaynak" },
  { value: "REVENUE", label: "Gelir" },
  { value: "EXPENSE", label: "Gider" },
];


interface ChartOfAccountFormProps {
  mode: 'add' | 'edit' | null;
  initialData?: { id?: string; code: string; name: string; type: string } | null;
  onClose?: (refresh?: boolean) => void;
}

const ChartOfAccountForm: React.FC<ChartOfAccountFormProps> = ({ mode = 'add', initialData, onClose }) => {
  const [form, setForm] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    type: initialData?.type || "ASSET"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let res;
      if (mode === 'add') {
        res = await fetch('/api/accounting/chart-of-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else if (mode === 'edit' && initialData?.id) {
        res = await fetch(`/api/accounting/chart-of-account/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
  if (!res || !res.ok) throw new Error('Kayıt işlemi başarısız!');
  if (onClose) onClose(true);
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 w-full max-w-md mx-auto flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        {mode === 'edit' ? 'Hesap Düzenle' : 'Yeni Hesap Ekle'}
      </h3>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-medium">Kod</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={mode === 'edit'}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 disabled:bg-gray-100"
          placeholder="Örn: 100"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600 font-medium">Ad</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Örn: Kasa"
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
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={saving}
        className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition disabled:opacity-60"
      >
        {saving ? 'Kaydediliyor...' : mode === 'edit' ? 'Kaydet' : 'Hesap Ekle'}
      </button>
    </form>
  );
};

export default ChartOfAccountForm;
