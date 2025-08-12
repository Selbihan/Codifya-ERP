"use client";
import React, { useState, useMemo, ReactNode } from 'react'

// Küçük bir guards (cn yoksa basit join)
function clsx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(' ')
}
const cx = clsx

export type DataTableColumn<T> = {
  key: keyof T | string
  header: string | ReactNode
  accessor?: (row: T) => ReactNode
  sortable?: boolean
  className?: string
  align?: 'left' | 'center' | 'right'
  width?: string
  hidden?: boolean
}

export interface DataTablePagination {
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  striped?: boolean
  compact?: boolean
  className?: string
  pagination?: DataTablePagination
  initialSort?: { key: string; direction: 'asc' | 'desc' }
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  emptyMessage = 'Kayıt bulunamadı',
  onRowClick,
  striped,
  compact,
  className,
  pagination,
  initialSort,
  onSortChange,
}: DataTableProps<T>) {
  const visibleCols = columns.filter(c => !c.hidden)
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>(initialSort)

  const sortedData = useMemo(() => {
    if (!sort) return data
    const col = columns.find(c => c.key === sort.key)
    if (!col) return data
    // accessor varsa basit string/number compare deneyelim
    return [...data].sort((a, b) => {
      const aValRaw = col.accessor ? col.accessor(a) : (a as any)[col.key]
      const bValRaw = col.accessor ? col.accessor(b) : (b as any)[col.key]
      // primitive extract
      const aVal = extractComparable(aValRaw)
      const bVal = extractComparable(bValRaw)
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sort, columns])

  function handleSort(col: DataTableColumn<T>) {
    if (!col.sortable) return
    setSort(prev => {
      if (!prev || prev.key !== col.key) {
        const next: { key: string; direction: 'asc' | 'desc' } = { key: col.key as string, direction: 'asc' }
        onSortChange?.(next.key, next.direction)
        return next
      }
      const nextDir: 'asc' | 'desc' = prev.direction === 'asc' ? 'desc' : 'asc'
      const next: { key: string; direction: 'asc' | 'desc' } = { key: prev.key, direction: nextDir }
      onSortChange?.(next.key, next.direction)
      return next
    })
  }

  const pageData = useMemo(() => {
    if (!pagination) return sortedData
    const start = (pagination.page - 1) * pagination.pageSize
    return sortedData.slice(start, start + pagination.pageSize)
  }, [sortedData, pagination])

  return (
    <div className={cx('w-full overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm', className)}>
      <table className={cx('min-w-full table-fixed border-separate border-spacing-0', compact ? 'text-sm' : 'text-sm')}>        
        <thead className="bg-gray-50">
          <tr>
            {visibleCols.map(col => {
              const isSorted = sort?.key === col.key
              return (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col)}
                  className={cx(
                    'px-4 py-3 text-left font-medium text-gray-600 select-none border-b border-gray-200',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:text-gray-900',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-xs text-gray-400">
                        {isSorted ? (sort!.direction === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={visibleCols.length} className="px-4 py-6 text-center text-gray-500">
                Yükleniyor...
              </td>
            </tr>
          )}
          {!loading && pageData.length === 0 && (
            <tr>
              <td colSpan={visibleCols.length} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading && pageData.map((row, idx) => {
            const rowKey = (row as any).id ?? idx
            return (
              <tr
                key={rowKey}
                onClick={() => onRowClick?.(row)}
                className={cx(
                  'border-b border-gray-100 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                  striped && idx % 2 === 1 && 'bg-gray-50'
                )}
              >
                {visibleCols.map(col => (
                  <td
                    key={String(col.key)}
                    className={cx(
                      'px-4 py-3 align-middle text-gray-700',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      'whitespace-nowrap',
                      col.className
                    )}
                  >
                    {col.accessor ? col.accessor(row) : String((row as any)[col.key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <span className="text-xs text-gray-500">
            {(pagination.page - 1) * pagination.pageSize + 1}
            {' - '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} / {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange?.(pagination.page - 1)}
              className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-50"
            >Önceki</button>
            <button
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onPageChange?.(pagination.page + 1)}
              className="px-3 py-1 text-xs rounded border disabled:opacity-40 hover:bg-gray-50"
            >Sonraki</button>
          </div>
        </div>
      )}
    </div>
  )
}

function extractComparable(val: any): string | number {
  if (val == null) return ''
  if (typeof val === 'string' || typeof val === 'number') return val
  if (React.isValidElement(val) && typeof (val as any).props?.children === 'string') {
    return (val as any).props.children
  }
  return String(val)
}
