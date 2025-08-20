

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import ChartOfAccountForm from "./ChartOfAccountForm";


import { ChartOfAccount } from "@/types/accounting";

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  ASSET: { label: "Varlık", color: "bg-green-100 text-green-700", icon: "💵" },
  LIABILITY: { label: "Yükümlülük", color: "bg-red-100 text-red-700", icon: "💳" },
  EQUITY: { label: "Öz Kaynak", color: "bg-blue-100 text-blue-700", icon: "🏦" },
  REVENUE: { label: "Gelir", color: "bg-yellow-100 text-yellow-700", icon: "📈" },
  EXPENSE: { label: "Gider", color: "bg-purple-100 text-purple-700", icon: "💸" },
};

const ChartOfAccountList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'|null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"code"|"name"|"type">("code");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  // API'dan veri çek
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounting/chart-of-account");
      if (!res.ok) throw new Error("Veriler alınamadı");
      const data = await res.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filtreli ve sıralı hesaplar
  const filtered = useMemo(() => {
    let arr = accounts.filter(acc =>
      acc.code.includes(search) || acc.name.toLowerCase().includes(search.toLowerCase())
    );
    arr = arr.sort((a, b) => {
      if (sortBy === "code") return sortDir === "asc" ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
      if (sortBy === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === "type") return sortDir === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      return 0;
    });
    return arr;
  }, [accounts, search, sortBy, sortDir]);

  // Modal açma fonksiyonları
  const openAdd = () => { setModalMode('add'); setSelected(null); setShowModal(true); };
  const openEdit = (acc: any) => { setModalMode('edit'); setSelected(acc); setShowModal(true); };
  // Silme işlemi
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounting/chart-of-account/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silme işlemi başarısız!');
      await fetchAccounts();
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };
  // Modal kapandığında tabloyu güncelle
  const closeModal = (refresh = false) => {
    setShowModal(false); setModalMode(null); setSelected(null);
    if (refresh) fetchAccounts();
  };

  // Tablo başlığına tıklayınca sıralama
  const handleSort = (col: "code"|"name"|"type") => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  // DataTable kolonları
  const columns: DataTableColumn<any>[] = [
    { key: 'code', header: 'Kod', sortable: true, accessor: row => <span className="font-mono font-semibold">{row.code}</span>, align: 'left' },
    { key: 'name', header: 'Ad', sortable: true, align: 'left' },
    { key: 'type', header: 'Tip', accessor: row => {
      const type = typeLabels[row.type] || { label: row.type, color: "bg-gray-100 text-gray-700", icon: "❓" };
  return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-base font-medium ${type.color}`}><span>{type.icon}</span> {type.label}</span>;
    }, align: 'left' },
    { key: 'actions', header: 'Aksiyon', accessor: row => (
      <>
  <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-base font-semibold hover:bg-blue-200 transition mr-2" onClick={() => openEdit(row)}>Düzenle</button>
  <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-base font-semibold hover:bg-red-200 transition" onClick={() => handleDelete(row.id)}>Sil</button>
      </>
    ), align: 'left' }
  ];

  return (
  <div className="mt-8 max-w-6xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold mb-8 tracking-tight">Hesap Planı</h2>
        <div className="flex gap-2 items-center">
          <input
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Kod veya ad ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition"
            onClick={openAdd}
          >
            + Yeni Hesap
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => closeModal()}
              aria-label="Kapat"
            >
              ×
            </button>
            <ChartOfAccountForm mode={modalMode} initialData={selected} onClose={() => closeModal(true)} />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage={error || 'Kayıt bulunamadı.'}
        striped
        compact
        className="text-base"
      />
    </div>
  );
};

export default ChartOfAccountList;
