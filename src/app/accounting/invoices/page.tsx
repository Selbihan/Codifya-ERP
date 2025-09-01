'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FiPlus, FiFileText, FiCreditCard, FiClock, FiEye } from 'react-icons/fi'

interface InvoiceStats {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customer: { name: string }
  totalAmount: number
  status: string
  issueDate: string
  dueDate: string
}

export default function InvoicesPage() {
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  })
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, invoicesRes] = await Promise.all([
        fetch('/api/accounting/reports/stats'),
        fetch('/api/invoices')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStats({
            totalInvoices: statsData.data.totalInvoices,
            totalAmount: statsData.data.totalInvoiceAmount,
            paidAmount: statsData.data.paidInvoiceAmount,
            pendingAmount: statsData.data.pendingRevenue
          })
        }
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData || [])
      }
    } catch (error) {
      console.error('Data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Ödendi</Badge>
      case 'SENT':
        return <Badge className="bg-blue-100 text-blue-800">Gönderildi</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">Taslak</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">İptal</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[var(--color-text-muted)]">
          <Link href="/accounting" className="hover:text-[var(--color-primary)]">Muhasebe</Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">Faturalar</span>
        </nav>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📄 Faturalar</h1>
            <p className="text-gray-600">Müşteri faturalarını yönetin</p>
          </div>
          <Link href="/accounting/invoices/new">
            <Button className="flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              Yeni Fatura
            </Button>
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Toplam Fatura</div>
                <div className="text-xl font-bold">{stats.totalInvoices}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiFileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Toplam Tutar</div>
                <div className="text-xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Ödenen</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiClock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Bekleyen</div>
                <div className="text-xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fatura Listesi */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Fatura Listesi</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Fatura No</th>
                    <th className="text-left py-2">Müşteri</th>
                    <th className="text-left py-2">Tutar</th>
                    <th className="text-left py-2">Durum</th>
                    <th className="text-left py-2">Tarih</th>
                    <th className="text-left py-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length > 0 ? invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3">{invoice.customer?.name || 'N/A'}</td>
                      <td className="py-3 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-3">{getStatusBadge(invoice.status)}</td>
                      <td className="py-3">
                        {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <FiEye className="w-3 h-3" />
                          Görüntüle
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Henüz fatura bulunmuyor
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  )
}
