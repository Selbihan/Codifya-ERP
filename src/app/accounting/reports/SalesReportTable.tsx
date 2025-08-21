import React from 'react';

export default function SalesReportTable() {
  // Placeholder veri, ileride API'den gelecek
  const data = [
    { date: '2025-08-01', customer: 'Müşteri A', product: 'Ürün X', quantity: 5, total: 1500 },
    { date: '2025-08-02', customer: 'Müşteri B', product: 'Ürün Y', quantity: 2, total: 800 },
  ];
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Satış Tablosu</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Tarih</th>
              <th className="px-4 py-2 border">Müşteri</th>
              <th className="px-4 py-2 border">Ürün</th>
              <th className="px-4 py-2 border">Adet</th>
              <th className="px-4 py-2 border">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-2 border">{row.date}</td>
                <td className="px-4 py-2 border">{row.customer}</td>
                <td className="px-4 py-2 border">{row.product}</td>
                <td className="px-4 py-2 border text-right">{row.quantity}</td>
                <td className="px-4 py-2 border text-right">₺ {row.total.toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
