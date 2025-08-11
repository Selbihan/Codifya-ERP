'use client'

import React, { useState, useEffect } from 'react'
import { Transaction, TransactionType, TransactionCategory, TransactionFilters } from '../types'

interface TransactionListProps {
  transactions?: Transaction[]
  total?: number
  page?: number
  limit?: number
  loading?: boolean
  onPageChange?: (page: number) => void
  onFiltersChange?: (filters: TransactionFilters) => void
  onView?: (transaction: Transaction) => void
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  onCreate?: () => void
}

const typeColors = {
  INCOME: 'text-green-600',
  EXPENSE: 'text-red-600'
}

const categoryLabels = {
  SALES: 'Satış',
  PURCHASE: 'Alış',
  SALARY: 'Maaş',
  RENT: 'Kira',
  UTILITIES: 'Faturalar',
  MARKETING: 'Pazarlama',
  OTHER: 'Diğer'
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
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('')
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | ''>('')

  useEffect(() => {
    const newFilters: TransactionFilters = {
      page: 1,
      limit: 10
    }

    if (typeFilter) {
      newFilters.type = typeFilter
    }

    if (categoryFilter) {
      newFilters.category = categoryFilter
    }

    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [searchTerm, typeFilter, categoryFilter, onFiltersChange])

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    onPageChange?.(newPage)
    onFiltersChange?.(newFilters)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">İşlemler</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Yeni İşlem
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
          <h2 className="text-xl font-semibold">İşlemler</h2>
          <div className="flex items-center space-x-2">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
              Dışa Aktar
            </button>
            <button 
              onClick={onCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Yeni İşlem
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
                placeholder="İşlem ara..."
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
            value={typeFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as TransactionType | '')}
            className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Türler</option>
            <option value="INCOME">Gelir</option>
            <option value="EXPENSE">Gider</option>
          </select>
          <select 
            value={categoryFilter} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value as TransactionCategory | '')}
            className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="SALES">Satış</option>
            <option value="PURCHASE">Alış</option>
            <option value="SALARY">Maaş</option>
            <option value="RENT">Kira</option>
            <option value="UTILITIES">Faturalar</option>
            <option value="MARKETING">Pazarlama</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Tarih</th>
                <th className="text-left py-3 px-4 font-medium">Tür</th>
                <th className="text-left py-3 px-4 font-medium">Kategori</th>
                <th className="text-left py-3 px-4 font-medium">Açıklama</th>
                <th className="text-left py-3 px-4 font-medium">Tutar</th>
                <th className="text-left py-3 px-4 font-medium">Referans</th>
                <th className="text-left py-3 px-4 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    İşlem bulunamadı
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${typeColors[transaction.type]}`}>
                        {transaction.type === 'INCOME' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {categoryLabels[transaction.category]}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.description}
                    </td>
                    <td className={`py-3 px-4 font-medium ${typeColors[transaction.type]}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {transaction.reference || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView?.(transaction)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onEdit?.(transaction)}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete?.(transaction)}
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