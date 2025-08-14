
'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/layout/DashboardLayout'

type Product = {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string | null;
  category?: { name?: string } | null;
  isActive: boolean;
  createdAt: string;
};


export default function ProductsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(100);
  const [showNewForm, setShowNewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    categoryId: ''
  });

  // DataTable kolonları (sadece fonksiyonun içinde ve tek tanım)
  const productColumns: DataTableColumn<Product>[] = [
    { key: 'name', header: 'Ürün Adı', sortable: true },
    { key: 'sku', header: 'Stok Kodu (SKU)', sortable: true },
    { key: 'price', header: 'Fiyat (₺)', sortable: true, align: 'right', accessor: p => p.price != null ? `${p.price} ₺` : '-' },
    { key: 'stock', header: 'Stok Miktarı', sortable: true, align: 'right' },
    { key: 'minStock', header: 'Minimum Stok', align: 'right' },
    { key: 'category', header: 'Kategori', accessor: p => p.category?.name || 'Kategori Yok' },
    { key: 'isActive', header: 'Durum', accessor: p => (
        <Badge variant={p.isActive ? 'success' : 'error'}>{p.isActive ? 'Aktif' : 'Pasif'}</Badge>
      ) },
    { key: 'createdAt', header: 'Oluşturulma Tarihi', sortable: true, accessor: p => new Date(p.createdAt).toLocaleDateString('tr-TR') },
  ];



  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });
      if (search) params.append('search', search);
      const res = await fetch(`/api/inventory/products?${params}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Liste alınamadı');
      setData(json.data);
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, currentPage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        sku: form.sku.trim(),
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        categoryId: form.categoryId?.trim() || undefined
      };
      const res = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Oluşturma başarısız');
      setForm({ name: '', description: '', sku: '', price: 0, cost: 0, stock: 0, minStock: 0, categoryId: '' });
      setShowNewForm(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Yükleniyor...</p>
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Ürün bulunamadı</p>
            </div>
          ) : (
            <DataTable
              data={data.products}
              columns={productColumns}
              striped
              compact
              initialSort={{ key: 'createdAt', direction: 'desc' }}
              pagination={{
                page: data.page,
                pageSize: data.limit,
                total: data.total,
                onPageChange: (p: number) => setCurrentPage(p)
              }}
            />
          )}
        </Card>
        {data && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Toplam {data.total} üründen {data.products.length} tanesi görüntüleniyor
            </span>
            <span>
              Sayfa {data.page} / {data.totalPages}
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
