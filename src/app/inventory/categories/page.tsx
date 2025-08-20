"use client";
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import DashboardLayout from '@/components/layout/DashboardLayout';

type Category = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Array<Category & { _count?: { products: number } }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory/categories', {
        credentials: 'include'
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Kategori listesi alınamadı');
      setCategories(json.data);
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Kategori eklenemedi');
      setForm({ name: '', description: '' });
      setShowNewForm(false);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Silinemedi');
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditForm({ name: cat.name, description: cat.description || '' });
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/inventory/categories/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Güncellenemedi');
      setEditId(null);
      fetchCategories();
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Kategoriler</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowNewForm(s => !s)}
            >
              {showNewForm ? 'Kapat' : '+ Yeni Kategori'}
            </button>
          </div>

          {showNewForm && (
            <form onSubmit={handleCreate} className="mb-6 flex gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Adı</label>
                <input
                  className="border px-3 py-2 rounded w-64"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <input
                  className="border px-3 py-2 rounded w-64"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
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
              columns={[
                { key: 'name', header: 'Kategori Adı' },
                { key: 'description', header: 'Açıklama', accessor: row => row.description || '-' },
                { key: '_count', header: 'Ürün Sayısı', accessor: row => row._count?.products ?? 0, align: 'center' },
                { key: 'isActive', header: 'Durum', accessor: row => (
                  <span className={`inline-block px-2 py-1 rounded ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>{row.isActive ? 'Aktif' : 'Pasif'}</span>
                ) },
                { key: 'createdAt', header: 'Oluşturulma Tarihi', accessor: row => new Date(row.createdAt).toLocaleDateString('tr-TR') },
              ]}
              data={categories}
              emptyMessage="Kategori bulunamadı"
              striped
              compact
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
