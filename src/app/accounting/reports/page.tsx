// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import jsPDF from "jspdf";
import {
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiDownload,
  FiPrinter,
} from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";
import { saveAs } from "file-saver";

// TypeScript icon prop sorunu için geçici çözüm
declare module "react-icons/fi" {
  export interface IconBaseProps {
    className?: string;
  }
}

declare module "react-icons/fa" {
  export interface IconBaseProps {
    className?: string;
  }
}

export default function ReportsPage() {
  // Sekmeler
  const tabs = [
    { key: "summary", label: "Özet" },
    { key: "invoices", label: "Faturalar" },
    { key: "sales", label: "Satışlar" },
    { key: "customers", label: "Müşteriler" },
    { key: "stock", label: "Stok" },
    { key: "finance", label: "Finans" },
    { key: "products", label: "Ürünler" },
    { key: "orders", label: "Siparişler" },
  ];

  type TabKey =
    | "summary"
    | "invoices"
    | "sales"
    | "customers"
    | "stock"
    | "finance"
    | "products"
    | "orders";
  // API'den dinamik veri state'leri
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [customerReportData, setCustomerReportData] = useState<any[]>([]);
  const [stockReportData, setStockReportData] = useState<any[]>([]);
  const [financeReportData, setFinanceReportData] = useState<any[]>([]);
  const [orderReportData, setOrderReportData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [dateRange, setDateRange] = useState({ from: "", to: "" }); // henüz kullanılmıyor, filtreler için yer hazır
  const [pdfLoading, setPdfLoading] = useState(false);
  const [productReportData, setProductReportData] = useState<any[]>([]); // Ürün raporu verisi API'den alınacak

  // Aktif sekmeye göre ilgili veriyi fetch et
  useEffect(() => {
    if (activeTab === 'invoices') {
      fetch('/api/invoices').then(res => res.json()).then(data => setInvoiceData(data || []));
    } else if (activeTab === 'sales') {
      fetch('/api/sales').then(res => res.json()).then(data => setSalesData(data.sales || []));
    } else if (activeTab === 'customers') {
      fetch('/api/customers').then(res => res.json()).then(data => setCustomerReportData((data.data && data.data.customers) ? data.data.customers : []));
    } else if (activeTab === 'stock') {
      fetch('/api/stock').then(res => res.json()).then(data => setStockReportData(data.stock || []));
    } else if (activeTab === 'finance') {
      fetch('/api/finance/synthetic').then(res => res.json()).then(data => setFinanceReportData(data.finance || []));
    } else if (activeTab === 'orders') {
      fetch('/api/orders/report').then(res => res.json()).then(data => setOrderReportData(data.orders || []));
    } else if (activeTab === 'products') {
      fetch('/api/products').then(res => res.json()).then(data => setProductReportData(data.products || []));
    }
  }, [activeTab]);

  const [reportStats, setReportStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gerçek veri çekme
  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/accounting/reports/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setReportStats(data.data);
          } else {
            console.error('API returned error:', data.message);
            setReportStats(null);
          }
        } else {
          console.error('HTTP error:', response.status, response.statusText);
          setReportStats(null);
        }
      } catch (error) {
        console.error('Report stats fetch error:', error);
        setReportStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReportStats();
  }, []);

  // --- Helpers ---
  const formatCurrency = (n: number | undefined | null) => {
  if (typeof n !== 'number' || isNaN(n)) return '₺ 0';
  return `₺ ${n.toLocaleString("tr-TR")}`;
  };

  // Özet için hızlı metrikler - Gerçek verilerle
  const summaryCards = reportStats ? [
    {
      label: "Toplam Fatura",
      value: reportStats.totalInvoices || 0,
      icon: <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />,
      bgColor: 'var(--color-info-bg)',
    },
    {
      label: "Ödenen Faturalar",
      value: reportStats.paidInvoiceAmount || 0,
      icon: <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-success)' }} />,
      bgColor: 'var(--color-success-bg)',
      isMoney: true,
    },
    {
      label: "Bekleyen Faturalar",
      value: reportStats.pendingInvoices || 0,
      icon: <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />,
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: "Toplam Gelir",
      value: reportStats.totalRevenue || 0,
      icon: <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-success)' }} />,
      bgColor: 'var(--color-success-bg)',
      isMoney: true,
    },
    {
      label: "Tamamlanan Siparişler",
      value: reportStats.completedOrders || 0,
      icon: <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-success)' }} />,
      bgColor: 'var(--color-success-bg)',
    },
    {
      label: "Bekleyen Siparişler", 
      value: reportStats.pendingOrders || 0,
      icon: <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />,
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: "Toplam Müşteri",
      value: reportStats.totalCustomers || 0,
      icon: <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-info)' }} />,
      bgColor: 'var(--color-info-bg)',
    },
    {
      label: "Bekleyen Tahsilat",
      value: reportStats.pendingRevenue || 0,
      icon: <FiTrendingDown className="w-7 h-7" style={{ color: 'var(--color-error)' }} />,
      bgColor: 'var(--color-error-bg)',
      isMoney: true,
    },
  ] : [
    // Loading/Error state için boş kartlar
    {
      label: "Yükleniyor...",
      value: 0,
      icon: <FiFileText className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />,
      bgColor: 'var(--color-surface-alt)',
    }
  ];

  // --- PDF çıktısı (dom-to-image ile, oklch hatasız) ---
  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const tableId = `report-table-${activeTab}`;
      const input = document.getElementById(tableId);
      if (!input) {
        setPdfLoading(false);
        alert("İlgili sekmede tablo bulunamadı.");
        return;
      }
      // dom-to-image'ı dinamik olarak yükle (SSR hatasını önle)
      let domtoimage: any = null;
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win.domtoimage) {
          // public klasöründen script yükle
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/dom-to-image.min.js';
            script.onload = () => {
              domtoimage = win.domtoimage;
              resolve(null);
            };
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        domtoimage = win.domtoimage;
      }
      if (!domtoimage) {
        setPdfLoading(false);
        alert('dom-to-image kütüphanesi yüklenemedi.');
        return;
      }
      const dataUrl = await domtoimage.toPng(input, { bgcolor: '#fff', style: { background: '#fff', color: '#222' } });
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = function () {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = img.height * imgWidth / img.width;
        pdf.addImage(dataUrl, "PNG", 20, 20, imgWidth, imgHeight);
        pdf.save(`${activeTab}-raporu.pdf`);
        setPdfLoading(false);
      };
    } catch (e) {
      setPdfLoading(false);
      alert("PDF oluşturulamadı: " + (typeof e === "object" && e !== null && 'message' in e ? (e as any).message : String(e)));
    }
  };

  // --- Excel çıktısı ---
  const handleExportExcel = async () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    switch (activeTab) {
      case "invoices":
        headers = ["Fatura No", "Müşteri", "Tutar", "Tarih", "Durum"];
        rows = invoiceData.map((d) => [d.id, d.customer, d.amount, d.date, d.status]);
        break;
      case "sales":
        headers = ["Satış No", "Ürün", "Müşteri", "Tutar", "Tarih", "Durum"];
        rows = salesData.map((d) => [d.id, d.product, d.customer, d.amount, d.date, d.status]);
        break;
      case "customers":
        headers = ["Müşteri", "Fatura Sayısı", "Toplam Tutar"];
        rows = customerReportData.map((d) => {
          const invoices = invoiceData.filter(inv => {
            if (inv.customerId && d.id) {
              return inv.customerId === d.id;
            }
            if (inv.customer && d.name) {
              return inv.customer === d.name;
            }
            return false;
          });
          const totalAmount = invoices.reduce((sum, inv) => {
            const amount = inv.totalAmount || inv.amount || 0;
            return sum + (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
          }, 0);
          return [d.name, invoices.length, formatCurrency(totalAmount)];
        });
        break;
      case "stock":
        headers = ["Ürün", "Stok", "Min. Stok"];
        rows = stockReportData.map((d) => [d.name, d.stock, d.min]);
        break;
      case "finance":
        headers = ["Tip", "Tutar", "Tarih"];
        rows = financeReportData.map((d) => [d.type, d.amount, d.date]);
        break;
      case "products":
        headers = ["Ürün", "SKU", "Kategori", "Fiyat", "Stok"];
        rows = productReportData.map((d) => [d.name, d.sku, d.category?.name || '', d.price, d.stock]);
        break;
      default:
        return;
    }
    if (rows.length === 0) {
      alert("Tablo verisi bulunamadı.");
      return;
    }
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.default.Workbook();
      const worksheet = workbook.addWorksheet("Rapor");
      
      // Header'ları ekle
      worksheet.addRow(headers);
      
      // Veri satırlarını ekle
      rows.forEach(row => {
        worksheet.addRow(row);
      });
      
      // Header satırını kalın yap
      worksheet.getRow(1).font = { bold: true };
      
      // Excel dosyasını oluştur ve indir
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `${activeTab}-raporu.xlsx`);
    } catch (e) {
  alert("Excel oluşturulamadı: " + (typeof e === "object" && e !== null && 'message' in e ? (e as any).message : String(e)));
    }
  };

  // --- Yazdırma ---
  // Sadece rapor başlığı ve tabloyu yazdırmak için
  const handlePrint = () => {
    // print.css'i dinamik ekle (tekrar tekrar eklenmesin)
    if (!document.getElementById('print-css')) {
      const link = document.createElement('link');
      link.id = 'print-css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/print.css'; // public klasöründen yüklenir
      document.head.appendChild(link);
    }
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-[var(--color-text-muted)]">
            <Link href="/accounting" className="hover:text-[var(--color-primary)]">Muhasebe</Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">Raporlar</span>
          </nav>
          
          <div className="print-area">
            {/* Başlık ve aksiyonlar */}
            <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Raporlar</h1>
        </div>
        <div className="flex items-center gap-2 print-hide">
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold shadow hover:from-red-600 hover:to-red-500 transition disabled:opacity-50"
            title="PDF'e aktar"
          >
            <FaFilePdf className="w-5 h-5" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-green-500 bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold shadow hover:from-green-600 hover:to-green-500 transition"
            title="Excel'e aktar"
          >
            <FiDownload className="w-5 h-5" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm hover:bg-[var(--color-surface-alt)] bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]"
            title="Yazdır"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map((t) => {
          const active = activeTab === (t.key as TabKey);
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={`px-4 py-2 text-sm rounded-t-lg ${
                active
                  ? "bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-primary)] border-x border-t -mb-px"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* İçerik */}
      <div className="space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Veriler yükleniyor...
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {activeTab === "summary" && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {summaryCards.map((c, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-4 p-5 rounded-xl shadow-sm"
                  style={{ backgroundColor: c.bgColor }}
                >
                  {c.icon}
                  <div>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{c.label}</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {typeof c.value === "number" && c.isMoney ? formatCurrency(c.value) : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-text-muted text-lg">Özet grafikleri burada gösterilebilir.</span>
            </div>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === "invoices" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Fatura</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{invoiceData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Ödenen Tutar</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(invoiceData.filter((i) => i.status === "PAID" || i.status === "Ödendi").reduce((s, i) => s + (i.totalAmount || i.amount || 0), 0))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Bekleyen Fatura</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{invoiceData.filter((i) => i.status === "SENT" || i.status === "DRAFT" || i.status === "Bekliyor").length}</div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto">
              <table id="report-table-invoices" className="min-w-full text-sm">
                <thead>
                  <tr className="text-text-muted border-b border-border border-border">
                    <th className="py-2 px-3 text-left">Fatura No</th>
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                    <th className="py-2 px-3 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((inv) => (
                    <tr key={inv.id} className="border-b border-border border-border last:border-0 hover:bg-surface-alt">
                      <td className="py-2 px-3 font-mono text-text">{inv.id}</td>
                      <td className="py-2 px-3 text-text">{inv.customer?.name || inv.customer || 'Bilinmeyen'}</td>
                      <td className="py-2 px-3 text-right text-text">{formatCurrency(inv.totalAmount || inv.amount || 0)}</td>
                      <td className="py-2 px-3 text-text">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('tr-TR') : inv.date}</td>
                      <td className="py-2 px-3 text-text">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            inv.status === "PAID" || inv.status === "Ödendi"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "SENT" || inv.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inv.status === "PAID" ? "Ödendi" : inv.status === "SENT" ? "Gönderildi" : inv.status === "DRAFT" ? "Taslak" : inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SALES */}
        {activeTab === "sales" && !loading && (
          <div className="space-y-8">
            {/* Stat card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Satış</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(salesData.reduce((sum, s) => sum + s.amount, 0))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Tamamlanan</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(
                      salesData.filter((s) => s.status === "DELIVERED" || s.status === "Tamamlandı").reduce((sum, s) => sum + (s.amount || 0), 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Bekleyen</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(
                      salesData.filter((s) => s.status === "PENDING" || s.status === "PROCESSING" || s.status === "Bekliyor").reduce((sum, s) => sum + (s.amount || 0), 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Tablo */}
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-sales" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Satış No</th>
                    <th className="py-2 px-3 text-left">Ürün</th>
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                    <th className="py-2 px-3 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((sale) => (
                    <tr key={sale.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3 font-mono">{sale.id}</td>
                      <td className="py-2 px-3">{sale.product}</td>
                      <td className="py-2 px-3">{sale.customer}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(sale.amount)}</td>
                      <td className="py-2 px-3">{new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            sale.status === "DELIVERED" || sale.status === "Tamamlandı"
                              ? "bg-green-100 text-green-700"
                              : sale.status === "PENDING" || sale.status === "PROCESSING" || sale.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sale.status === "DELIVERED" ? "Teslim Edildi" : 
                           sale.status === "PENDING" ? "Beklemede" :
                           sale.status === "PROCESSING" ? "İşleniyor" :
                           sale.status === "CANCELLED" ? "İptal" : sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Grafik placeholder */}
            <div className="bg-surface rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-text-soft text-lg">Satış grafiği veya analiz burada gösterilecek.</span>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === "customers" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Müşteri</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{customerReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Fatura</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {(() => {
                      let totalInvoices = 0;
                      customerReportData.forEach(c => {
                        const invoices = invoiceData.filter(inv => {
                          if (inv.customerId && c.id) {
                            return inv.customerId === c.id;
                          }
                          if (inv.customer && c.name) {
                            return inv.customer === c.name;
                          }
                          return false;
                        });
                        totalInvoices += invoices.length;
                      });
                      return totalInvoices;
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Tutar</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {(() => {
                      let totalAmount = 0;
                      customerReportData.forEach(c => {
                        const invoices = invoiceData.filter(inv => {
                          if (inv.customerId && c.id) {
                            return inv.customerId === c.id;
                          }
                          if (inv.customer && c.name) {
                            return inv.customer === c.name;
                          }
                          return false;
                        });
                        invoices.forEach(inv => {
                          const amount = inv.totalAmount || inv.amount || 0;
                          totalAmount += (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
                        });
                      });
                      return formatCurrency(totalAmount);
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-customers" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Fatura Sayısı</th>
                    <th className="py-2 px-3 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerReportData.map((cust) => (
                    <tr key={cust.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3 font-semibold">{cust?.name || 'İsimsiz'}</td>
                      <td className="py-2 px-3 text-right">
                        {(() => {
                          const invoices = invoiceData.filter(inv => {
                            if (inv.customerId && cust.id) {
                              return inv.customerId === cust.id;
                            }
                            if (inv.customer && cust.name) {
                              return inv.customer === cust.name;
                            }
                            return false;
                          });
                          return invoices.length;
                        })()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {(() => {
                          const invoices = invoiceData.filter(inv => {
                            if (inv.customerId && cust.id) {
                              return inv.customerId === cust.id;
                            }
                            if (inv.customer && cust.name) {
                              return inv.customer === cust.name;
                            }
                            return false;
                          });
                          const total = invoices.reduce((sum, inv) => {
                            const amount = inv.totalAmount || inv.amount || 0;
                            return sum + (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
                          }, 0);
                          return formatCurrency(total);
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STOCK */}
        {activeTab === "stock" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Ürün</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stockReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Stok</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {stockReportData.reduce((sum, s) => sum + s.stock, 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Min. Stok Altı</div>
                  <div className="text-2xl font-bold">
                    {stockReportData.filter((s) => s.stock < s.min).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-stock" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Ürün</th>
                    <th className="py-2 px-3 text-right">Stok</th>
                    <th className="py-2 px-3 text-right">Min. Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReportData.map((prd) => (
                    <tr key={prd.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3">{prd.name}</td>
                      <td className="py-2 px-3 text-right">{prd.stock}</td>
                      <td className="py-2 px-3 text-right">{prd.min}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FINANCE */}
        {activeTab === "finance" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Gelir</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(
                      financeReportData.filter((f) => f.type === "Gelir").reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-error-bg)' }}>
                <FiTrendingDown className="w-7 h-7" style={{ color: 'var(--color-error)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Gider</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(
                      financeReportData.filter((f) => f.type === "Gider").reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>İşlem Sayısı</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{financeReportData.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-finance" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Tip</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {financeReportData.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3">{f.type}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(f.amount)}</td>
                      <td className="py-2 px-3">{f.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === "products" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Ürün</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{productReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiTrendingUp className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Satış</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {productReportData.reduce((sum, p) => sum + (p.sales || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Ciro</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(productReportData.reduce((sum, p) => sum + ((p.sales || 0) * (p.price || 0)), 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-products" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Ürün</th>
                    <th className="py-2 px-3 text-right">Satış</th>
                    <th className="py-2 px-3 text-right">Ciro</th>
                  </tr>
                </thead>
                <tbody>
                  {productReportData.filter(prd => (prd.sales || 0) > 0).map((prd) => (
                    <tr key={prd.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3">{prd.name}</td>
                      <td className="py-2 px-3 text-right">{prd.sales}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency((prd.sales || 0) * (prd.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-info-bg)' }}>
                <FiFileText className="w-7 h-7" style={{ color: 'var(--color-info)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Toplam Sipariş</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{orderReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <FiCreditCard className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Tamamlanan</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{orderReportData.filter((o) => o.status === "DELIVERED" || o.status === "Tamamlandı").length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                <FiAlertCircle className="w-7 h-7" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <div className="text-xs text-text-muted font-medium mb-1">Bekleyen</div>
                  <div className="text-2xl font-bold">{orderReportData.filter((o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "Bekliyor").length}</div>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl shadow p-6 overflow-x-auto" >
              <table id="report-table-orders" className="min-w-full text-sm" >
                <thead>
                  <tr className="text-text-muted border-b border-border">
                    <th className="py-2 px-3 text-left">Sipariş No</th>
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                    <th className="py-2 px-3 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReportData.map((ord) => (
                    <tr key={ord.id} className="border-b border-border last:border-0 table-row-hover">
                      <td className="py-2 px-3 font-mono">{ord.id}</td>
                      <td className="py-2 px-3">{ord.customer}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(ord.amount || 0)}</td>
                      <td className="py-2 px-3">{new Date(ord.date).toLocaleDateString('tr-TR')}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            ord.status === "DELIVERED" || ord.status === "Tamamlandı"
                              ? "bg-green-100 text-green-700"
                              : ord.status === "PENDING" || ord.status === "PROCESSING" || ord.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ord.status === "DELIVERED" ? "Teslim Edildi" : 
                           ord.status === "PENDING" ? "Beklemede" :
                           ord.status === "PROCESSING" ? "İşleniyor" :
                           ord.status === "CANCELLED" ? "İptal" : ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
