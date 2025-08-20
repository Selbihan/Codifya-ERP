"use client";
import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { Card } from '@/components/ui/card';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Stok hareketi tipi
interface StockMovement {
  id: string;
  productId: string;
  product: { id: string; name: string; sku: string };
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

// Ürün tipi (stok hareketi için ürün seçimi)
interface Product {
  id: string;
  name: string;
  sku: string;
}


const stockMovementColumns: DataTableColumn<StockMovement>[] = [
  {
    key: 'product',
    header: 'Ürün',
    accessor: (row) => row.product?.name || '-',
  },
  { key: 'type', header: 'Tip' },
  { key: 'quantity', header: 'Miktar', align: 'left' },
  { key: 'previousStock', header: 'Önceki Stok', align: 'left' },
  { key: 'newStock', header: 'Yeni Stok', align: 'left' },
  { key: 'reason', header: 'Açıklama' },
  { key: 'reference', header: 'Referans', accessor: row => row.reference || '-' },
  { key: 'createdBy', header: 'Oluşturan' },
  { key: 'createdAt', header: 'Tarih', accessor: row => new Date(row.createdAt).toLocaleString('tr-TR') },
];

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: 1, reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory/stock-movements');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Stok hareketleri alınamadı');
      setMovements(json.data.movements);
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMovements();
  }, []);

  // Ürünleri çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/inventory/products?limit=1000');
        const json = await res.json();
        if (json.success && json.data && json.data.products) {
          setProducts(json.data.products);
        }
      } catch {}
    };
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Stok hareketi eklenemedi');
      setForm({ productId: '', type: 'IN', quantity: 1, reason: '' });
      setShowNewForm(false);
      // Tüm hareketleri tekrar çek
      fetchMovements();
    } catch (e) {
      // Hata gösterilebilir
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Stok Hareketleri</h2>
            {showNewForm ? (
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 group transition"
                onClick={() => setShowNewForm(false)}
                aria-label="Kapat"
              >
                <IoClose className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition" />
              </button>
            ) : (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => setShowNewForm(true)}
              >
                + Yeni Stok Hareketi
              </button>
            )}
          </div>
          {showNewForm && (
            <form onSubmit={handleCreate} className="mb-6 flex gap-4 items-end flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Ürün</label>
                <select
                  className="border px-3 py-2 rounded w-64"
                  value={form.productId}
                  onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                  required
                >
                  <option value="">Seçiniz</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <select
                  className="border px-3 py-2 rounded w-32"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  required
                >
                  <option value="IN">Giriş</option>
                  <option value="OUT">Çıkış</option>
                  <option value="ADJUSTMENT">Düzeltme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Miktar</label>
                <input
                  type="number"
                  className="border px-3 py-2 rounded w-24"
                  value={form.quantity}
                  min={1}
                  onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <input
                  className="border px-3 py-2 rounded w-64"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                disabled={submitting}
              >
                {submitting ? 'Ekleniyor...' : 'Kaydet'}
              </button>
            </form>
          )}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <DataTable
              columns={stockMovementColumns}
              data={movements}
              emptyMessage="Stok hareketi bulunamadı"
              striped
              compact
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
