"use client";
// Fatura durum ve tip etiketleri
const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Taslak",
  SENT: "Gönderildi",
  PAID: "Ödendi",
  CANCELLED: "İptal"
};
const typeLabels: Record<InvoiceType, string> = {
  SALES: "Satış",
  PURCHASE: "Alış",
  EXPENSE: "Gider"
};

import type { DataTableColumn } from "@/components/ui/data-table";
const columns: DataTableColumn<Invoice>[] = [
  { key: "id", header: "Fatura No", align: "left" },
  { key: "customer", header: "Müşteri", align: "left" },
  { key: "status", header: "Durum", align: "left" },
  {
    key: "amount",
    header: "Tutar",
    align: "left",
    accessor: (row: Invoice) => {
      if (typeof row.amount !== 'number' || isNaN(row.amount)) return '-';
      return row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    }
  },
  {
    key: "date",
    header: "Tarih",
    align: "left",
    accessor: (row: Invoice) => {
      if (!row.date) return '-';
      const d = new Date(row.date);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('tr-TR');
    }
  },
];

import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "../../../components/ui/pagination";
import { Plus, Search } from "lucide-react";

// API ile uyumlu tipler
type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "CANCELLED";
type InvoiceType = "SALES" | "PURCHASE" | "EXPENSE";
interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}
interface InvoiceFilters {
  page: number;
  limit: number;
  search?: string;
  status?: InvoiceStatus | "";
  type?: InvoiceType | "";
}

const InvoiceList = ({ onFiltersChange, onPageChange }: { onFiltersChange?: (filters: InvoiceFilters) => void; onPageChange?: (page: number) => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customer: "",
    invoiceNumber: "",
    date: "",
    amount: "",
    description: ""
  });
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "">("");
  const [filters, setFilters] = useState<InvoiceFilters>({ page: 1, limit: 10 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const page = filters.page;
  const limit = filters.limit;

    // Müşteri listesini çek
    useEffect(() => {
      const fetchCustomers = async () => {
        setCustomersLoading(true);
        try {
          const res = await fetch("/api/crm/customers?limit=1000");
          const data = await res.json();
          if (data.success && Array.isArray(data.data?.customers)) {
            setCustomers(data.data.customers.map((c: any) => ({ id: c.id, name: c.name })));
          }
        } catch (e) {
          setCustomers([]);
        } finally {
          setCustomersLoading(false);
        }
      };
      fetchCustomers();
    }, []);

    // Fatura listesini API'den çek
    useEffect(() => {
      setLoading(true);
      fetch('/api/invoices')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.invoices)) {
            setInvoices(data.invoices);
            setTotal(data.invoices.length);
          } else {
            setInvoices([]);
            setTotal(0);
          }
        })
        .catch(() => {
          setInvoices([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    }, [filters]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      setFormSuccess("");
      setFormLoading(true);
      try {
        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: form.customer,
            invoiceNumber: form.invoiceNumber,
            date: form.date,
            amount: form.amount,
            description: form.description
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFormSuccess('Fatura başarıyla oluşturuldu.');
          // Yeni faturayı tekrar çek
          fetch('/api/invoices')
            .then(res => res.json())
            .then(data => {
              if (Array.isArray(data.invoices)) {
                setInvoices(data.invoices);
                setTotal(data.invoices.length);
              }
            });
          setTimeout(() => {
            setOpen(false);
            setFormSuccess("");
            setForm({ customer: "", invoiceNumber: "", date: "", amount: "", description: "" });
          }, 1200);
        } else {
          setFormError(data.error || 'Kayıt başarısız.');
        }
      } catch (err) {
        setFormError('Sunucu hatası.');
      } finally {
        setFormLoading(false);
      }
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Faturalar</CardTitle>
        <Button onClick={() => setOpen(true)} variant="primary" className="flex items-center gap-2 shadow-md">
          <Plus className="h-4 w-4" />Yeni Fatura
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 gap-2 items-center bg-gray-50 rounded-lg p-3 shadow-sm mb-6">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Fatura No, Müşteri..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-200"
            />
            <Search className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative">
            <Select value={statusFilter} onChange={val => setStatusFilter(val as InvoiceStatus | "")}> 
              <SelectTrigger className="w-36 bg-white border border-gray-200 rounded-md px-4 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition">
                <SelectValue>{statusFilter ? statusLabels[statusFilter as InvoiceStatus] : "Durum"}</SelectValue>
                <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </SelectTrigger>
              <SelectContent className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <SelectItem value="">Tümü</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Select value={typeFilter} onChange={val => setTypeFilter(val as InvoiceType | "")}> 
              <SelectTrigger className="w-36 bg-white border border-gray-200 rounded-md px-4 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition">
                <SelectValue>{typeFilter ? typeLabels[typeFilter as InvoiceType] : "Tür"}</SelectValue>
                <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </SelectTrigger>
              <SelectContent className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <SelectItem value="">Tümü</SelectItem>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="primary" className="ml-2 flex items-center gap-2" onClick={() => {
            const newFilters: InvoiceFilters = {
              page: 1,
              limit: 10
            };
            if (searchTerm) newFilters.search = searchTerm;
            if (statusFilter) newFilters.status = statusFilter;
            if (typeFilter) newFilters.type = typeFilter;
            setFilters(newFilters);
            onFiltersChange?.(newFilters);
          }}>
            <Search className="h-4 w-4" /> Ara
          </Button>
        </div>

        {/* Modal: Yeni Fatura */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Yeni Fatura"
          footer={null}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 p-2">
            <label className="block">
              <span className="text-gray-900">Müşteri</span>
              <Select
                value={form.customer}
                onChange={val => setForm(f => ({ ...f, customer: val as string }))}
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
              <span className="text-gray-900">Fatura No</span>
              <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handleFormChange} className="block w-full p-2 border rounded" required />
            </label>
            <label className="block">
              <span className="text-gray-900">Tarih</span>
              <input type="date" name="date" value={form.date} onChange={handleFormChange} className="block w-full p-2 border rounded" required />
            </label>
            <label className="block">
              <span className="text-gray-900">Tutar</span>
              <input type="number" name="amount" value={form.amount} onChange={handleFormChange} className="block w-full p-2 border rounded" required min="0" step="0.01" />
            </label>
            <label className="block">
              <span className="text-gray-900">Açıklama</span>
              <textarea name="description" value={form.description} onChange={handleFormChange} className="block w-full p-2 border rounded" rows={2} />
            </label>
            {formError && <div className="text-red-600 mb-2 text-sm">{formError}</div>}
            {formSuccess && <div className="text-green-600 mb-2 text-sm">{formSuccess}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setOpen(false)} variant="secondary" type="button">Vazgeç</Button>
              <Button variant="primary" type="submit" disabled={formLoading}>{formLoading ? "Oluşturuluyor..." : "Fatura Oluştur"}</Button>
            </div>
          </form>
        </Modal>

        <DataTable
          columns={columns}
          data={invoices}
          loading={loading}
          pagination={{
            page,
            pageSize: limit,
            total,
            onPageChange: (newPage) => {
              setFilters(f => ({ ...f, page: newPage }))
              onPageChange?.(newPage)
              onFiltersChange?.({ ...filters, page: newPage })
            }
          }}
        />
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={(newPage) => {
            setFilters(f => ({ ...f, page: newPage }))
            onPageChange?.(newPage)
            onFiltersChange?.({ ...filters, page: newPage })
          }}
        />
      </CardContent>
    </Card>
  );
};

export default InvoiceList;