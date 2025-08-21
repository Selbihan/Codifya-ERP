import React, { useState } from 'react';

const customers = [
  { id: '1', name: 'Müşteri A' },
  { id: '2', name: 'Müşteri B' },
];
const products = [
  { id: '1', name: 'Ürün X' },
  { id: '2', name: 'Ürün Y' },
];

export default function SalesReportFilters({ onFilter }: { onFilter: (filters: any) => void }) {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    customer: '',
    product: '',
    status: '',
  });
  return (
    <form className="flex flex-wrap gap-4 mb-6 items-end" onSubmit={e => { e.preventDefault(); onFilter(filters); }}>
      <div>
        <label className="block text-xs font-medium mb-1">Başlangıç Tarihi</label>
        <input type="date" className="border rounded px-3 py-2" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Bitiş Tarihi</label>
        <input type="date" className="border rounded px-3 py-2" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Müşteri</label>
        <select className="border rounded px-3 py-2" value={filters.customer} onChange={e => setFilters(f => ({ ...f, customer: e.target.value }))}>
          <option value="">Tümü</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Ürün</label>
        <select className="border rounded px-3 py-2" value={filters.product} onChange={e => setFilters(f => ({ ...f, product: e.target.value }))}>
          <option value="">Tümü</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Durum</label>
        <select className="border rounded px-3 py-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Tümü</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="PENDING">Bekliyor</option>
          <option value="CANCELLED">İptal</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filtrele</button>
    </form>
  );
}
