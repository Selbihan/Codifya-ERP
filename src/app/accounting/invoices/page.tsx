import InvoiceList from '../../../modules/accounting.backup/components/InvoiceList';

export default function InvoicesPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Faturalar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Toplam Fatura</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Ödenen</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-gray-500">Bekleyen</div>
          <div className="text-2xl font-bold">₺ 0</div>
        </div>
      </div>
      <InvoiceList />
    </div>
  );
}
