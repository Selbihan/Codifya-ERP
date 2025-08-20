"use client";
import React, { useState, useEffect, useMemo } from "react";
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import CurrentAccountForm from "./CurrentAccountForm";
import CurrentAccountDetailModal from "./CurrentAccountDetailModal";
import { CurrentAccount } from "@/types/accounting";

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  CUSTOMER: { label: "Müşteri", color: "bg-blue-100 text-blue-700", icon: "👤" },
  SUPPLIER: { label: "Tedarikçi", color: "bg-green-100 text-green-700", icon: "🏢" },
  OTHER: { label: "Diğer", color: "bg-gray-100 text-gray-700", icon: "❓" },
};

const CurrentAccountList: React.FC = () => {
  const [accounts, setAccounts] = useState<CurrentAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | undefined>();
  const [selectedDetail, setSelectedDetail] = useState<CurrentAccount | null>(null);
  const [detailTab, setDetailTab] = useState<"genel" | "hareketler" | "dokumanlar">("genel");
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [formInitial, setFormInitial] = useState<CurrentAccount | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounting/current-account");
      if (!res.ok) throw new Error("Veriler alınamadı");
      const data = await res.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(acc =>
        (!filterType || acc.type === filterType) &&
        (acc.name.toLowerCase().includes(search.toLowerCase()) || (acc.taxNumber ?? "").includes(search))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts, search, filterType]);

  const openAddForm = () => { setFormMode("add"); setFormInitial(null); setShowFormModal(true); };
  const openEditForm = (acc: CurrentAccount) => { setFormMode("edit"); setFormInitial(acc); setShowFormModal(true); };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bu cari hesabı silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/accounting/current-account/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme işlemi başarısız!");
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || "Bilinmeyen hata");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Arama ve filtre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 items-center">
          <input
            placeholder="Ara: ad veya vergi no"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <select
            value={filterType || ""}
            onChange={e => setFilterType(e.target.value || undefined)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Tümü</option>
            <option value="CUSTOMER">Müşteri</option>
            <option value="SUPPLIER">Tedarikçi</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>
        <button
          onClick={openAddForm}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold hover:scale-105 transition"
        >
          + Yeni Cari
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={[
          { key: 'name', header: 'Ad', accessor: row => <span className="font-medium text-[var(--color-text)]">{row.name}</span>, sortable: true, align: 'left' },
          { key: 'type', header: 'Tip', accessor: row => {
            const type = typeLabels[row.type] || { label: row.type, color: "bg-gray-100 text-gray-700", icon: "❓" };
            return <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color} inline-flex items-center gap-1`}>{type.icon} {type.label}</span>;
          }, align: 'left' },
          { key: 'taxNumber', header: 'Vergi No', accessor: row => <span className="text-xs text-gray-500">{row.taxNumber || '-'}</span>, align: 'left' },
          { key: 'isActive', header: 'Durum', accessor: row => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{row.isActive ? 'Aktif' : 'Pasif'}</span>
          ), align: 'left' },
          { key: 'actions', header: 'İşlemler', accessor: row => (
            <div className="flex gap-3">
              <button className="hover:text-blue-600" title="Düzenle" onClick={e => { e.stopPropagation(); openEditForm(row); }}>Düzenle</button>
              <button className="hover:text-red-600" title="Sil" onClick={e => { e.stopPropagation(); handleDelete(row.id); }}>
                {actionLoading ? "⏳" : "Sil"}
              </button>
            </div>
          ), align: 'left' }
        ]}
        data={filteredAccounts}
        loading={loading}
        emptyMessage={error || 'Kayıt bulunamadı.'}
        striped
        compact
        onRowClick={row => setSelectedDetail(row)}
      />

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowFormModal(false)}
            >
              ×
            </button>
            <CurrentAccountForm
              mode={formMode}
              initialData={formInitial}
              onClose={(refresh) => {
                setShowFormModal(false);
                if (refresh) fetchAccounts();
              }}
            />
          </div>
        </div>
      )}

      {/* Detay Modal */}
      <CurrentAccountDetailModal
        selectedDetail={selectedDetail}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        openEdit={openEditForm}
        handleDelete={handleDelete}
        setSelectedDetail={setSelectedDetail}
        typeLabels={typeLabels}
      />
    </div>
  );
};

export default CurrentAccountList;
