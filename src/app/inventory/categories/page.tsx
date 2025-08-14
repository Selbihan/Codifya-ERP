"use client";
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory/categories');
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

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
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
            <table className="min-w-full bg-white border border-gray-200 rounded">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b text-left">Kategori Adı</th>
                  <th className="px-4 py-2 border-b text-left">Açıklama</th>
                  <th className="px-4 py-2 border-b text-left">Ürün Sayısı</th>
                  <th className="px-4 py-2 border-b text-left">Durum</th>
                  <th className="px-4 py-2 border-b text-left">Oluşturulma Tarihi</th>
                  <th className="px-4 py-2 border-b text-left">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">Kategori bulunamadı</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id}>
                      <td className="px-4 py-2 border-b">{editId === cat.id ? (
                        <input className="border px-2 py-1 rounded w-32" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      ) : cat.name}</td>
                      <td className="px-4 py-2 border-b">{editId === cat.id ? (
                        <input className="border px-2 py-1 rounded w-32" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      ) : (cat.description || '-')}</td>
                      <td className="px-4 py-2 border-b text-center">{cat._count?.products ?? 0}</td>
                      <td className="px-4 py-2 border-b">
                        <span className={`inline-block px-2 py-1 rounded ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{cat.isActive ? 'Aktif' : 'Pasif'}</span>
                      </td>
                      <td className="px-4 py-2 border-b">{new Date(cat.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-2 border-b">
                        {editId === cat.id ? (
                          <>
                            <button className="text-green-600 hover:underline mr-2" onClick={handleEditSave} disabled={submitting}>Kaydet</button>
                            <button className="text-gray-600 hover:underline" onClick={() => setEditId(null)}>Vazgeç</button>
                          </>
                        ) : (
                          <>
                            <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(cat)}>Düzenle</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleDelete(cat.id)}>Sil</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
