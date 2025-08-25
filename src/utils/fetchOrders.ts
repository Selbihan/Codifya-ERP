// Siparişleri çekmek için kullanılacak yardımcı fonksiyon
export async function fetchOrders() {
  const res = await fetch('/api/orders/report');
  if (!res.ok) return [];
  const data = await res.json();
  return data.orders || [];
}
