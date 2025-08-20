import { useState } from 'react';

// Muhasebe > Raporlar sayfası (detaylı raporlar, tarih aralığı, toplamlar)
export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Örnek özet veriler
  const summary = {
    totalInvoices: 0,
    totalPayments: 0,
    totalOutstanding: 0,
    totalIncome: 0,
    totalExpense: 0,
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Raporlar</h1>
      {/* Tarih aralığı filtresi */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
        <div>
          <label className="block text-xs font-medium mb-1">Başlangıç Tarihi</label>
          <input type="date" className="border rounded px-3 py-2" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Bitiş Tarihi</label>
          <input type="date" className="border rounded px-3 py-2" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filtrele</button>
      </div>
      {/* Özet kutuları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Fatura</div>
          <div className="text-2xl font-bold">₺ {summary.totalInvoices}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Ödeme</div>
          <div className="text-2xl font-bold">₺ {summary.totalPayments}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Bekleyen</div>
          <div className="text-2xl font-bold">₺ {summary.totalOutstanding}</div>
        </div>
      </div>
      {/* Gelir/Gider kutuları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-green-100 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Gelir</div>
          <div className="text-2xl font-bold">₺ {summary.totalIncome}</div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Gider</div>
          <div className="text-2xl font-bold">₺ {summary.totalExpense}</div>
        </div>
      </div>
      {/* Tablo ve grafik entegrasyonu için alan hazır */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-center">Detaylı rapor tablosu ve grafikler burada gösterilecek.</div>
      </div>
    </div>
  );
}
