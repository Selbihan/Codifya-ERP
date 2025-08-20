const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Kategoriler oluştur
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Elektronik', isActive: true },
      { name: 'Ofis', isActive: true },
      { name: 'Kırtasiye', isActive: true },
      { name: 'Yazılım', isActive: true },
      { name: 'Donanım', isActive: true }
    ],
    skipDuplicates: true
  });

  // Kategorileri tekrar çek (id'ler için)
  const allCategories = await prisma.category.findMany();

  // 100 ürün oluştur
  for (let i = 1; i <= 100; i++) {
    const category = allCategories[Math.floor(Math.random() * allCategories.length)];
    await prisma.product.create({
      data: {
        name: `Ürün ${i}`,
        description: `Açıklama ${i}`,
        sku: `SKU${i}`,
        price: Math.floor(Math.random() * 1000) + 10,
        cost: Math.floor(Math.random() * 500) + 5,
        stock: Math.floor(Math.random() * 100),
        minStock: 5,
        isActive: true,
        categoryId: category.id,
        createdBy: 1 // Gerekirse mevcut bir user id kullanın
      }
    });
  }

  console.log('100 ürün ve kategoriler başarıyla eklendi!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
