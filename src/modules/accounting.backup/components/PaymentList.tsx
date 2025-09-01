
'use client';
import React, { useState, useEffect } from 'react';


// ...existing code...

// EditPaymentForm fonksiyonu dosya sonunda olmalı
function EditPaymentForm({ payment, orders, onSave, onCancel }: any) {
  const [form, setForm] = useState({
    orderId: payment.orderId,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    reference: payment.reference || '',
    paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 10) : ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...form, amount: Number(form.amount) });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-gray-900">Sipariş</span>
        <select
          name="orderId"
          value={form.orderId}
          onChange={handleChange}
          className="block w-full p-2 border rounded bg-white"
          required
        >
          <option value="">Sipariş seçin</option>
          {orders.map((o: any) => (
            <option key={o.id} value={o.id}>{o.orderNumber} - {o.customer}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-gray-900">Tutar</span>
        <Input type="number" name="amount" value={form.amount} onChange={handleChange} className="block w-full p-2 border rounded" required min="0" step="0.01" />
      </label>
      <label className="block">
        <span className="text-gray-900">Yöntem</span>
        <select name="method" value={form.method} onChange={handleChange} className="block w-full p-2 border rounded" required>
          <option value="CASH">Nakit</option>
          <option value="CREDIT_CARD">Kredi Kartı</option>
          <option value="BANK_TRANSFER">Banka Transferi</option>
          <option value="CHECK">Çek</option>
        </select>
      </label>
      <label className="block">
        <span className="text-gray-900">Durum</span>
        <select name="status" value={form.status} onChange={handleChange} className="block w-full p-2 border rounded" required>
          <option value="PENDING">Bekliyor</option>
          <option value="COMPLETED">Tamamlandı</option>
          <option value="FAILED">Başarısız</option>
          <option value="REFUNDED">İade</option>
        </select>
      </label>
      <label className="block">
        <span className="text-gray-900">Tarih</span>
        <Input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} className="block w-full p-2 border rounded" required />
      </label>
      <label className="block">
        <span className="text-gray-900">Referans</span>
        <Input type="text" name="reference" value={form.reference} onChange={handleChange} className="block w-full p-2 border rounded" />
      </label>
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel} variant="secondary" type="button">Vazgeç</Button>
        <Button variant="primary" type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
      </div>
    </form>
  );
}


import { fetchOrders } from '@/utils/fetchOrders';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/Modal';
import { Plus } from 'lucide-react';
import { Payment, PaymentStatus, PaymentMethod, PaymentFilters } from '../types';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';

interface PaymentListProps {
  payments?: Payment[]
  total?: number
  page?: number
  limit?: number
  loading?: boolean
  onPageChange?: (page: number) => void
  onFiltersChange?: (filters: PaymentFilters) => void
  onView?: (payment: Payment) => void
  onEdit?: (payment: Payment) => void
  onDelete?: (payment: Payment) => void
  onCreate?: () => void
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800'
}

const methodLabels = {
  CASH: 'Nakit',
  CREDIT_CARD: 'Kredi Kartı',
  BANK_TRANSFER: 'Banka Transferi',
  CHECK: 'Çek'
}

