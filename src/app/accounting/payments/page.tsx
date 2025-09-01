
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FiPlus, FiCreditCard, FiDollarSign, FiClock, FiEye, FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi'

interface PaymentStats {
  totalPayments: number
  totalInAmount: number
  totalOutAmount: number
  pendingAmount: number
}

interface Payment {
  id: string
  referenceNumber: string
  description: string
  amount: number
  type: string
  status: string
  paymentDate: string
}

export default function PaymentsPage() {
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalInAmount: 0,
    totalOutAmount: 0,
    pendingAmount: 0
  })
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        fetch('/api/accounting/reports/stats'),
        fetch('/api/payments')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          // Ödeme istatistiklerini hesapla
          setStats({
            totalPayments: statsData.data.totalPayments || 0,
            totalInAmount: statsData.data.totalIncoming || 0,
            totalOutAmount: statsData.data.totalOutgoing || 0,
            pendingAmount: statsData.data.pendingPayments || 0
          })
        }
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData || [])
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
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Bekliyor</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Başarısız</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'INCOMING' ? (
      <FiArrowDownLeft className="w-4 h-4 text-green-600" />
    ) : (
      <FiArrowUpRight className="w-4 h-4 text-red-600" />
    )
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
          <span className="text-[var(--color-text)]">Ödemeler</span>
        </nav>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💳 Ödemeler</h1>
            <p className="text-gray-600">Gelen ve giden ödemeleri yönetin</p>
          </div>
          <Link href="/accounting/payments/new">
            <Button className="flex items-center gap-2">
              <FiPlus className="w-4 h-4" />
              Yeni Ödeme
            </Button>
          </Link>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiCreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Toplam Ödeme</div>
                <div className="text-xl font-bold">{stats.totalPayments}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiArrowDownLeft className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Gelen</div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(stats.totalInAmount)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Giden</div>
                <div className="text-xl font-bold text-red-600">{formatCurrency(stats.totalOutAmount)}</div>
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

        {/* Ödeme Listesi */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ödeme Listesi</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Referans No</th>
                    <th className="text-left py-2">Açıklama</th>
                    <th className="text-left py-2">Tutar</th>
                    <th className="text-left py-2">Tip</th>
                    <th className="text-left py-2">Durum</th>
                    <th className="text-left py-2">Tarih</th>
                    <th className="text-left py-2">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{payment.referenceNumber}</td>
                      <td className="py-3">{payment.description}</td>
                      <td className="py-3">
                        <div className={`font-semibold ${payment.type === 'INCOMING' ? 'text-green-600' : 'text-red-600'}`}>
                          {payment.type === 'INCOMING' ? '+' : '-'}{formatCurrency(Math.abs(payment.amount))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(payment.type)}
                          <span>{payment.type === 'INCOMING' ? 'Gelen' : 'Giden'}</span>
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(payment.status)}</td>
                      <td className="py-3">
                        {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
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
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Henüz ödeme bulunmuyor
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
