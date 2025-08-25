"use client";
import { useState, useEffect } from "react";
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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
      fetch('/api/invoices').then(res => res.json()).then(data => setInvoiceData(data.invoices || []));
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

  // --- Helpers ---
  const formatCurrency = (n: number | undefined | null) => {
  if (typeof n !== 'number' || isNaN(n)) return '₺ 0';
  return `₺ ${n.toLocaleString("tr-TR")}`;
  };

  // Özet için hızlı metrikler
  const summaryCards = [
    {
      label: "Toplam Fatura",
      value: typeof invoiceData.length === 'number' && !isNaN(invoiceData.length) ? invoiceData.length : 0,
      icon: <FiFileText className="w-7 h-7 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      label: "Toplam Ödeme (Ödendi)",
      value: (() => {
        const val = invoiceData.filter((i) => i.status === "Ödendi").reduce((s, i) => s + (typeof i.amount === 'number' && !isNaN(i.amount) ? i.amount : 0), 0);
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiCreditCard className="w-7 h-7 text-green-500" />,
      bg: "bg-green-50",
      isMoney: true,
    },
    {
      label: "Bekleyen Fatura",
      value: (() => {
        const val = invoiceData.filter((i) => i.status === "Bekliyor").length;
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiAlertCircle className="w-7 h-7 text-yellow-500" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Tamamlanan Sipariş",
      value: (() => {
        // DELIVERED ve CONFIRMED statüleri tamamlanan olarak sayılacak
        const val = salesData.filter((s) => s.status === "DELIVERED" || s.status === "CONFIRMED").reduce((sum, s) => sum + (typeof s.amount === 'number' && !isNaN(s.amount) ? s.amount : 0), 0);
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiTrendingUp className="w-7 h-7 text-green-600" />,
      bg: "bg-green-100",
      isMoney: true,
    },
    {
      label: "Bekleyen Sipariş",
      value: (() => {
        // PENDING ve PROCESSING statüleri bekleyen olarak sayılacak
        const val = salesData.filter((s) => s.status === "PENDING" || s.status === "PROCESSING").reduce((sum, s) => sum + (typeof s.amount === 'number' && !isNaN(s.amount) ? s.amount : 0), 0);
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiAlertCircle className="w-7 h-7 text-yellow-500" />,
      bg: "bg-yellow-50",
      isMoney: true,
    },
    {
      label: "Toplam Gelir",
      value: (() => {
        const val = financeReportData.filter((f) => f.type === "Gelir").reduce((s, f) => s + (typeof f.amount === 'number' && !isNaN(f.amount) ? f.amount : 0), 0);
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiTrendingUp className="w-7 h-7 text-green-600" />,
      bg: "bg-green-100",
      isMoney: true,
    },
    {
      label: "Toplam Gider",
      value: (() => {
        const val = financeReportData.filter((f) => f.type === "Gider").reduce((s, f) => s + (typeof f.amount === 'number' && !isNaN(f.amount) ? f.amount : 0), 0);
        return isNaN(val) ? 0 : val;
      })(),
      icon: <FiTrendingDown className="w-7 h-7 text-red-500" />,
      bg: "bg-red-100",
      isMoney: true,
    },
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
  const handleExportExcel = () => {
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
        rows = customerReportData.map((d) => [d.name, d.invoiceCount, d.totalAmount]);
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
  // (tekrar tanımlama kaldırıldı)
  useEffect(() => { // İlk yüklemede ürünleri çek
    if (activeTab === 'products') {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProductReportData(data.products || []));
    }
  }, [activeTab]);
        return;
    }
    if (rows.length === 0) {
      alert("Tablo verisi bulunamadı.");
      return;
    }
    try {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
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
    <div className="p-6 space-y-6 print-area">
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
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm hover:bg-gray-50"
            title="Yazdır"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((t) => {
          const active = activeTab === (t.key as TabKey);
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TabKey)}
              className={`px-4 py-2 text-sm rounded-t-lg ${
                active
                  ? "bg-white border-x border-t -mb-px"
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
        {/* SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {summaryCards.map((c, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-5 rounded-xl shadow-sm ${c.bg}`}>
                  {c.icon}
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-1">{c.label}</div>
                    <div className="text-2xl font-bold">
                      {typeof c.value === "number" && c.isMoney ? formatCurrency(c.value) : c.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-gray-400 text-lg">Özet grafikleri burada gösterilebilir.</span>
            </div>
          </div>
        )}

        {/* INVOICES */}
        {activeTab === "invoices" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Fatura</div>
                  <div className="text-2xl font-bold">{invoiceData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiCreditCard className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Ödenen Tutar</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(invoiceData.filter((i) => i.status === "Ödendi").reduce((s, i) => s + i.amount, 0))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiAlertCircle className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Bekleyen Fatura</div>
                  <div className="text-2xl font-bold">{invoiceData.filter((i) => i.status === "Bekliyor").length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-invoices" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Fatura No</th>
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                    <th className="py-2 px-3 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-mono">{inv.id}</td>
                      <td className="py-2 px-3">{inv.customer}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(inv.amount)}</td>
                      <td className="py-2 px-3">{inv.date}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            inv.status === "Ödendi"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inv.status}
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
        {activeTab === "sales" && (
          <div className="space-y-8">
            {/* Stat card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiTrendingUp className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Satış</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(salesData.reduce((sum, s) => sum + s.amount, 0))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiCreditCard className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Tamamlanan</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      salesData.filter((s) => s.status === "Tamamlandı").reduce((sum, s) => sum + s.amount, 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiAlertCircle className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Bekleyen</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      salesData.filter((s) => s.status === "Bekliyor").reduce((sum, s) => sum + s.amount, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Tablo */}
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-sales" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
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
                    <tr key={sale.id} className="border-b last:border-0 hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-mono">{sale.id}</td>
                      <td className="py-2 px-3">{sale.product}</td>
                      <td className="py-2 px-3">{sale.customer}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(sale.amount)}</td>
                      <td className="py-2 px-3">{sale.date}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            sale.status === "Tamamlandı"
                              ? "bg-green-100 text-green-700"
                              : sale.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Grafik placeholder */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-gray-400 text-lg">Satış grafiği veya analiz burada gösterilecek.</span>
            </div>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Müşteri</div>
                  <div className="text-2xl font-bold">{customerReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiCreditCard className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Fatura</div>
                  <div className="text-2xl font-bold">
                    {customerReportData.reduce((sum, c) => sum + c.invoiceCount, 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiTrendingUp className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Tutar</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(customerReportData.reduce((sum, c) => sum + c.totalAmount, 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-customers" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Fatura Sayısı</th>
                    <th className="py-2 px-3 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerReportData.map((cust) => (
                    <tr key={cust.id} className="border-b last:border-0 hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-semibold">{cust.name}</td>
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
                          const total = invoices.reduce((sum, inv) => sum + (typeof inv.amount === 'number' && !isNaN(inv.amount) ? inv.amount : 0), 0);
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
        {activeTab === "stock" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Ürün</div>
                  <div className="text-2xl font-bold">{stockReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiTrendingUp className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Stok</div>
                  <div className="text-2xl font-bold">
                    {stockReportData.reduce((sum, s) => sum + s.stock, 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiAlertCircle className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Min. Stok Altı</div>
                  <div className="text-2xl font-bold">
                    {stockReportData.filter((s) => s.stock < s.min).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-stock" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Ürün</th>
                    <th className="py-2 px-3 text-right">Stok</th>
                    <th className="py-2 px-3 text-right">Min. Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReportData.map((prd) => (
                    <tr key={prd.id} className="border-b last:border-0 hover:bg-blue-50/40">
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
        {activeTab === "finance" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiTrendingUp className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Gelir</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      financeReportData.filter((f) => f.type === "Gelir").reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-red-50">
                <FiTrendingDown className="w-7 h-7 text-red-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Gider</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      financeReportData.filter((f) => f.type === "Gider").reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">İşlem Sayısı</div>
                  <div className="text-2xl font-bold">{financeReportData.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-finance" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Tip</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {financeReportData.map((f) => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-blue-50/40">
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
        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Ürün</div>
                  <div className="text-2xl font-bold">{productReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiTrendingUp className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Satış</div>
                  <div className="text-2xl font-bold">
                    {productReportData.reduce((sum, p) => sum + (p.sales || 0), 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiCreditCard className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Ciro</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(productReportData.reduce((sum, p) => sum + ((p.sales || 0) * (p.price || 0)), 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-products" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Ürün</th>
                    <th className="py-2 px-3 text-right">Satış</th>
                    <th className="py-2 px-3 text-right">Ciro</th>
                  </tr>
                </thead>
                <tbody>
                  {productReportData.filter(prd => (prd.sales || 0) > 0).map((prd) => (
                    <tr key={prd.id} className="border-b last:border-0 hover:bg-blue-50/40">
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
        {activeTab === "orders" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
                <FiFileText className="w-7 h-7 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Toplam Sipariş</div>
                  <div className="text-2xl font-bold">{orderReportData.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
                <FiCreditCard className="w-7 h-7 text-green-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Tamamlanan</div>
                  <div className="text-2xl font-bold">{orderReportData.filter((o) => o.status === "Tamamlandı").length}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
                <FiAlertCircle className="w-7 h-7 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">Bekleyen</div>
                  <div className="text-2xl font-bold">{orderReportData.filter((o) => o.status === "Bekliyor").length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto" style={{ background: "#fff" }}>
              <table id="report-table-orders" className="min-w-full text-sm" style={{ background: "#fff" }}>
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 px-3 text-left">Sipariş No</th>
                    <th className="py-2 px-3 text-left">Müşteri</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                    <th className="py-2 px-3 text-left">Tarih</th>
                    <th className="py-2 px-3 text-left">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {orderReportData.map((ord) => (
                    <tr key={ord.id} className="border-b last:border-0 hover:bg-blue-50/40">
                      <td className="py-2 px-3 font-mono">{ord.id}</td>
                      <td className="py-2 px-3">{ord.customer}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(ord.total)}</td>
                      <td className="py-2 px-3">{ord.date}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            ord.status === "Tamamlandı"
                              ? "bg-green-100 text-green-700"
                              : ord.status === "Bekliyor"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ord.status}
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
  );
}
