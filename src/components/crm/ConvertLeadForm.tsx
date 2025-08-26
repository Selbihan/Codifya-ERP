import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ConvertLeadForm({ leadId, onClose }: { leadId: string, onClose: () => void }) {
  const [targetType, setTargetType] = useState<string>('CONTACT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string|null>(null);

  const handleConvert = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: targetType })
      });
      if (res.ok) {
        setResult('Başarıyla dönüştürüldü!');
      } else {
        setResult('Dönüştürme işlemi başarısız!');
      }
    } catch (e) {
      setResult('Bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1">Dönüştürülecek Tip</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={targetType}
          onChange={e => setTargetType(e.target.value)}
        >
          <option value="CONTACT">Contact</option>
          <option value="ACCOUNT">Account</option>
          <option value="ORDER">Order</option>
          <option value="OPPORTUNITY">Opportunity</option>
        </select>
      </div>
      {result && <div className={result.includes('Başarı') ? 'text-green-600' : 'text-red-600'}>{result}</div>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Kapat</Button>
        <Button variant="primary" onClick={handleConvert} disabled={loading}>{loading ? 'Dönüştürülüyor...' : 'Dönüştür'}</Button>
      </div>
    </div>
  );
}
