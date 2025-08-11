'use client'

import React, { useState, useEffect, ChangeEvent, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Pagination } from '../../../components/ui/pagination'
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Invoice, InvoiceStatus, InvoiceType, InvoiceFilters } from '../types'

interface InvoiceListProps {
  invoices?: Invoice[]
  total?: number
  page?: number
  limit?: number
  loading?: boolean
  onPageChange?: (page: number) => void
  onFiltersChange?: (filters: InvoiceFilters) => void
  onView?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  onCreate?: () => void
}

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Taslak',
  SENT: 'Gönderildi',
  PAID: 'Ödendi',
  CANCELLED: 'İptal'
}

const typeLabels: Record<InvoiceType, string> = {
  SALES: 'Satış',
  PURCHASE: 'Alış',
  EXPENSE: 'Gider'
}

export default function InvoiceList({
  invoices = [],
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
}: InvoiceListProps) {
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 10
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<InvoiceType | ''>('')

  // Debounced search için
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const newFilters: InvoiceFilters = {
      page: 1,
      limit: 10
    }

    if (debouncedSearchTerm) {
      // Arama için customer name veya invoice number kullanılabilir
      // Bu örnekte basit bir filtreleme yapıyoruz
    }

    if (statusFilter) {
      newFilters.status = statusFilter
    }

    if (typeFilter) {
      newFilters.type = typeFilter
    }

    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [debouncedSearchTerm, statusFilter, typeFilter, onFiltersChange])

  const handlePageChange = useCallback((newPage: number) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    onPageChange?.(newPage)
    onFiltersChange?.(newFilters)
  }, [filters, onPageChange, onFiltersChange])

  const formatDate = useCallback((date: Date | string) => {
    return new Date(date).toLocaleDateString('tr-TR')
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }, [])

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value as InvoiceStatus | '')
  }, [])

  const handleTypeChange = useCallback((value: string) => {
    setTypeFilter(value as InvoiceType | '')
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Faturalar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fatura
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtreler */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fatura ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue>Durum</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onChange={handleTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue>Tür</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              {Object.entries(typeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tablo */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura No</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Vade Tarihi</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-8 text-muted-foreground">
                    Fatura bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {invoice.customer?.name || 'Bilinmeyen'}
                    </TableCell>
                    <TableCell>
                      {typeLabels[invoice.type]}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView?.(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(invoice)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete?.(invoice)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Sayfalama */}
        {total > limit && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} / {total} sonuç
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 