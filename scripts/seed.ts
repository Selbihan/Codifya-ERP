import { PrismaClient } from '@prisma/client'

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