export default function PaymentList(props: PaymentListProps) {
  // Tabloyu güncellemek için payments ve setPayments state'i ekle
  const [payments, setPayments] = useState<Payment[]>(props.payments || []);

  // Tüm ödemeleri yeni endpointten çek
  useEffect(() => {
    fetch('/api/accounting/all-payments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data)) setPayments(data.data);
        else setPayments([]);
      });
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // Ödeme formu için state
  const [form, setForm] = useState({
    customer: '',
    orderId: '',
    amount: '',
    method: '',
    date: '',
    description: ''
  });
  // Siparişler için state
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; customer: string }[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Müşteri listesini çek
  useEffect(() => {
    if (!open) return;
    setCustomersLoading(true);
    setOrdersLoading(true);
    fetch('/api/crm/customers?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data?.customers)) {
          setCustomers(data.data.customers.map((c: any) => ({ id: c.id, name: c.name })));
        } else {
          setCustomers([]);
        }
      })
      .catch(() => setCustomers([]))
      .finally(() => setCustomersLoading(false));
    // Siparişleri çek
    fetchOrders().then((orders) => {
      setOrders(orders);
      setOrdersLoading(false);
    });
  }, [open]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSelect = (val: string) => {
    setForm(f => ({ ...f, customer: val }));
  };
  const {
    total = 0,
    page = 1,
    limit = 10,
    loading = false,
    onPageChange,
    onFiltersChange,
    onView,
    onEdit,
    onDelete,
    onCreate
  } = props;
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');

  useEffect(() => {
    const newFilters: PaymentFilters = {
      page: 1,
      limit: 10
    };
    if (statusFilter) {
      newFilters.status = statusFilter;
    }
    if (methodFilter) {
      newFilters.method = methodFilter;
    }
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [searchTerm, statusFilter, methodFilter, onFiltersChange]);

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    onPageChange?.(newPage);
    onFiltersChange?.(newFilters);
  };

  // Yardımcı fonksiyonlar (sadece bir kez tanımlanmalı)
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('tr-TR');
  };
  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  // Kısa gösterim için yardımcı fonksiyonlar
  const shortOrderId = (id: string | undefined) => id ? id.substring(0, 6) : '-';
  const shortReference = (ref: string | null | undefined) => ref ? ref.substring(0, 8) : '-';

  // İşlemler butonları için fallback fonksiyonlar
  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewModalOpen(true);
  };
  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditModalOpen(true);
  };
  const handleDelete = (payment: Payment) => {
    if (onDelete) onDelete(payment);
    else alert('Sil fonksiyonu tanımlı değil.');
  };

  const columns: DataTableColumn<Payment>[] = [
    {
      key: 'orderId',
      header: 'Sipariş No',
      accessor: (row: Payment) => shortOrderId(row.orderId),
      align: 'left'
    },
    {
      key: 'paymentDate',
      header: 'Tarih',
      accessor: (row: Payment) => formatDate(row.paymentDate),
      align: 'left'
    },
    {
      key: 'method',
      header: 'Yöntem',
      accessor: (row: Payment) => methodLabels[row.method],
      align: 'left'
    },
    {
      key: 'status',
      header: 'Durum',
      accessor: (row: Payment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
          {row.status === 'PENDING' && 'Bekliyor'}
          {row.status === 'COMPLETED' && 'Tamamlandı'}
          {row.status === 'FAILED' && 'Başarısız'}
          {row.status === 'REFUNDED' && 'İade'}
        </span>
      ),
      align: 'left'
    },
    {
      key: 'amount',
      header: 'Tutar',
      accessor: (row: Payment) => formatCurrency(row.amount),
      align: 'left'
    },
    {
      key: 'reference',
      header: 'Referans',
      accessor: (row: Payment) => shortReference(row.reference),
      align: 'left'
    },
    {
      key: 'actions',
      header: 'İşlemler',
      accessor: (row: Payment) => (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-700 p-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button onClick={() => handleEdit(row)} className="text-green-600 hover:text-green-700 p-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-700 p-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
      align: 'left'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold">Ödemeler</h2>
          <div className="flex gap-2">
            <Button variant="outline">Dışa Aktar</Button>
            <Button variant="primary" onClick={() => setOpen(true)} className="flex items-center gap-2"><Plus className="h-4 w-4" />Yeni Ödeme</Button>
          </div>
        </div>
        <div className="p-6">
          {/* Modern Filtreler */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-1 gap-2 items-center bg-gray-50 rounded-lg p-3 shadow-sm">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Ödeme ara..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-200"
                />
                <svg className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Durum Dropdown */}
              <div className="relative">
                <Select value={statusFilter} onChange={val => setStatusFilter(val as PaymentStatus | '')}>
                  <SelectTrigger className="w-36 bg-white border border-gray-200 rounded-md px-4 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition">
                    <SelectValue>{statusFilter ? (statusFilter === 'PENDING' ? 'Bekliyor' : statusFilter === 'COMPLETED' ? 'Tamamlandı' : statusFilter === 'FAILED' ? 'Başarısız' : 'İade') : 'Durum'}</SelectValue>
                    <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </SelectTrigger>
                  <SelectContent className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <SelectItem value="">Tüm Durumlar</SelectItem>
                    <SelectItem value="PENDING">Bekliyor</SelectItem>
                    <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                    <SelectItem value="FAILED">Başarısız</SelectItem>
                    <SelectItem value="REFUNDED">İade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Yöntem Dropdown */}
              <div className="relative">
                <Select value={methodFilter} onChange={val => setMethodFilter(val as PaymentMethod | '')}>
                  <SelectTrigger className="w-36 bg-white border border-gray-200 rounded-md px-4 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition">
                    <SelectValue>{methodFilter ? methodLabels[methodFilter as PaymentMethod] : 'Yöntem'}</SelectValue>
                    <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </SelectTrigger>
                  <SelectContent className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                    <SelectItem value="">Tüm Yöntemler</SelectItem>
                    <SelectItem value="CASH">Nakit</SelectItem>
                    <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Banka Transferi</SelectItem>
                    <SelectItem value="CHECK">Çek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Ara Butonu */}
              <Button variant="primary" className="ml-2 flex items-center gap-2" onClick={() => {
                const newFilters: PaymentFilters = {
                  page: 1,
                  limit: 10
                };
                if (searchTerm) newFilters.orderId = searchTerm;
                if (statusFilter) newFilters.status = statusFilter;
                if (methodFilter) newFilters.method = methodFilter;
                setFilters(newFilters);
                onFiltersChange?.(newFilters);
              }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Ara
              </Button>
            </div>
          </div>

          {/* Modal: Yeni Ödeme */}
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Yeni Ödeme"
            footer={null}
          >
            <form className="space-y-4 p-2" onSubmit={async e => {
              e.preventDefault();
              setFormError("");
              setFormSuccess("");
              setFormLoading(true);
              // orderId zorunlu, formdan alınacak
              if (!form.orderId) {
                setFormError('Sipariş seçmelisiniz.');
                setFormLoading(false);
                return;
              }
              try {
                const res = await fetch(`/api/orders/${form.orderId}/payments`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    amount: Number(form.amount),
                    method: form.method,
                    reference: form.customer // referans olarak müşteri id'si gönderiliyor, backend'de referans alanı var
                  })
                });
                const data = await res.json();
                if (res.ok && data.success && data.data) {
                  setFormSuccess("Ödeme başarıyla kaydedildi.");
                  setPayments(prev => [data.data, ...prev]);
                  setTimeout(() => {
                    setOpen(false);
                    setFormSuccess("");
                    setForm({ customer: '', orderId: '', amount: '', method: '', date: '', description: '' });
                  }, 1200);
                } else {
                  setFormError(data.message || "Kayıt başarısız.");
                }
              } catch (err) {
                setFormError("Sunucu hatası.");
              } finally {
                setFormLoading(false);
              }
            }}>
              <label className="block">
                <span className="text-gray-900">Müşteri</span>
                <Select
                  value={form.customer}
                  onChange={handleFormSelect}
                >
                  <SelectTrigger className="block w-full p-2 border rounded bg-white">
                    <SelectValue>{
                      customersLoading
                        ? "Yükleniyor..."
                        : (customers.find(c => c.id === form.customer)?.name || "Müşteri seçin")
                    }</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="block">
                <span className="text-gray-900">Sipariş</span>
                <select
                  name="orderId"
                  value={form.orderId}
                  onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                  className="block w-full p-2 border rounded bg-white"
                  required
                  disabled={ordersLoading}
                >
                  <option value="">Sipariş seçin</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customer}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-gray-900">Tutar</span>
                <Input type="number" name="amount" value={form.amount} onChange={handleFormChange} className="block w-full p-2 border rounded" required min="0" step="0.01" />
              </label>
              <label className="block">
                <span className="text-gray-900">Yöntem</span>
                <Select value={form.method} onChange={val => setForm(f => ({ ...f, method: val }))}>
                  <SelectTrigger className="block w-full p-2 border rounded bg-white">
                    <SelectValue>{form.method ? methodLabels[form.method as PaymentMethod] : "Yöntem seçin"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Nakit</SelectItem>
                    <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Banka Transferi</SelectItem>
                    <SelectItem value="CHECK">Çek</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="block">
                <span className="text-gray-900">Tarih</span>
                <Input type="date" name="date" value={form.date} onChange={handleFormChange} className="block w-full p-2 border rounded" required />
              </label>
              <label className="block">
                <span className="text-gray-900">Açıklama</span>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="block w-full p-2 border rounded" rows={2} />
              </label>
              {formError && <div className="text-red-600 mb-2 text-sm">{formError}</div>}
              {formSuccess && <div className="text-green-600 mb-2 text-sm">{formSuccess}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button onClick={() => setOpen(false)} variant="secondary" type="button">Vazgeç</Button>
                <Button variant="primary" type="submit" disabled={formLoading}>{formLoading ? "Kaydediliyor..." : "Kaydet"}</Button>
              </div>
            </form>
          </Modal>

          <DataTable columns={columns} data={payments} striped compact />

          {/* Görüntüle Modalı */}
          <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Ödeme Detayı">
            {selectedPayment ? (
              <div className="space-y-2">
                <div><b>Sipariş No:</b> {shortOrderId(selectedPayment.orderId)}</div>
                <div><b>Tarih:</b> {formatDate(selectedPayment.paymentDate)}</div>
                <div><b>Yöntem:</b> {methodLabels[selectedPayment.method]}</div>
                <div><b>Durum:</b> {selectedPayment.status}</div>
                <div><b>Tutar:</b> {formatCurrency(selectedPayment.amount)}</div>
                <div><b>Referans:</b> {shortReference(selectedPayment.reference)}</div>
              </div>
            ) : null}
          </Modal>

          {/* Düzenle Modalı */}

          <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Ödeme Düzenle">
            {selectedPayment ? (
              <EditPaymentForm
                payment={selectedPayment}
                orders={orders}
                onSave={async (updated: any) => {
                  const res = await fetch(`/api/accounting/payments/${selectedPayment.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updated)
                  });
                  if (res.ok) {
                    setEditModalOpen(false);
                    setPayments(payments => payments.map(p => p.id === selectedPayment.id ? { ...p, ...updated } : p));
                  } else {
                    alert('Güncelleme başarısız!');
                  }
                }}
                onCancel={() => setEditModalOpen(false)}
              />
            ) : null}
          </Modal>

          {/* EditPaymentForm bileşeni dosya sonunda tanımlanıyor */}
          {/* Sayfalama */}
          {total > limit && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} / {total} sonuç
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  Önceki
                </Button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">
                  {page}
                </span>
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  variant="outline"
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ...existing code...

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Ödemeler</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Yeni Ödeme
          </button>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ödemeler</h2>
          <div className="flex items-center space-x-2">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
              Dışa Aktar
            </button>
            <button 
              onClick={onCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Yeni Ödeme
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filtreler */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Ödeme ara..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as PaymentStatus | '')}
            className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekliyor</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="FAILED">Başarısız</option>
            <option value="REFUNDED">İade</option>
          </select>
          <select 
            value={methodFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMethodFilter(e.target.value as PaymentMethod | '')}
            className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Yöntemler</option>
            <option value="CASH">Nakit</option>
            <option value="CREDIT_CARD">Kredi Kartı</option>
            <option value="BANK_TRANSFER">Banka Transferi</option>
            <option value="CHECK">Çek</option>
          </select>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Sipariş No</th>
                <th className="text-left py-3 px-4 font-medium">Tarih</th>
                <th className="text-left py-3 px-4 font-medium">Yöntem</th>
                <th className="text-left py-3 px-4 font-medium">Durum</th>
                <th className="text-left py-3 px-4 font-medium">Tutar</th>
                <th className="text-left py-3 px-4 font-medium">Referans</th>
                <th className="text-left py-3 px-4 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Ödeme bulunamadı
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      {shortOrderId(payment.orderId)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="py-3 px-4">
                      {methodLabels[payment.method]}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                        {payment.status === 'PENDING' && 'Bekliyor'}
                        {payment.status === 'COMPLETED' && 'Tamamlandı'}
                        {payment.status === 'FAILED' && 'Başarısız'}
                        {payment.status === 'REFUNDED' && 'İade'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {shortReference(payment.reference)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(payment)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(payment)}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(payment)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {total > limit && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} / {total} sonuç
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded">
                {page}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 