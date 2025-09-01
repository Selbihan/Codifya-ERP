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
  const [showEditModal, setShowEditModal] = useState(false);

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
    setShowEditModal(true);
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
      setShowEditModal(false);
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
                { 
                  key: 'actions', 
                  header: 'İşlemler', 
                  accessor: (row: Category) => (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Sil
                      </button>
                    </div>
                  )
                },
              ]}
              data={categories}
              emptyMessage="Kategori bulunamadı"
              striped
              compact
            />
          )}
        </Card>

        {/* Kategori Düzenleme Modal */}
        {showEditModal && editId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Kategori Düzenle</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Adı *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Kategori adını girin"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Kategori açıklaması"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
