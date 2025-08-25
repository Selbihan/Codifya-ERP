
'use client'


import type { Payment } from '../../../modules/accounting.backup/types';
import PaymentList from '../../../modules/accounting.backup/components/PaymentList';

export default function PaymentsPage() {
  // İşlem fonksiyonları
  const handleView = (payment: Payment) => {
    alert('Görüntüle: ' + (payment?.id || ''));
  };
  const handleEdit = (payment: Payment) => {
    alert('Düzenle: ' + (payment?.id || ''));
  };
  const handleDelete = (payment: Payment) => {
    if (window.confirm('Silmek istediğinize emin misiniz?')) {
      alert('Silindi: ' + (payment?.id || ''));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Ödemeler</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Ödeme</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Tamamlanan</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Bekleyen</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
      </div>
      <PaymentList onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
