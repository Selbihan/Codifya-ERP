
"use client";
import { useState } from "react";
import { FiFileText, FiCreditCard, FiTrendingUp, FiTrendingDown, FiAlertCircle } from "react-icons/fi";

const tabs = [
  { key: "summary", label: "Özet" },
  { key: "invoices", label: "Faturalar" },
  { key: "sales", label: "Satışlar" },
  { key: "customers", label: "Müşteriler" },
  { key: "stock", label: "Stok" },
  { key: "finance", label: "Finans" },
  { key: "products", label: "Ürünler" },
  { key: "orders", label: "Siparişler" }
];

export default function ReportsPage() {
  // Müşteri raporu için örnek veri
  const customerData: any[] = [
    { id: "CUST-001", name: "Acme A.Ş.", total: 3, totalAmount: 32000 },
    { id: "CUST-002", name: "Beta Ltd.", total: 2, totalAmount: 11700 },
    { id: "CUST-003", name: "Gamma Tic.", total: 1, totalAmount: 4300 },
  ];

  const [activeTab, setActiveTab] = useState("summary");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const summary = [
    {
      label: "Toplam Fatura",
      value: 0,
      icon: <FiFileText className="w-7 h-7 text-blue-500" />,
      bg: "bg-blue-50"
    },
    {
      label: "Toplam Ödeme",
      value: 0,
      icon: <FiCreditCard className="w-7 h-7 text-green-500" />,
      bg: "bg-green-50"
    },
    {
      label: "Bekleyen",
      value: 0,
      icon: <FiAlertCircle className="w-7 h-7 text-yellow-500" />,
      bg: "bg-yellow-50"
    },
    {
      label: "Toplam Gelir",
      value: 0,
      icon: <FiTrendingUp className="w-7 h-7 text-green-600" />,
      bg: "bg-green-100"
    },
    {
      label: "Toplam Gider",
      value: 0,
      icon: <FiTrendingDown className="w-7 h-7 text-red-500" />,
      bg: "bg-red-100"
    }
  ];

  // Fatura tablosu için örnek veri
  const invoiceData: any[] = [
    { id: "INV-001", customer: "Acme A.Ş.", amount: 12000, date: "2025-08-01", status: "Ödendi" },
    { id: "INV-002", customer: "Beta Ltd.", amount: 8500, date: "2025-08-05", status: "Bekliyor" },
    { id: "INV-003", customer: "Gamma Tic.", amount: 4300, date: "2025-08-10", status: "İptal" },
  ];

  // Satış raporu için örnek veri
  const salesData: any[] = [
    { id: "SLS-001", product: "Laptop", customer: "Acme A.Ş.", amount: 18000, date: "2025-08-02", status: "Tamamlandı" },
    { id: "SLS-002", product: "Yazıcı", customer: "Beta Ltd.", amount: 3200, date: "2025-08-06", status: "Bekliyor" },
    { id: "SLS-003", product: "Monitör", customer: "Gamma Tic.", amount: 5400, date: "2025-08-12", status: "İptal" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8">Raporlar</h1>
      {/* Sekmeler */}
      <div className="flex gap-2 mb-8 border-b">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium rounded-t transition-all duration-200 border-b-2 -mb-px ${activeTab === tab.key ? "border-blue-600 text-blue-700 bg-white shadow" : "border-transparent text-gray-500 hover:text-blue-600"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
  {/* Üstteki filtre alanı kaldırıldı */}
      {/* Sekme içerikleri */}
      {activeTab === "summary" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {summary.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-5 rounded-xl shadow-sm ${item.bg} hover:shadow-md transition`}>
                <div>{item.icon}</div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-1">{item.label}</div>
                  <div className="text-2xl font-bold">₺ {item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[200px]">
            <span className="text-gray-400 text-lg">Detaylı rapor tablosu ve grafikler burada gösterilecek.</span>
          </div>
        </>
      )}
      {activeTab === "invoices" && (
        <div className="space-y-8">
          {/* Stat card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
              <FiFileText className="w-7 h-7 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Toplam Fatura</div>
                <div className="text-2xl font-bold">₺ {invoiceData.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
              <FiCreditCard className="w-7 h-7 text-green-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Ödenen</div>
                <div className="text-2xl font-bold">₺ {invoiceData.filter(i=>i.status==="Ödendi").reduce((sum,i)=>sum+i.amount,0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
              <FiAlertCircle className="w-7 h-7 text-yellow-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Bekleyen</div>
                <div className="text-2xl font-bold">₺ {invoiceData.filter(i=>i.status==="Bekliyor").reduce((sum,i)=>sum+i.amount,0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          {/* Tablo */}
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
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
                    <td className="py-2 px-3 text-right">₺ {inv.amount.toLocaleString()}</td>
                    <td className="py-2 px-3">{inv.date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status==="Ödendi" ? "bg-green-100 text-green-700" : inv.status==="Bekliyor" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* API entegrasyonu için burada veri çekilebilir */}
          </div>
        </div>
      )}
      {activeTab === "sales" && (
        <div className="space-y-8">
          {/* Stat card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-blue-50">
              <FiTrendingUp className="w-7 h-7 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Toplam Satış</div>
                <div className="text-2xl font-bold">₺ {salesData.reduce((sum: number, s: any) => sum + s.amount, 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-green-50">
              <FiCreditCard className="w-7 h-7 text-green-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Tamamlanan</div>
                <div className="text-2xl font-bold">₺ {salesData.filter((s: any)=>s.status==="Tamamlandı").reduce((sum: number,s: any)=>sum+s.amount,0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-xl shadow-sm bg-yellow-50">
              <FiAlertCircle className="w-7 h-7 text-yellow-500" />
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Bekleyen</div>
                <div className="text-2xl font-bold">₺ {salesData.filter((s: any)=>s.status==="Bekliyor").reduce((sum: number,s: any)=>sum+s.amount,0).toLocaleString()}</div>
              </div>
            </div>
          </div>
          {/* Tablo */}
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
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
                {salesData.map((sale: any) => (
                  <tr key={sale.id} className="border-b last:border-0 hover:bg-blue-50/40">
                    <td className="py-2 px-3 font-mono">{sale.id}</td>
                    <td className="py-2 px-3">{sale.product}</td>
                    <td className="py-2 px-3">{sale.customer}</td>
                    <td className="py-2 px-3 text-right">₺ {sale.amount.toLocaleString()}</td>
                    <td className="py-2 px-3">{sale.date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${sale.status==="Tamamlandı" ? "bg-green-100 text-green-700" : sale.status==="Bekliyor" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{sale.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Grafik veya analiz alanı */}
          <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[180px]">
            <span className="text-gray-400 text-lg">Satış grafiği veya analiz burada gösterilecek.</span>
          </div>
        </div>
      )}
      {activeTab !== "summary" && activeTab !== "invoices" && activeTab !== "sales" && (
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[200px]">
          <span className="text-gray-400 text-lg">{tabs.find(t => t.key === activeTab)?.label} raporu burada gösterilecek.</span>
        </div>
      )}
    </div>
  );
}

