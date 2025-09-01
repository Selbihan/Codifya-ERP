
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
  const [categories, setCategories] = useState<{ id: string; name: string; _count?: { products: number } }[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    categoryId: ''
  });
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
    { key: 'price', header: 'Fiyat (₺)', sortable: true, align: 'left', accessor: p => p.price != null ? `${p.price} ₺` : '-' },
    { key: 'stock', header: 'Stok Miktarı', sortable: true, align: 'left' },
    { key: 'minStock', header: 'Minimum Stok', align: 'left' },
    { key: 'category', header: 'Kategori', accessor: p => p.category?.name || 'Kategori Yok' },
    { key: 'isActive', header: 'Durum', accessor: p => (
        <Badge variant={p.isActive ? 'success' : 'error'}>{p.isActive ? 'Aktif' : 'Pasif'}</Badge>
      ) },
    { key: 'createdAt', header: 'Oluşturulma Tarihi', sortable: true, accessor: p => new Date(p.createdAt).toLocaleDateString('tr-TR') },
    { 
      key: 'actions', 
      header: 'İşlemler', 
      accessor: (p: Product) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditProduct(p)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Düzenle
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteProduct(p.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sil
          </Button>
        </div>
      )
    },
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
      const res = await fetch(`/api/inventory/products?${params}`, {
        credentials: 'include'
      });
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

  // Kategorileri çek
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/inventory/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error('Kategoriler yüklenemedi:', e);
    }
  };

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
      fetchCategories(); // Kategori ürün sayısını güncelle
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Kategori oluşturulamadı');
      
      // Yeni kategoriyi listeye ekle ve seç
      const newCategory = json.data;
      setCategories(prev => [...prev, newCategory]);
      setForm(f => ({ ...f, categoryId: newCategory.id }));
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (e: any) {
      setError(e.message || 'Kategori oluşturulamadı');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/inventory/products/${productId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Ürün silinemedi');
      
      fetchProducts();
      fetchCategories(); // Kategori ürün sayısını güncelle
    } catch (e: any) {
      setError(e.message || 'Ürün silinemedi');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      categoryId: product.categoryId || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || undefined,
        sku: editForm.sku.trim(),
        price: Number(editForm.price),
        cost: Number(editForm.cost),
        stock: Number(editForm.stock),
        minStock: Number(editForm.minStock),
        categoryId: editForm.categoryId?.trim() || undefined
      };
      const res = await fetch(`/api/inventory/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Güncelleme başarısız');
      
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
      fetchCategories(); // Kategori ürün sayısını güncelle
    } catch (e: any) {
      setError(e.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
            <p className="text-gray-600 mt-1">Ürünlerinizi yönetin ve stok durumlarını takip edin</p>
          </div>
          <Button onClick={() => setShowNewForm(true)} className="bg-blue-600 hover:bg-blue-700">
            + Ürün Ekle
          </Button>
        </div>

        {/* Arama */}
        <div className="flex gap-4">
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

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

        {/* Ürün Ekleme Modal */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Yeni Ürün Ekle</h3>
                <button 
                  onClick={() => setShowNewForm(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ürün adını girin"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Kodu (SKU) *</label>
                    <Input
                      value={form.sku}
                      onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="SKU"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Ürün açıklaması"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺) *</label>
                    <Input
                      type="text"
                      value={form.price === 0 ? '' : form.price.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Sadece sayı ve nokta karakterlerine izin ver
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setForm(f => ({ ...f, price: value === '' ? 0 : parseFloat(value) || 0 }));
                        }
                      }}
                      placeholder="0.00"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maliyet (₺) *</label>
                    <Input
                      type="text"
                      value={form.cost === 0 ? '' : form.cost.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Sadece sayı ve nokta karakterlerine izin ver
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setForm(f => ({ ...f, cost: value === '' ? 0 : parseFloat(value) || 0 }));
                        }
                      }}
                      placeholder="0.00"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Miktarı *</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stok *</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.minStock}
                      onChange={(e) => setForm(f => ({ ...f, minStock: parseInt(e.target.value) || 0 }))}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <div className="space-y-3">
                      <select
                        value={form.categoryId}
                        onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Kategori seçin</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {cat._count ? `(${cat._count.products} ürün)` : ''}
                          </option>
                        ))}
                      </select>
                      {!showNewCategoryInput ? (
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          + Yeni kategori ekle
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Yeni kategori adı"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleCreateCategory}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Ekle
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            İptal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewForm(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Ekleniyor...' : 'Ürün Ekle'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ürün Düzenleme Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Ürün Düzenle</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateProduct} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Adı *</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ürün adını girin"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Kodu (SKU) *</label>
                    <Input
                      value={editForm.sku}
                      onChange={(e) => setEditForm(f => ({ ...f, sku: e.target.value }))}
                      placeholder="SKU"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Ürün açıklaması"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat (₺) *</label>
                    <Input
                      type="text"
                      value={editForm.price === 0 ? '' : editForm.price.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setEditForm(f => ({ ...f, price: value === '' ? 0 : parseFloat(value) || 0 }));
                        }
                      }}
                      placeholder="0.00"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maliyet (₺) *</label>
                    <Input
                      type="text"
                      value={editForm.cost === 0 ? '' : editForm.cost.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setEditForm(f => ({ ...f, cost: value === '' ? 0 : parseFloat(value) || 0 }));
                        }
                      }}
                      placeholder="0.00"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stok Miktarı *</label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => setEditForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stok *</label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.minStock}
                      onChange={(e) => setEditForm(f => ({ ...f, minStock: parseInt(e.target.value) || 0 }))}
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                    <select
                      value={editForm.categoryId}
                      onChange={(e) => setEditForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat._count ? `(${cat._count.products} ürün)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
