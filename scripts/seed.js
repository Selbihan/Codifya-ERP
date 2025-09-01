const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Önce mevcut müşterileri kontrol et ve ekle
  const customer1 = await prisma.customer.findFirst({ where: { email: 'ahmet@example.com' } }) ||
    await prisma.customer.create({
      data: {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+90 555 123 4567',
        address: 'İstanbul, Türkiye',
        taxNumber: '1234567890',
        createdBy: 1
      }
    })

  const customer2 = await prisma.customer.findFirst({ where: { email: 'fatma@example.com' } }) ||
    await prisma.customer.create({
      data: {
        name: 'Fatma Demir',
        email: 'fatma@example.com',
        phone: '+90 555 987 6543',
        address: 'Ankara, Türkiye',
        taxNumber: '0987654321',
        createdBy: 1
      }
    })

  const customer3 = await prisma.customer.findFirst({ where: { email: 'mehmet@example.com' } }) ||
    await prisma.customer.create({
      data: {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        phone: '+90 555 555 5555',
        address: 'İzmir, Türkiye',
        taxNumber: '5555555555',
        createdBy: 1
      }
    })

  const customers = [customer1, customer2, customer3]

  // Önce kategoriler oluştur
  const category1 = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'Elektronik',
      description: 'Elektronik ürünler'
    }
  })

  const category2 = await prisma.category.upsert({
    where: { id: 'cat-2' },
    update: {},
    create: {
      id: 'cat-2',
      name: 'Giyim', 
      description: 'Giyim ürünleri'
    }
  })

  // Örnek ürünler
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'PROD-001' },
      update: {},
      create: {
        name: 'Laptop',
        sku: 'PROD-001',
        price: 15000.00,
        cost: 12000.00,
        stock: 10,
        categoryId: category1.id,
        createdBy: 1
      }
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-002' },
      update: {},
      create: {
        name: 'Mouse',
        sku: 'PROD-002',
        price: 250.00,
        cost: 180.00,
        stock: 50,
        categoryId: category1.id,
        createdBy: 1
      }
    }),
    prisma.product.upsert({
      where: { sku: 'PROD-003' },
      update: {},
      create: {
        name: 'T-Shirt',
        sku: 'PROD-003',
        price: 150.00,
        cost: 80.00,
        stock: 100,
        categoryId: category2.id,
        createdBy: 1
      }
    })
  ])

  // Örnek siparişler
  const orders = await Promise.all([
    prisma.order.upsert({
      where: { id: 'order-1' },
      update: {},
      create: {
        id: 'order-1',
        orderNumber: 'ORD-2024-001',
        customerId: customers[0].id,
        totalAmount: 1500.00,
        status: 'DELIVERED',
        orderDate: new Date('2024-01-15'),
        createdBy: 1
      }
    }),
    prisma.order.upsert({
      where: { id: 'order-2' },
      update: {},
      create: {
        id: 'order-2',
        orderNumber: 'ORD-2024-002',
        customerId: customers[1].id,
        totalAmount: 2300.00,
        status: 'PROCESSING',
        orderDate: new Date('2024-02-01'),
        createdBy: 1
      }
    }),
    prisma.order.upsert({
      where: { id: 'order-3' },
      update: {},
      create: {
        id: 'order-3',
        orderNumber: 'ORD-2024-003',
        customerId: customers[2].id,
        totalAmount: 950.00,
        status: 'PENDING',
        orderDate: new Date('2024-02-10'),
        createdBy: 1
      }
    })
  ])

  // Sipariş kalemleri
  const orderItems = await Promise.all([
    // Order 1 items - Laptop (1 adet)
    prisma.orderItem.upsert({
      where: { id: 'item-1' },
      update: {},
      create: {
        id: 'item-1',
        orderId: orders[0].id,
        productId: products[0].id,
        quantity: 1,
        price: 15000.00,
        total: 15000.00
      }
    }),
    // Order 2 items - Mouse (2 adet) + T-Shirt (5 adet)  
    prisma.orderItem.upsert({
      where: { id: 'item-2' },
      update: {},
      create: {
        id: 'item-2',
        orderId: orders[1].id,
        productId: products[1].id,
        quantity: 2,
        price: 250.00,
        total: 500.00
      }
    }),
    prisma.orderItem.upsert({
      where: { id: 'item-3' },
      update: {},
      create: {
        id: 'item-3',
        orderId: orders[1].id,
        productId: products[2].id,
        quantity: 5,
        price: 150.00,
        total: 750.00
      }
    }),
    // Order 3 items - T-Shirt (3 adet) + Mouse (2 adet)
    prisma.orderItem.upsert({
      where: { id: 'item-4' },
      update: {},
      create: {
        id: 'item-4',
        orderId: orders[2].id,
        productId: products[2].id,
        quantity: 3,
        price: 150.00,
        total: 450.00
      }
    }),
    prisma.orderItem.upsert({
      where: { id: 'item-5' },
      update: {},
      create: {
        id: 'item-5',
        orderId: orders[2].id,
        productId: products[1].id,
        quantity: 2,
        price: 250.00,
        total: 500.00
      }
    })
  ])

  // Order totalAmount'larını gerçek hesaplamalara göre güncelle
  await prisma.order.update({
    where: { id: 'order-1' },
    data: { totalAmount: 15000.00 } // 1 x 15000
  })
  
  await prisma.order.update({
    where: { id: 'order-2' },
    data: { totalAmount: 1250.00 } // (2 x 250) + (5 x 150) = 500 + 750 = 1250
  })
  
  await prisma.order.update({
    where: { id: 'order-3' },
    data: { totalAmount: 950.00 } // (3 x 150) + (2 x 250) = 450 + 500 = 950
  })

  // Örnek faturalar
  const invoices = await Promise.all([
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2024-001' },
      update: {},
      create: {
        invoiceNumber: 'INV-2024-001',
        customerId: customers[0].id,
        orderId: orders[0].id,
        totalAmount: 1500.00,
        subtotal: 1230.00,
        taxAmount: 270.00,
        type: 'SALES',
        status: 'PAID',
        issueDate: new Date('2024-01-16'),
        dueDate: new Date('2024-02-15'),
        createdBy: 1
      }
    }),
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2024-002' },
      update: {},
      create: {
        invoiceNumber: 'INV-2024-002',
        customerId: customers[1].id,
        orderId: orders[1].id,
        totalAmount: 2300.00,
        subtotal: 1886.00,
        taxAmount: 414.00,
        type: 'SALES',
        status: 'SENT',
        issueDate: new Date('2024-02-02'),
        dueDate: new Date('2024-03-02'),
        createdBy: 1
      }
    }),
    prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2024-003' },
      update: {},
      create: {
        invoiceNumber: 'INV-2024-003',
        customerId: customers[2].id,
        orderId: orders[2].id,
        totalAmount: 950.00,
        subtotal: 779.00,
        taxAmount: 171.00,
        type: 'SALES',
        status: 'DRAFT',
        issueDate: new Date('2024-02-11'),
        dueDate: new Date('2024-03-11'),
        createdBy: 1
      }
    })
  ])

  // Örnek ödemeler
  await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        orderId: orders[0].id,
        amount: 1500.00,
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        reference: 'PAY-2024-001',
        paymentDate: new Date('2024-01-20')
      }
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        orderId: orders[1].id,
        amount: 1000.00,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        reference: 'PAY-2024-002',
        paymentDate: new Date('2024-02-05')
      }
    })
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
