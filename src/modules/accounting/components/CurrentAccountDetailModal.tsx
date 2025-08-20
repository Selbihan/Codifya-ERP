import React from "react";

type TypeLabels = {
  [key: string]: { label: string; color: string; icon: string };
};

type DetailTab = "genel" | "hareketler" | "dokumanlar";
interface CurrentAccountDetailModalProps {
  selectedDetail: any | null;
  detailTab: DetailTab;
  setDetailTab: (tab: DetailTab) => void;
  openEdit: (acc: any) => void;
  handleDelete: (id: string | undefined) => void;
  setSelectedDetail: (acc: any | null) => void;
  typeLabels: TypeLabels;
}

const CurrentAccountDetailModal: React.FC<CurrentAccountDetailModalProps> = ({
  selectedDetail,
  detailTab,
  setDetailTab,
  openEdit,
  handleDelete,
  setSelectedDetail,
  typeLabels,
}) => {
  if (!selectedDetail) return null;
  const typeInfo = selectedDetail.type ? typeLabels[selectedDetail.type] : undefined;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl p-8 relative animate-slide-in-up sm:animate-slide-in-right">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setSelectedDetail(null)} aria-label="Kapat">×</button>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-3xl text-white font-bold">
            {selectedDetail.name?.charAt(0) || ''}
          </div>
          <div>
            <div className="font-bold text-xl">{selectedDetail.name || ''}</div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo?.color || 'bg-gray-100 text-gray-700'}`}>
              <span>{typeInfo?.icon || '❓'}</span> {typeInfo?.label || selectedDetail.type}
            </span>
          </div>
        </div>
        {/* Sekmeler */}
        <div className="flex gap-2 border-b mb-4">
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${detailTab==='genel' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'}`} onClick={() => setDetailTab('genel')}>Genel</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${detailTab==='hareketler' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'}`} onClick={() => setDetailTab('hareketler')}>Hareketler</button>
          <button className={`px-4 py-2 rounded-t-lg font-semibold ${detailTab==='dokumanlar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'}`} onClick={() => setDetailTab('dokumanlar')}>Dokümanlar</button>
        </div>
        {/* Sekme İçerikleri */}
        {detailTab==='genel' && (
          <div className="space-y-2">
            <div><b>Ad:</b> {selectedDetail.name || ''}</div>
            <div><b>Tip:</b> {typeInfo?.label || selectedDetail.type}</div>
            <div><b>Vergi No:</b> {selectedDetail.taxNumber || '-'}</div>
            {/* Buraya iletişim, adres, şube, özel kod, operasyon kodu, pasif/aktif vs. eklenebilir */}
          </div>
        )}
        {detailTab==='hareketler' && (
          <div className="text-gray-500 italic">Hareketler sekmesi (entegre edilmedi)</div>
        )}
        {detailTab==='dokumanlar' && (
          <div className="text-gray-500 italic">Dokümanlar sekmesi (entegre edilmedi)</div>
        )}
        <div className="mt-6 flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold shadow hover:scale-105 transition" onClick={() => { openEdit(selectedDetail); setSelectedDetail(null); }}>Düzenle</button>
          <button className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition" onClick={() => { if(selectedDetail.id) handleDelete(selectedDetail.id); setSelectedDetail(null); }}>Sil</button>
        </div>
      </div>
    </div>
  );
};

export default CurrentAccountDetailModal;
