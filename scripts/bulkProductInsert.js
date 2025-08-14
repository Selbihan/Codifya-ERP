const API_URL = 'http://localhost:3000/api/inventory/products'; // Gerekirse portu ve adresi değiştirin
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const FAKE_API = 'https://fakestoreapi.com/products';

const USERNAME = 'test1deneme';
const PASSWORD = 'Test12345';

async function loginAndGetCookie() {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: USERNAME, password: PASSWORD })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Login failed: ' + text);
  }
  // Cookie header'ı al
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('Login cookie alınamadı!');
  // Sadece token kısmını al
  const tokenCookie = setCookie.split(';')[0];
  return tokenCookie;
}

async function fetchFakeProducts() {
  const res = await fetch(FAKE_API);
  if (!res.ok) throw new Error('Fake Store API erişilemedi');
  const products = await res.json();
  return products;
}

async function addProducts() {
  try {
    const cookie = await loginAndGetCookie();
    const fakeProducts = await fetchFakeProducts();
    for (const p of fakeProducts) {
      const product = {
        name: p.title,
        description: p.description,
        sku: 'SKU' + Math.floor(Math.random() * 1000000),
        price: Math.round(Number(p.price)),
        cost: Math.round(Number(p.price) * 0.7),
        stock: Math.floor(Math.random() * 100) + 1,
        minStock: Math.floor(Math.random() * 10) + 1,
        categoryId: undefined // Gerekirse bir kategori ID'si ekleyin
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        },
        body: JSON.stringify(product)
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(`Hata: ${text}`);
      } else {
        console.log(`Eklendi: ${product.name}`);
      }
    }
  } catch (err) {
    console.error('Hata:', err.message);
  }
}

addProducts();
