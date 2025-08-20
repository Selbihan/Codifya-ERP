'use client'


import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionCategory, TransactionFilters } from '../types';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';

interface TransactionListProps {
  transactions?: Transaction[];
  total?: number;
  page?: number;
  limit?: number;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: TransactionFilters) => void;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onCreate?: () => void;
}

export default function TransactionList({
  transactions = [],
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
}: TransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | ''>('');

  useEffect(() => {
    const newFilters: TransactionFilters = {
      page: 1,
      limit: 10
    };
    if (typeFilter) {
      newFilters.type = typeFilter;
    }
    if (categoryFilter) {
      newFilters.category = categoryFilter;
    }
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [searchTerm, typeFilter, categoryFilter, onFiltersChange]);

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    onPageChange?.(newPage);
    onFiltersChange?.(newFilters);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const typeColors: Record<TransactionType, string> = {
    INCOME: 'text-green-600',
    EXPENSE: 'text-red-600',
  };
  const categoryLabels: Record<TransactionCategory, string> = {
    SALES: 'Satış',
    PURCHASE: 'Alış',
    SALARY: 'Maaş',
    RENT: 'Kira',
    UTILITIES: 'Faturalar',
    MARKETING: 'Pazarlama',
    OTHER: 'Diğer',
  };

  const columns: DataTableColumn<Transaction>[] = [
  { key: 'date', header: 'Tarih', accessor: (row) => formatDate(row.date), align: 'left' },
  { key: 'type', header: 'Tür', accessor: (row) => <span className={`font-medium ${typeColors[row.type]}`}>{row.type === 'INCOME' ? 'Gelir' : 'Gider'}</span>, align: 'left' },
  { key: 'category', header: 'Kategori', accessor: (row) => categoryLabels[row.category], align: 'left' },
  { key: 'description', header: 'Açıklama', accessor: (row) => row.description, align: 'left' },
  { key: 'amount', header: 'Tutar', accessor: (row) => <span className={`font-medium ${typeColors[row.type]}`}>{row.type === 'INCOME' ? '+' : '-'}{formatCurrency(row.amount)}</span>, align: 'left' },
  { key: 'reference', header: 'Referans', accessor: (row) => row.reference || '-', align: 'left' },
  { key: 'actions', header: 'İşlemler', accessor: (row) => (
      <div className="flex gap-2">
        <button onClick={() => onView?.(row)} className="text-blue-600 hover:underline">Görüntüle</button>
        <button onClick={() => onEdit?.(row)} className="text-yellow-600 hover:underline">Düzenle</button>
        <button onClick={() => onDelete?.(row)} className="text-red-600 hover:underline">Sil</button>
      </div>
    ) },
  ];
  return (
    <DataTable columns={columns} data={transactions} striped compact />
  );
}