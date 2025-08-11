'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Badge } from '../../../components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  CreditCard, 
  BarChart3,
  Calendar,
  Users
} from 'lucide-react'
import { AccountingStats, InvoiceStats, TransactionStats, PaymentStats } from '../types'

interface AccountingDashboardProps {
  stats?: AccountingStats
  invoiceStats?: InvoiceStats
  transactionStats?: TransactionStats
  paymentStats?: PaymentStats
  loading?: boolean
}

export default function AccountingDashboard({
  stats,
  invoiceStats,
  transactionStats,
  paymentStats,
  loading = false
}: AccountingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ana İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{stats?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{stats?.totalExpenses?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₺{stats?.netProfit?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Faturalar</CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.outstandingInvoices || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              ₺{stats?.outstandingInvoices?.toLocaleString() || '0'} toplam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detaylı Sekmeler */}
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="invoices">Faturalar</TabsTrigger>
          <TabsTrigger value="transactions">İşlemler</TabsTrigger>
          <TabsTrigger value="payments">Ödemeler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Aylık Gelir Grafiği */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Aylık Gelir/Gider</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                  <div className="space-y-2">
                    {stats.monthlyRevenue.slice(0, 6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{month.month}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-green-600">+₺{month.revenue.toLocaleString()}</span>
                          <span className="text-sm text-red-600">-₺{month.expenses.toLocaleString()}</span>
                          <span className={`text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₺{month.profit.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Henüz veri yok</p>
                )}
              </CardContent>
            </Card>

            {/* En İyi Müşteriler */}
            <Card>
              <CardHeader>
                <CardTitle>En İyi Müşteriler</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topCustomers && stats.topCustomers.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topCustomers.slice(0, 5).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate">{customer.customer?.name || 'Bilinmeyen'}</span>
                        <span className="text-sm font-medium">₺{customer.totalInvoiced.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Henüz veri yok</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Fatura</CardTitle>
                <Receipt className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoiceStats?.totalInvoices || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{invoiceStats?.totalAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ödenmiş</CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoiceStats?.paidInvoices || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{invoiceStats?.paidAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
                <Badge variant="info">⏳</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoiceStats?.pendingInvoices || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{invoiceStats?.outstandingAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gecikmiş</CardTitle>
                <Badge variant="error">⚠</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoiceStats?.overdueInvoices || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{invoiceStats?.overdueAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionStats?.totalTransactions || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺{transactionStats?.totalIncome?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₺{transactionStats?.totalExpenses?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(transactionStats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₺{transactionStats?.netProfit?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bu ay
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentStats?.totalPayments || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{paymentStats?.totalAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentStats?.completedPayments || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{paymentStats?.completedAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
                <Badge variant="info">⏳</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentStats?.pendingAmount || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  ₺{paymentStats?.pendingAmount?.toLocaleString() || '0'} toplam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
                <Badge variant="error">✗</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentStats?.failedPayments || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Bu ay
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ödeme Yöntemleri */}
          {paymentStats?.paymentMethods && paymentStats.paymentMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Yöntemleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentStats.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{method.method.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{method.count} işlem</span>
                        <span className="text-sm font-medium">₺{method.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 