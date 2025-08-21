import React, { useState } from 'react';

const REPORT_TABS = [
  { key: 'summary', label: 'Genel Özet' },
  { key: 'sales', label: 'Satış Raporu' },
  { key: 'customers', label: 'Müşteri Raporu' },
  { key: 'stock', label: 'Stok/Envanter' },
  { key: 'finance', label: 'Finansal Raporlar' },
  { key: 'products', label: 'Ürün Raporu' },
  { key: 'orders', label: 'Sipariş Raporu' },
];

export default function ReportsTabs({ activeTab, onTabChange }: { activeTab: string, onTabChange: (key: string) => void }) {
  return (
    <div className="flex gap-2 border-b mb-8">
      {REPORT_TABS.map(tab => (
        <button
          key={tab.key}
          className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
