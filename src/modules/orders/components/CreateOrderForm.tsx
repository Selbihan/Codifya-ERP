'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface OrderItemDraft {
  productId: string
  quantity: number
}

interface CreateOrderFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onSuccess, onCancel }) => {
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOptions, setCustomerOptions] = useState<Array<{ id: string; name: string; email?: string | null }>>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [discount, setDiscount] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OrderItemDraft[]>([{ productId: '', quantity: 1 }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateItem = (index: number, patch: Partial<OrderItemDraft>) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...patch } : it))
  }
  const addItem = () => setItems(prev => [...prev, { productId: '', quantity: 1 }])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const canSubmit = customerId.trim() !== '' && items.every(i => i.productId.trim() !== '' && i.quantity > 0)

  // Müşteri arama debounce
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (!showCustomerDropdown) return
      try {
        setLoadingCustomers(true)
        const params = new URLSearchParams({ page: '1', limit: '10' })
        if (customerSearch.trim()) params.append('search', customerSearch.trim())
        const res = await fetch(`/api/crm/customers?${params.toString()}`, { signal: controller.signal })
        const json = await res.json()
        if (active && res.ok && json.success && json.data?.customers) {
          setCustomerOptions(json.data.customers)
        }
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          // sessiz geç
        }
      } finally {
        active && setLoadingCustomers(false)
      }
    }, 300)
    return () => { active = false; controller.abort(); clearTimeout(timer) }
  }, [customerSearch, showCustomerDropdown])

  // Dropdown dışında tıklayınca kapat
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    if (showCustomerDropdown) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showCustomerDropdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId.trim(),
          items: items.map(i => ({ productId: i.productId.trim(), quantity: i.quantity })),
          discount: discount === '' ? undefined : Number(discount),
          notes: notes.trim() || undefined
        })
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || 'Sipariş oluşturulamadı')
      }
      onSuccess()
      // reset
      setCustomerId('')
      setDiscount('')
      setNotes('')
      setItems([{ productId: '', quantity: 1 }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-sm font-semibold">Yeni Sipariş</h3>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-medium mb-1">Müşteri *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={customerId ? customerOptions.find(o => o.id === customerId)?.name || customerSearch : customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); if (customerId) setCustomerId(''); }}
                onFocus={() => { setShowCustomerDropdown(true); if (customerOptions.length === 0) setCustomerSearch('') }}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Müşteri ara / seç"
                required
              />
            </div>
            {customerId && (
              <button
                type="button"
                onClick={() => { setCustomerId(''); setCustomerSearch(''); setShowCustomerDropdown(true) }}
                className="px-2 text-xs border rounded bg-gray-50 hover:bg-gray-100"
              >Değiştir</button>
            )}
          </div>
          {showCustomerDropdown && (
            <div className="absolute z-30 mt-1 w-full bg-white border rounded shadow-sm max-h-60 overflow-auto text-sm">
              <div className="sticky top-0 bg-white border-b px-3 py-1.5 text-[11px] text-gray-500 flex justify-between items-center">
                <span>{loadingCustomers ? 'Yükleniyor...' : 'Sonuçlar'}</span>
                <button type="button" onClick={() => setShowCustomerDropdown(false)} className="text-gray-400 hover:text-gray-600 text-[10px]">Kapat</button>
              </div>
              {!loadingCustomers && customerOptions.length === 0 && (
                <div className="px-3 py-2 text-[11px] text-gray-500">Kayıt bulunamadı</div>
              )}
              {customerOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setCustomerId(opt.id); setShowCustomerDropdown(false) }}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${customerId === opt.id ? 'bg-blue-50 font-medium' : ''}`}
                >
                  <div className="text-xs text-gray-700">{opt.name}</div>
                  {opt.email && <div className="text-[10px] text-gray-500">{opt.email}</div>}
                </button>
              ))}
            </div>
          )}
          <input type="hidden" name="customerId" value={customerId} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">İndirim (₺)</label>
          <input
            type="number"
            value={discount}
            onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full border rounded px-3 py-2 text-sm"
            min={0}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1">Notlar</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full border rounded px-3 py-2 text-sm resize-y"
            placeholder="Opsiyonel açıklama"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Ürün Listesi *</span>
          <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ Ürün Ekle</button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={item.productId}
                onChange={e => updateItem(idx, { productId: e.target.value })}
                placeholder="Ürün ID"
                className="col-span-6 md:col-span-5 border rounded px-2 py-1.5 text-xs"
                required
              />
              <input
                type="number"
                value={item.quantity}
                min={1}
                onChange={e => updateItem(idx, { quantity: Number(e.target.value) })}
                className="col-span-4 md:col-span-3 border rounded px-2 py-1.5 text-xs"
                required
              />
              <div className="col-span-2 md:col-span-2 flex justify-end">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-[10px] text-red-600 hover:underline">Sil</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>İptal</Button>
        <Button type="submit" size="sm" disabled={!canSubmit || submitting}>{submitting ? 'Kaydediliyor...' : 'Kaydet'}</Button>
      </div>
      <p className="text-[10px] text-gray-500">Not: Ürün fiyatları backend'de henüz hesaplanmıyor (0). Daha sonra fiyat lookup entegre edilecek.</p>
    </form>
  )
}
