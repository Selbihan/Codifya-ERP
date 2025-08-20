import PaymentList from '../../modules/accounting.backup/components/PaymentList';

// Muhasebe > Ödemeler sayfası (detaylı DataTable, filtre, modal, özet)
export default function PaymentsPage() {
  // Burada API'den veri çekme, modal state ve handler'lar eklenebilir
  // Şimdilik örnek veri ile gösterim
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Ödemeler</h1>
      {/* Özet kutuları */}
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
      {/* Ödeme Listesi */}
      <PaymentList />
    </div>
  );
}
